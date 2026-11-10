// Complete UI & Rehearsal Controller for Scene Partner.
//
// Manages the three main views:
//   1. Library & Script Upload (`state.screen === 'library'`)
//   2. Casting, Voice Assignment & Scene Selection (`state.screen === 'setup'`)
//   3. Karaoke Rehearsal Stage (`state.screen === 'rehearsal'`)
// Plus the Green Room Settings & Cloud Sync drawer.

import {
  state,
  saveState,
  THEMES,
  THEME_ORDER,
  CUE_VISIBILITY_MODES,
  isSafeObjectKey,
  logRehearsalSession,
  backupCopy,
  readBackup,
  restoreBackup
} from './state.js';
import {
  TOLERANCE_LEVELS,
  TOLERANCE_ORDER,
  tokenizeLine,
  evaluateSpokenLine,
  detectSpokenPromptRequest
} from './matcher.js';
import {
  VOICE_PROFILES,
  STAGE_DIRECTION_VOICE,
  assignVoicesToCharacters,
  getVoiceProfile,
  speakCharacterLine,
  prefetchCharacterLine,
  stopAllSpeaking,
  startListening,
  stopListening,
  playYourCueChime,
  playLineCompleteChime,
  playCurtainChord,
  setSoundEnabled,
  hasOpenAiKey,
  saveVoiceApiKey,
  clearVoiceApiKey,
  voiceEngineStatus,
  testOpenAiVoiceConnection,
  onVoiceStatusChange
} from './voice.js';
import { getAllPlays, getPlayById, groupPlaysByPlaywright } from './library.js';
import { extractTextFromPdf, parseScriptText, MAX_PDF_BYTES, MAX_TEXT_BYTES } from './pdf.js';
import { cloudStatus, onCloudStatus, setCloudToken, clearCloudToken, syncWithCloud } from './cloud.js';

const $ = (id) => document.getElementById(id);

// Transient UI state (not persisted on every keystroke)
let searchQuery = '';
let selectedPlaywrightFilter = 'ALL';
let verbatimOnlyFilter = false;
let liveSpokenTranscript = '';
let liveEvaluation = null;
let partnerActiveWordIndex = -1;
let partnerAudioLoading = false;
let micStatus = 'idle'; // 'idle' | 'listening' | 'blocked' | 'unsupported' | 'warning'
let statusNotice = '';
let settingsOpen = false;
let settingsTab = 'rehearsal'; // 'rehearsal' | 'voices' | 'cloud'
let pasteModalOpen = false;
let curtainModalOpen = false;
let autoAdvanceTimer = null;
let pauseGraceTimer = null;
let screenWakeLock = null;

const THEME_META_COLORS = {
  shakespearean: '#efe6d1',
  modern: '#0f0d0c',
  'high-visibility': '#000000',
  daylight: '#f4f4f0'
};

export function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeCssColor(color) {
  return typeof color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : '#9ca3af';
}

export function getActivePlay() {
  return getPlayById(state.selectedPlayId, state.customPlays);
}

export function getActiveScene(play = getActivePlay()) {
  if (!play || !Array.isArray(play.scenes) || !play.scenes.length) {
    return { id: 'empty', title: 'Empty Scene', lines: [] };
  }
  return play.scenes.find((s) => s.id === state.selectedSceneId) || play.scenes[0];
}

export function isUserCharacter(speaker) {
  const clean = String(speaker || '').trim().toUpperCase();
  return state.selectedCharacters.some((c) => c.trim().toUpperCase() === clean);
}

export function applyThemeToDom() {
  const theme = THEMES[state.settings.theme] ? state.settings.theme : 'shakespearean';
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.setProperty('--script-scale', String(state.settings.fontScale || 1));
  const metaTheme = document.getElementById('meta-theme-color');
  if (metaTheme) {
    metaTheme.setAttribute('content', THEME_META_COLORS[theme] || '#efe6d1');
  }
  setSoundEnabled(state.settings.sound);
}

async function syncScreenWakeLock() {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
  const shouldHold = state.screen === 'rehearsal' && state.rehearsal.playing;
  if (shouldHold && !screenWakeLock) {
    try {
      screenWakeLock = await navigator.wakeLock.request('screen');
      screenWakeLock.addEventListener?.('release', () => {
        screenWakeLock = null;
      });
    } catch (e) {}
  } else if (!shouldHold && screenWakeLock) {
    try {
      await screenWakeLock.release();
    } catch (e) {}
    screenWakeLock = null;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncScreenWakeLock();
    }
  });
}

// ---------- Navigation & Screen Switching ----------

export function navigateTo(screen) {
  stopRehearsalPlayback();
  curtainModalOpen = false;
  state.screen = screen;
  saveState();
  renderApp();
}

export function selectPlay(playId) {
  stopRehearsalPlayback();
  const play = getPlayById(playId, state.customPlays);
  if (!play) return;
  state.selectedPlayId = play.id;
  state.selectedSceneId = play.scenes[0]?.id || '';
  // Default to the character with the most lines if current selection isn't in this play
  const validChars = state.selectedCharacters.filter((c) => play.characters.includes(c));
  state.selectedCharacters = validChars.length ? validChars : (play.characters[0] ? [play.characters[0]] : []);
  state.rehearsal.lineIndex = 0;
  state.rehearsal.lineStats = {};
  state.screen = 'setup';
  saveState();
  renderApp();
}

export function toggleCharacterSelection(charName) {
  const name = String(charName || '').trim();
  if (!name) return;
  const exists = state.selectedCharacters.includes(name);
  if (exists) {
    if (state.selectedCharacters.length > 1) {
      state.selectedCharacters = state.selectedCharacters.filter((c) => c !== name);
    }
  } else {
    state.selectedCharacters = [...state.selectedCharacters, name];
  }
  saveState();
  renderApp();
}

export function selectScene(sceneId) {
  const play = getActivePlay();
  const found = play.scenes.find((s) => s.id === sceneId);
  if (!found) return;
  state.selectedSceneId = found.id;
  state.rehearsal.lineIndex = 0;
  state.rehearsal.lineStats = {};
  saveState();
  renderApp();
}

export function setCharacterVoice(charName, voiceId) {
  if (!charName || !voiceId || !isSafeObjectKey(charName)) return;
  if (!VOICE_PROFILES.some((v) => v.id === voiceId)) return;
  state.voiceOverrides[charName] = voiceId;
  saveState();
  const profile = getVoiceProfile(voiceId);
  speakCharacterLine(`Hello, I will read the lines for ${formatSpeakerName(charName)}.`, profile, {
    speed: state.settings.voiceSpeed
  });
  renderApp();
}

export function previewCharacterVoice(charName) {
  const play = getActivePlay();
  const voiceMap = assignVoicesToCharacters(play.characters, state.voiceOverrides);
  const profile = voiceMap[charName] || VOICE_PROFILES[0];
  const sampleLine = play.scenes
    .flatMap((s) => s.lines)
    .find((l) => l.speaker === charName)?.text || `Speak the speech, I pray you, as I pronounced it to you.`;
  speakCharacterLine(sampleLine.slice(0, 140), profile, {
    speed: state.settings.voiceSpeed
  });
}

// ---------- Rehearsal Playback & Karaoke Loop ----------

export function startSceneRehearsal(startFromBeginning = false) {
  const play = getActivePlay();
  const scene = getActiveScene(play);
  if (startFromBeginning || state.rehearsal.lineIndex >= scene.lines.length) {
    state.rehearsal.lineIndex = 0;
    state.rehearsal.lineStats = {};
  }
  if (state.settings.cueToCue) {
    jumpToFirstCueWindow(scene);
  }
  state.screen = 'rehearsal';
  state.rehearsal.playing = true;
  curtainModalOpen = false;
  saveState();
  renderApp();
  runCurrentLineTurn();
}

function jumpToFirstCueWindow(scene) {
  const idx = scene.lines.findIndex((l) => isUserCharacter(l.speaker));
  if (idx > 1) {
    state.rehearsal.lineIndex = idx - 1; // Start 1 line before the user's first cue
  }
}

export function stopRehearsalPlayback() {
  state.rehearsal.playing = false;
  clearTimeout(autoAdvanceTimer);
  clearTimeout(pauseGraceTimer);
  autoAdvanceTimer = null;
  pauseGraceTimer = null;
  partnerAudioLoading = false;
  stopAllSpeaking();
  stopListening();
  partnerActiveWordIndex = -1;
  syncScreenWakeLock();
}

export function togglePlayPauseRehearsal() {
  if (state.rehearsal.playing) {
    stopRehearsalPlayback();
    renderApp();
  } else {
    state.rehearsal.playing = true;
    renderApp();
    runCurrentLineTurn();
  }
}

export function stepLine(delta) {
  const scene = getActiveScene();
  if (!scene.lines.length) return;
  const wasPlaying = state.rehearsal.playing;
  stopRehearsalPlayback();
  const next = Math.max(0, Math.min(scene.lines.length - 1, state.rehearsal.lineIndex + delta));
  state.rehearsal.lineIndex = next;
  state.rehearsal.revealedHints = 0;
  liveSpokenTranscript = '';
  liveEvaluation = null;
  state.rehearsal.playing = wasPlaying;
  saveState();
  renderApp();
  if (wasPlaying) runCurrentLineTurn();
}

export function jumpToLine(index) {
  const scene = getActiveScene();
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0 || idx >= scene.lines.length) return;
  const wasPlaying = state.rehearsal.playing;
  stopRehearsalPlayback();
  state.rehearsal.lineIndex = idx;
  state.rehearsal.revealedHints = 0;
  liveSpokenTranscript = '';
  liveEvaluation = null;
  state.rehearsal.playing = wasPlaying;
  saveState();
  renderApp();
  if (wasPlaying) runCurrentLineTurn();
}

// Prompt / "Line!" button: reveals & speaks the next few words of the actor's line
export function requestLinePrompt() {
  const play = getActivePlay();
  const scene = getActiveScene(play);
  const currentLine = scene.lines[state.rehearsal.lineIndex];
  if (!currentLine) return;

  const tokens = tokenizeLine(currentLine.text);
  // Advance past whichever is further: spoken word cursor OR previously revealed hints
  let startWord = Math.max(
    liveEvaluation ? liveEvaluation.activeIndex : 0,
    state.rehearsal.revealedHints
  );
  if (startWord >= tokens.length) {
    startWord = Math.max(0, tokens.length - 5);
  }
  const promptSlice = tokens.slice(startWord, startWord + 5).map((t) => t.display).join(' ');

  state.rehearsal.revealedHints = Math.min(tokens.length, startWord + 5);
  const stat = state.rehearsal.lineStats[state.rehearsal.lineIndex] || { accuracy: 0, attempts: 1, prompted: false };
  stat.prompted = true;
  state.rehearsal.lineStats[state.rehearsal.lineIndex] = stat;

  // Speak the prompt softly using the Stage Manager voice, then resume listening
  clearTimeout(pauseGraceTimer);
  stopListening();
  speakCharacterLine(promptSlice || currentLine.text.slice(0, 60), STAGE_DIRECTION_VOICE, {
    speed: 1.0,
    onEnd: () => {
      if (state.rehearsal.playing && isUserCharacter(currentLine.speaker) && state.settings.autoListen) {
        beginActorTurnListening(currentLine);
      }
      renderKaraokeFocusOnly();
    }
  });
  renderKaraokeFocusOnly();
}

// Pre-generate OpenAI neural audio for the next 2 upcoming partner cues so transitions have zero dead air
function warmUpcomingPartnerLines(play, scene, fromIdx, voiceMap) {
  let warmed = 0;
  for (let i = fromIdx; i < scene.lines.length && warmed < 2; i++) {
    const candidate = scene.lines[i];
    if (!candidate || isUserCharacter(candidate.speaker)) continue;
    const profile = voiceMap[candidate.speaker] || VOICE_PROFILES[0];
    const textToWarm = state.settings.readStageDirections && candidate.direction
      ? `${candidate.direction}. ${candidate.text}`
      : candidate.text;
    prefetchCharacterLine(textToWarm, profile, state.settings.voiceSpeed);
    warmed += 1;
  }
}

// Simulate speaking the rest of the current user line (useful in quiet spaces or when testing without a mic)
export function markUserLineDone() {
  const scene = getActiveScene();
  const currentLine = scene.lines[state.rehearsal.lineIndex];
  if (!currentLine) return;

  const evalResult = liveEvaluation && liveEvaluation.matchedCount > 0
    ? liveEvaluation
    : evaluateSpokenLine(currentLine.text, currentLine.text, state.settings.tolerance);

  completeUserTurn(evalResult);
}

function runCurrentLineTurn() {
  clearTimeout(autoAdvanceTimer);
  clearTimeout(pauseGraceTimer);
  partnerAudioLoading = false;
  stopAllSpeaking();
  stopListening();
  syncScreenWakeLock();

  const play = getActivePlay();
  const scene = getActiveScene(play);
  const idx = state.rehearsal.lineIndex;
  const line = scene.lines[idx];

  if (!line) {
    finishSceneRehearsal();
    return;
  }

  state.rehearsal.revealedHints = 0;
  liveSpokenTranscript = '';
  partnerActiveWordIndex = -1;

  // Cue-to-Cue skip logic: if enabled, and neither this line nor the previous/next line belongs to the user,
  // fast-forward to 1 line before the user's next cue.
  if (state.settings.cueToCue && !isUserCharacter(line.speaker)) {
    const nextUserIdx = scene.lines.findIndex((l, i) => i > idx && isUserCharacter(l.speaker));
    if (nextUserIdx !== -1 && nextUserIdx - idx > 1) {
      state.rehearsal.lineIndex = nextUserIdx - 1;
      renderApp();
      runCurrentLineTurn();
      return;
    }
  }

  const voiceMap = assignVoicesToCharacters(play.characters, state.voiceOverrides);
  const userTurn = isUserCharacter(line.speaker);

  // Warm the next upcoming partner speeches in the background while this turn plays
  warmUpcomingPartnerLines(play, scene, userTurn ? idx + 1 : idx + 1, voiceMap);

  if (userTurn) {
    liveEvaluation = evaluateSpokenLine(line.text, '', state.settings.tolerance);
    renderApp();
    scrollActiveLineIntoView();
    playYourCueChime();
    if (state.settings.autoListen) {
      beginActorTurnListening(line);
    }
  } else {
    liveEvaluation = null;
    renderApp();
    scrollActiveLineIntoView();
    const voiceProfile = voiceMap[line.speaker] || VOICE_PROFILES[0];
    const textToSpeak = state.settings.readStageDirections && line.direction
      ? `${line.direction}. ${line.text}`
      : line.text;

    speakCharacterLine(textToSpeak, voiceProfile, {
      speed: state.settings.voiceSpeed,
      onLoading: (isLoading) => {
        partnerAudioLoading = isLoading;
        renderMicBadgeOnly();
      },
      onWord: (wordIdx) => {
        partnerActiveWordIndex = wordIdx;
        renderKaraokeFocusOnly();
      },
      onEnd: () => {
        partnerAudioLoading = false;
        if (!state.rehearsal.playing) return;
        partnerActiveWordIndex = -1;
        if (state.settings.loopLine) {
          autoAdvanceTimer = setTimeout(() => {
            if (state.rehearsal.playing) runCurrentLineTurn();
          }, 550);
          return;
        }
        advanceToNextLine();
      }
    });
  }
}

function beginActorTurnListening(line) {
  startListening({
    expectedScriptPrompt: line.text,
    onStatusChange: (st) => {
      micStatus = st;
      renderMicBadgeOnly();
    },
    onError: (msg) => {
      statusNotice = msg;
      renderMicBadgeOnly();
    },
    onTranscript: (transcript) => {
      if (!state.rehearsal.playing) return;
      clearTimeout(pauseGraceTimer);

      // Check if the actor called "Line!" or "Line please" (works at start OR mid-monologue)
      const currentCursor = liveEvaluation ? liveEvaluation.activeIndex : 0;
      if (detectSpokenPromptRequest(transcript, line.text, currentCursor)) {
        requestLinePrompt();
        return;
      }

      liveSpokenTranscript = transcript;
      const evalResult = evaluateSpokenLine(line.text, transcript, state.settings.tolerance);
      liveEvaluation = evalResult;

      state.rehearsal.lineStats[state.rehearsal.lineIndex] = {
        accuracy: evalResult.accuracy,
        attempts: (state.rehearsal.lineStats[state.rehearsal.lineIndex]?.attempts || 1),
        prompted: Boolean(state.rehearsal.lineStats[state.rehearsal.lineIndex]?.prompted)
      };

      renderKaraokeFocusOnly();

      if (state.settings.autoAdvance && evalResult.isComplete) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = setTimeout(() => {
          completeUserTurn(evalResult);
        }, 420);
      } else if (state.settings.autoAdvance && evalResult.isNearCompleteForPause) {
        // Hands-free grace window: if actor reached the tail of the speech nearly within tolerance
        // and pauses for 1.85s, advance smoothly without forcing them to walk over to tap the tablet.
        pauseGraceTimer = setTimeout(() => {
          if (state.rehearsal.playing && isUserCharacter(line.speaker)) {
            completeUserTurn(evalResult);
          }
        }, 1850);
      }
    }
  });
}

function completeUserTurn(evalResult) {
  clearTimeout(autoAdvanceTimer);
  clearTimeout(pauseGraceTimer);
  stopListening();
  playLineCompleteChime();

  const prevAttempts = state.rehearsal.lineStats[state.rehearsal.lineIndex]?.attempts || 0;
  state.rehearsal.totalLinesPracticed += 1;
  state.rehearsal.lineStats[state.rehearsal.lineIndex] = {
    accuracy: evalResult?.accuracy ?? 1,
    attempts: prevAttempts + 1,
    prompted: Boolean(state.rehearsal.lineStats[state.rehearsal.lineIndex]?.prompted)
  };
  saveState();

  if (state.settings.loopLine) {
    autoAdvanceTimer = setTimeout(() => {
      if (state.rehearsal.playing) runCurrentLineTurn();
    }, 650);
    return;
  }
  advanceToNextLine();
}

function advanceToNextLine() {
  const scene = getActiveScene();
  if (state.rehearsal.lineIndex + 1 < scene.lines.length) {
    state.rehearsal.lineIndex += 1;
    saveState();
    runCurrentLineTurn();
  } else {
    finishSceneRehearsal();
  }
}

function finishSceneRehearsal() {
  stopRehearsalPlayback();
  playCurtainChord();
  state.rehearsal.completedScenes += 1;

  const stats = Object.values(state.rehearsal.lineStats);
  const avgAccuracy = stats.length
    ? Math.round((stats.reduce((sum, s) => sum + (s.accuracy || 0), 0) / stats.length) * 100)
    : 100;

  if (avgAccuracy > (state.rehearsal.bestAccuracy || 0)) {
    state.rehearsal.bestAccuracy = avgAccuracy;
  }

  const play = getActivePlay();
  const scene = getActiveScene(play);
  logRehearsalSession({
    playId: play.id,
    playTitle: play.title,
    sceneTitle: scene.title,
    roles: [...state.selectedCharacters],
    tolerance: state.settings.tolerance,
    accuracy: avgAccuracy,
    linesCount: stats.length
  });

  curtainModalOpen = true;
  renderApp();
}

function scrollActiveLineIntoView() {
  requestAnimationFrame(() => {
    const activeEl = document.querySelector('.script-line-card.is-current');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

// ---------- PDF & Script Upload Handlers ----------

export async function handleUploadedScriptFile(file) {
  if (!file) return;
  const isPdf = /\.pdf$/i.test(file.name) || file.type === 'application/pdf';
  const maxBytes = isPdf ? MAX_PDF_BYTES : MAX_TEXT_BYTES;
  if (typeof file.size === 'number' && file.size > maxBytes) {
    statusNotice = `File is too large (${Math.round(file.size / (1024 * 1024))} MB). Maximum allowed is ${Math.round(maxBytes / (1024 * 1024))} MB.`;
    renderApp();
    return;
  }

  statusNotice = `Reading "${file.name.slice(0, 80)}"…`;
  renderApp();

  try {
    const rawText = isPdf
      ? await extractTextFromPdf(file)
      : await file.text();

    const parsedPlay = parseScriptText(rawText, {
      defaultTitle: file.name.replace(/\.(pdf|txt|fountain)$/i, ''),
      defaultPlaywright: 'Uploaded Script'
    });

    if (!parsedPlay.characters.length || !parsedPlay.scenes.length) {
      statusNotice = 'Could not detect character cues in that file. Try pasting the script text or using CHARACTER: Line format.';
      renderApp();
      return;
    }

    state.customPlays = [parsedPlay, ...state.customPlays.filter((p) => p.title !== parsedPlay.title)].slice(0, 25);
    statusNotice = '';
    selectPlay(parsedPlay.id);
  } catch (e) {
    statusNotice = `Could not parse "${file.name.slice(0, 80)}". You can also paste script sides directly.`;
    renderApp();
  }
}

export function handlePastedScriptSubmit() {
  const titleInput = $('paste-script-title');
  const authorInput = $('paste-script-author');
  const bodyInput = $('paste-script-body');
  const text = bodyInput?.value.trim() || '';
  if (!text) return;

  const parsedPlay = parseScriptText(text, {
    defaultTitle: titleInput?.value.trim() || 'Custom Audition Sides',
    defaultPlaywright: authorInput?.value.trim() || 'Uploaded Sides'
  });

  if (!parsedPlay.characters.length) {
    statusNotice = 'Tip: Put character names in ALL CAPS or follow them with a colon (e.g. HAMLET: To be, or not to be).';
    renderApp();
    return;
  }

  state.customPlays = [parsedPlay, ...state.customPlays];
  pasteModalOpen = false;
  statusNotice = '';
  selectPlay(parsedPlay.id);
}

export function deleteCustomPlay(playId) {
  const target = state.customPlays.find((p) => p.id === playId);
  if (!target) return;
  state.customPlays = state.customPlays.filter((p) => p.id !== playId);
  if (state.selectedPlayId === playId) {
    const fallback = getAllPlays(state.customPlays)[0];
    state.selectedPlayId = fallback?.id || 'shake-hamlet';
    state.selectedSceneId = fallback?.scenes?.[0]?.id || '';
    state.selectedCharacters = fallback?.characters?.[0] ? [fallback.characters[0]] : ['HAMLET'];
  }
  saveState();
  renderApp();
}

// ---------- Rendering ----------

export function renderApp() {
  applyThemeToDom();

  const headerEl = $('app-header');
  const mainEl = $('app-main');
  const drawerEl = $('settings-drawer');
  const modalEl = $('modal-layer');

  if (headerEl) headerEl.innerHTML = renderHeaderHtml();
  if (mainEl) {
    if (state.screen === 'library') mainEl.innerHTML = renderLibraryScreenHtml();
    else if (state.screen === 'setup') mainEl.innerHTML = renderSetupScreenHtml();
    else mainEl.innerHTML = renderRehearsalScreenHtml();
  }

  if (drawerEl) {
    drawerEl.hidden = !settingsOpen;
    if (settingsOpen) {
      drawerEl.innerHTML = renderSettingsDrawerHtml();
      if (settingsTab === 'cloud') renderCloudStatusInDrawer();
    }
  }

  if (modalEl) {
    if (pasteModalOpen) {
      modalEl.hidden = false;
      modalEl.innerHTML = renderPasteModalHtml();
    } else if (curtainModalOpen) {
      modalEl.hidden = false;
      modalEl.innerHTML = renderCurtainModalHtml();
    } else {
      modalEl.hidden = true;
      modalEl.innerHTML = '';
    }
  }
}

function renderHeaderHtml() {
  const play = getActivePlay();
  const tol = TOLERANCE_LEVELS[state.settings.tolerance] || TOLERANCE_LEVELS['off-book'];
  const vStatus = voiceEngineStatus();

  const themePills = THEME_ORDER.map((key) => {
    const t = THEMES[key];
    const active = state.settings.theme === key ? 'active' : '';
    return `<button class="theme-pill ${active}" data-action="set-theme" data-value="${key}" title="${escHtml(t.desc)}">${escHtml(t.shortLabel)}</button>`;
  }).join('');

  const voiceBadgeHtml = vStatus.hasOpenAiKey
    ? (vStatus.lastError && !vStatus.active
        ? `<button class="tolerance-badge-btn voice-warn-pill" data-action="open-settings" data-value="voices" title="${escHtml(vStatus.lastError)}">⚠️ OpenAI Error (Check Key)</button>`
        : `<button class="tolerance-badge-btn voice-ok-pill" data-action="open-settings" data-value="voices" title="Using OpenAI Neural Voices (${escHtml(vStatus.maskedKey)})">✨ OpenAI Neural Voice</button>`)
    : `<button class="tolerance-badge-btn voice-offline-pill" data-action="open-settings" data-value="voices" title="Currently using basic browser offline voices. Tap to paste your OpenAI API key for studio voices!">🔈 Offline Voice · Tap to Add OpenAI Key</button>`;

  return `
    <div class="header-inner">
      <div class="brand-cluster">
        <button class="brand-btn" data-action="nav" data-value="library" title="Script Library">
          <span class="brand-icon" aria-hidden="true">🎭</span>
          <span class="brand-text">
            <span class="brand-title">Scene Partner</span>
            <span class="brand-sub">${state.screen === 'library' ? '120+ Classic Plays & PDF Sides' : escHtml(play.title)}</span>
          </span>
        </button>
        <nav class="screen-tabs" aria-label="Main navigation">
          <button class="screen-tab ${state.screen === 'library' ? 'active' : ''}" data-action="nav" data-value="library">1. Script</button>
          <button class="screen-tab ${state.screen === 'setup' ? 'active' : ''}" data-action="nav" data-value="setup">2. Cast &amp; Voices</button>
          <button class="screen-tab ${state.screen === 'rehearsal' ? 'active' : ''}" data-action="nav" data-value="rehearsal">3. Rehearse</button>
        </nav>
      </div>

      <div class="header-controls">
        ${voiceBadgeHtml}
        <div class="theme-switcher" role="group" aria-label="Stage view style">
          ${themePills}
        </div>
        <button class="tolerance-badge-btn" data-action="open-settings" data-value="rehearsal" title="Line matching strictness">
          <span class="tol-dot"></span>
          <span>${escHtml(tol.shortLabel)}</span>
        </button>
        <button class="icon-btn" data-action="open-settings" data-value="rehearsal" aria-label="Settings &amp; Green Room">
          ⚙️ <span class="hide-compact">Settings</span>
        </button>
      </div>
    </div>
  `;
}

// ---------- Screen 1: Script Library & PDF Upload ----------

function renderLibraryScreenHtml() {
  const allPlays = getAllPlays(state.customPlays);
  const activePlay = getActivePlay();
  const activeScene = getActiveScene(activePlay);
  const activeRoles = state.selectedCharacters.map(formatSpeakerName).join(', ');
  const resumeLineNum = Math.min((state.rehearsal.lineIndex || 0) + 1, Math.max(1, activeScene.lines?.length || 1));

  const baseFiltered = verbatimOnlyFilter
    ? allPlays.filter((p) => p.verbatim || p.custom)
    : allPlays;

  const playwrightGroups = groupPlaysByPlaywright(baseFiltered);
  const playwrightNames = ['ALL', ...playwrightGroups.map((g) => g.playwright)];

  const q = searchQuery.trim().toLowerCase();
  const filteredGroups = playwrightGroups
    .filter((g) => selectedPlaywrightFilter === 'ALL' || g.playwright === selectedPlaywrightFilter)
    .map((g) => ({
      ...g,
      plays: g.plays.filter((p) => {
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.playwright.toLowerCase().includes(q) ||
          (p.genre && p.genre.toLowerCase().includes(q)) ||
          p.characters.some((c) => c.toLowerCase().includes(q))
        );
      })
    }))
    .filter((g) => g.plays.length > 0);

  const filterChips = playwrightNames.map((name) => {
    const count = name === 'ALL'
      ? baseFiltered.length
      : (playwrightGroups.find((g) => g.playwright === name)?.plays.length || 0);
    const label = name === 'ALL' ? `All Playwrights (${count})` : `${name} (${count})`;
    return `<button class="playwright-chip ${selectedPlaywrightFilter === name ? 'active' : ''}" data-action="filter-playwright" data-value="${escHtml(name)}">${escHtml(label)}</button>`;
  }).join('');

  const sectionsHtml = filteredGroups.length
    ? filteredGroups.map((group) => `
      <section class="playwright-section">
        <div class="section-heading">
          <div>
            <h2>${escHtml(group.playwright)}</h2>
            <p class="section-sub">${group.plays.length} ${group.plays.length === 1 ? 'play' : 'plays'} · ${escHtml(group.era)}</p>
          </div>
        </div>
        <div class="play-grid">
          ${group.plays.map((p) => renderPlayCardHtml(p)).join('')}
        </div>
      </section>
    `).join('')
    : `<div class="empty-library">
         <p>No scripts matched “${escHtml(searchQuery)}”.</p>
         <button class="secondary-btn" data-action="clear-search">Show All ${allPlays.length} Plays</button>
       </div>`;

  return `
    <div class="library-container">
      <section class="resume-rehearsal-bar" aria-label="Continue active rehearsal">
        <div class="resume-copy">
          <span class="resume-eyebrow">CURRENTLY ON YOUR MUSIC STAND</span>
          <strong>${escHtml(activePlay.title)}</strong>
          <span>${escHtml(activeScene.title)} · Playing <strong>${escHtml(activeRoles || 'Lead')}</strong> · Cue ${resumeLineNum} of ${activeScene.lines?.length || 1}</span>
        </div>
        <div class="resume-actions">
          <button class="quiet-btn small" data-action="nav" data-value="setup">🎭 Cast &amp; Voices</button>
          <button class="start-rehearsal-btn resume-cta-btn" data-action="resume-rehearsal">▶ Resume Rehearsal</button>
        </div>
      </section>

      <section class="hero-banner">
        <div class="hero-copy">
          <span class="eyebrow">OFF-BOOK REHEARSAL STUDIO</span>
          <h1>Choose Your Script or Upload Sides</h1>
          <p>Select from <strong>${allPlays.length} pre-loaded classics</strong> (including the Top 20 Shakespeare plays) or drag &amp; drop your own audition PDF. Pick your character(s), and let your AI scene partners read every other role with distinct voices while live karaoke transcription tracks your lines.</p>
          ${statusNotice ? `<p class="status-banner">${escHtml(statusNotice)}</p>` : ''}
        </div>
        <div id="upload-drop-zone" class="upload-actions-card">
          <button class="primary-upload-btn" data-action="trigger-pdf-upload">
            <span class="upload-icon">📄</span>
            <span>
              <strong>Upload or Drop Script PDF / TXT</strong>
              <small>Extracts scenes &amp; character cues privately on device</small>
            </span>
          </button>
          <button class="secondary-upload-btn" data-action="open-paste-modal">
            ✍️ Paste Audition Sides or Scene Text
          </button>
        </div>
      </section>

      <section class="library-toolbar">
        <div class="search-row-flex">
          <div class="search-box">
            <span class="search-icon" aria-hidden="true">🔍</span>
            <input
              id="library-search"
              type="search"
              placeholder="Search by play title, playwright, or character (e.g. Hamlet, Juliet, Lady Bracknell, Chekhov)…"
              value="${escHtml(searchQuery)}"
              autocomplete="off"
            >
            ${searchQuery ? `<button class="clear-search-btn" data-action="clear-search" aria-label="Clear search">✕</button>` : ''}
          </div>
          <button class="playwright-chip verbatim-filter-btn ${verbatimOnlyFilter ? 'active' : ''}" data-action="toggle-verbatim-only" title="Filter strictly to verbatim public-domain play scenes and your uploaded scripts">
            📜 Verbatim Text Only
          </button>
        </div>
        <div class="playwright-bar" role="tablist" aria-label="Filter by playwright">
          ${filterChips}
        </div>
      </section>

      ${sectionsHtml}
    </div>
  `;
}

function renderPlayCardHtml(play) {
  const isSelected = play.id === state.selectedPlayId;
  const topRoles = play.characters.slice(0, 4).map(formatSpeakerName).join(', ');
  const sourceBadge = play.custom
    ? `<span class="play-source-tag custom-tag">📄 Uploaded</span>`
    : play.verbatim
      ? `<span class="play-source-tag verbatim-tag" title="Canonical verbatim public-domain script text">📜 Verbatim</span>`
      : `<span class="play-source-tag studio-tag" title="Playable studio rehearsal adaptation — upload or paste sides for your exact edition">🎭 Studio Scene</span>`;

  return `
    <article class="play-card ${isSelected ? 'selected' : ''}" data-action="select-play" data-value="${escHtml(play.id)}">
      <div class="play-card-top">
        <span class="play-genre">${escHtml(play.genre || 'Classic Drama')}</span>
        <span class="play-card-meta-right">
          ${sourceBadge}
          ${play.year ? `<span class="play-year">${escHtml(play.year)}</span>` : ''}
          ${play.custom ? `<button class="delete-play-btn" data-action="delete-custom-play" data-value="${escHtml(play.id)}" title="Delete uploaded script" aria-label="Delete ${escHtml(play.title)}">🗑️</button>` : ''}
        </span>
      </div>
      <h3 class="play-title">${escHtml(play.title)}</h3>
      <p class="play-author">${escHtml(play.playwright)}</p>
      <p class="play-summary">${escHtml(play.summary || play.hook || '')}</p>
      <div class="play-card-footer">
        <span class="play-roles" title="Key roles">🎭 ${escHtml(topRoles)}</span>
        <span class="play-choose-cta">${isSelected ? 'Selected ✓' : 'Select →'}</span>
      </div>
    </article>
  `;
}

// ---------- Screen 2: Cast Roles, Scene Selection & Voice Assignment ----------

function renderSetupScreenHtml() {
  const play = getActivePlay();
  const scene = getActiveScene(play);
  const voiceMap = assignVoicesToCharacters(play.characters, state.voiceOverrides);
  const tol = TOLERANCE_LEVELS[state.settings.tolerance] || TOLERANCE_LEVELS['off-book'];

  // Count lines per character in the selected scene AND across the play
  const sceneCounts = Object.create(null);
  for (const l of scene.lines) {
    if (isSafeObjectKey(l.speaker)) {
      sceneCounts[l.speaker] = (sceneCounts[l.speaker] || 0) + 1;
    }
  }

  const sceneCards = play.scenes.map((sc) => {
    const active = sc.id === scene.id ? 'active' : '';
    const speakers = Array.from(new Set(sc.lines.map((l) => l.speaker))).map(formatSpeakerName).join(', ');
    return `
      <button class="scene-card ${active}" data-action="select-scene" data-value="${escHtml(sc.id)}">
        <div class="scene-card-title">${escHtml(sc.title)}</div>
        <div class="scene-card-meta">${sc.lines.length} speeches · ${escHtml(speakers)}</div>
      </button>
    `;
  }).join('');

  const charRows = play.characters.map((charName) => {
    const isMine = isUserCharacter(charName);
    const assignedVoice = voiceMap[charName] || VOICE_PROFILES[0];
    const inSceneCount = sceneCounts[charName] || 0;
    const totalCount = play.characterLineCounts[charName] || 0;

    const voiceOptions = VOICE_PROFILES.map((v) =>
      `<option value="${v.id}" ${v.id === assignedVoice.id ? 'selected' : ''}>${escHtml(v.name)} — ${escHtml(v.archetype.split('·')[0].trim())}</option>`
    ).join('');

    return `
      <div class="character-cast-row ${isMine ? 'is-user-role' : 'is-partner-role'}">
        <button class="role-toggle-btn ${isMine ? 'active' : ''}" data-action="toggle-char" data-value="${escHtml(charName)}">
          <span class="role-check">${isMine ? '✓ MY ROLE' : 'SCENE PARTNER'}</span>
          <span class="role-name">${escHtml(formatSpeakerName(charName))}</span>
          <span class="role-counts">${inSceneCount} lines in scene · ${totalCount} in play</span>
        </button>

        <div class="role-voice-controls">
          ${isMine ? `
            <span class="user-mic-tag">🎙️ You read these lines into the microphone</span>
          ` : `
            <label class="voice-select-label">
              <span class="voice-dot" style="background:${safeCssColor(assignedVoice.color)}"></span>
              <select class="voice-select" data-char-voice="${escHtml(charName)}" aria-label="Voice for ${escHtml(charName)}">
                ${voiceOptions}
              </select>
            </label>
            <button class="quiet-btn small" data-action="preview-voice" data-value="${escHtml(charName)}" title="Preview voice">🔊 Hear</button>
          `}
        </div>
      </div>
    `;
  }).join('');

  const tolerancePills = TOLERANCE_ORDER.map((key) => {
    const item = TOLERANCE_LEVELS[key];
    return `
      <button class="tolerance-card ${state.settings.tolerance === key ? 'active' : ''}" data-action="set-tolerance" data-value="${key}">
        <div class="tol-card-head">
          <strong>${escHtml(item.label)}</strong>
          <span class="tol-pct">${escHtml(item.badge)}</span>
        </div>
        <p>${escHtml(item.desc)}</p>
      </button>
    `;
  }).join('');

  return `
    <div class="setup-container">
      <div class="setup-header-card">
        <div>
          <span class="eyebrow">${escHtml(play.playwright)} · ${escHtml(play.year || '')} ${play.verbatim ? '· 📜 Verbatim Text' : (play.studioScene ? '· 🎭 Studio Rehearsal Scene' : '')}</span>
          <h1>${escHtml(play.title)}</h1>
          <p>${escHtml(play.summary || play.hook || '')}</p>
          ${play.studioScene ? `<p class="studio-scene-note">Note: This catalog entry uses a studio rehearsal scene for character drill. Preparing a specific translation or cut? <button class="inline-link-btn" data-action="open-paste-modal">Paste your exact audition sides →</button></p>` : ''}
        </div>
        <div class="setup-cta-col">
          <button class="start-rehearsal-btn" data-action="start-rehearsal">
            🎬 Start Rehearsal
          </button>
          <button class="quiet-btn" data-action="nav" data-value="library">← Choose Different Play</button>
        </div>
      </div>

      <div class="setup-columns">
        <section class="setup-panel">
          <h2>1. Select Act / Scene</h2>
          <p class="panel-note">Pick which scene to run, or toggle <strong>Cue-to-Cue</strong> to jump straight to your entrances.</p>
          <div class="scene-list">${sceneCards}</div>
          <div style="margin-top:0.85rem;">
            ${renderToggleRow('cueToCue', 'Cue-to-Cue Mode', 'Skip long stretches where your selected character(s) have no lines')}
          </div>
        </section>

        <section class="setup-panel">
          <h2>2. Select Your Character(s) &amp; Partner Voices</h2>
          <p class="panel-note">Tap one or more characters you want to play. Every unselected character will be read aloud in a unique, consistent voice.</p>
          <div class="character-cast-list">${charRows}</div>
        </section>
      </div>

      <section class="setup-panel tolerance-panel">
        <h2>3. Line Matching Strictness (“First Pass” → “Final Practice”)</h2>
        <p class="panel-note">Controls how much approximation, paraphrasing, or archaic contraction swapping the transcription engine allows before advancing to the next cue.</p>
        <div class="tolerance-grid">${tolerancePills}</div>
      </section>
    </div>
  `;
}

// ---------- Screen 3: Karaoke Rehearsal Stage ----------

function renderRehearsalScreenHtml() {
  const play = getActivePlay();
  const scene = getActiveScene(play);
  const lines = scene.lines || [];
  const currentIdx = Math.min(Math.max(0, state.rehearsal.lineIndex), Math.max(0, lines.length - 1));
  const currentLine = lines[currentIdx];
  const userTurn = currentLine ? isUserCharacter(currentLine.speaker) : false;
  const voiceMap = assignVoicesToCharacters(play.characters, state.voiceOverrides);
  const tol = TOLERANCE_LEVELS[state.settings.tolerance] || TOLERANCE_LEVELS['off-book'];

  const cueVisButtons = Object.values(CUE_VISIBILITY_MODES).map((m) => `
    <button class="vis-pill ${state.settings.cueVisibility === m.id ? 'active' : ''}" data-action="set-cue-vis" data-value="${m.id}" title="${escHtml(m.desc)}">
      ${escHtml(m.label)}
    </button>
  `).join('');

  const scriptFeedHtml = lines.map((line, idx) =>
    renderScriptLineCardHtml(line, idx, currentIdx, voiceMap)
  ).join('');

  const prevLine = currentIdx > 0 ? lines[currentIdx - 1] : null;
  const focusFull = Boolean(state.settings.focusLayout);

  return `
    <div class="rehearsal-stage ${focusFull ? 'is-focus-layout' : ''}">
      <!-- Top Stage Bar -->
      <div class="stage-topbar">
        <div class="stage-meta">
          <button class="quiet-btn small" data-action="nav" data-value="setup">← Cast &amp; Scenes</button>
          <div class="stage-titles">
            <strong>${escHtml(play.title)}</strong>
            <span>${escHtml(scene.title)} · Speech ${currentIdx + 1} of ${lines.length}</span>
          </div>
        </div>

        <div class="stage-vis-group" role="group" aria-label="Line visibility mode">
          ${cueVisButtons}
          <button class="vis-pill layout-pill ${focusFull ? 'active' : ''}" data-action="toggle-setting" data-value="focusLayout" title="Expand karaoke teleprompter to full height for across-the-room tablet reading">
            ${focusFull ? '☷ Show Script Stream' : '⛶ Full Teleprompter'}
          </button>
        </div>

        <div id="mic-status-slot" class="mic-status-slot">
          ${renderMicBadgeHtml(userTurn)}
        </div>
      </div>

      <!-- Center Karaoke Teleprompter Focus Deck -->
      <section id="karaoke-focus-deck" class="karaoke-focus-deck ${userTurn ? 'user-turn' : 'partner-turn'}">
        ${renderKaraokeFocusInnerHtml(currentLine, currentIdx, userTurn, voiceMap, tol, prevLine)}
      </section>

      <!-- Scrolling Full Script Context View -->
      ${focusFull ? '' : `
        <section class="script-scroll-stream" aria-label="Full scene script">
          ${scriptFeedHtml}
        </section>
      `}

      <!-- Bottom Rehearsal Transport Controls -->
      <footer class="rehearsal-transport">
        <div class="transport-left">
          <button class="transport-btn" data-action="step-line" data-value="-1" ${currentIdx === 0 ? 'disabled' : ''}>⏮ Prev Cue</button>
          <button class="transport-btn play-pause-btn ${state.rehearsal.playing ? 'is-playing' : ''}" data-action="toggle-play">
            ${state.rehearsal.playing ? '⏸ Pause Scene' : '▶ Run Scene'}
          </button>
          <button class="transport-btn" data-action="step-line" data-value="1" ${currentIdx >= lines.length - 1 ? 'disabled' : ''}>Next Cue ⏭</button>
        </div>

        <div class="transport-center">
          <button class="prompt-line-btn" data-action="prompt-line" title="Ask the prompter to highlight and speak the next 5 words (or say 'Line!')">
            💡 “Line!” (Prompt Me)
          </button>
          <button class="quiet-btn loop-line-btn ${state.settings.loopLine ? 'active' : ''}" data-action="toggle-setting" data-value="loopLine" title="Repeat this single speech on loop for monologue memorization">
            ${state.settings.loopLine ? '🔂 Looping Cue' : '🔁 Loop Cue'}
          </button>
          ${userTurn ? `
            <button class="complete-line-btn" data-action="finish-user-line" title="Mark this speech complete and cue the next character">
              ✓ Delivered Cue →
            </button>
          ` : `
            <button class="quiet-btn" data-action="replay-partner-line" title="Hear your scene partner read this line again">
              🔊 Replay Partner
            </button>
          `}
        </div>

        <div class="transport-right">
          <button class="font-btn" data-action="font-scale" data-value="-0.1" title="Smaller script text">A−</button>
          <button class="font-btn" data-action="font-scale" data-value="0.1" title="Larger script text">A+</button>
        </div>
      </footer>
    </div>
  `;
}

function renderMicBadgeHtml(userTurn) {
  if (!state.rehearsal.playing) {
    return `<span class="mic-pill paused">⏸ Paused</span>`;
  }
  if (!userTurn) {
    if (partnerAudioLoading) {
      return `<span class="mic-pill partner">⏳ Cueing Neural Voice…</span>`;
    }
    return `<span class="mic-pill partner">🔊 Scene Partner Speaking…</span>`;
  }
  if (micStatus === 'listening') {
    return `<span class="mic-pill listening"><span class="pulse-dot"></span> 🎙️ Listening for Your Cue…</span>`;
  }
  if (micStatus === 'blocked' || micStatus === 'unsupported') {
    return `<span class="mic-pill blocked">🎙️ Mic Off — Use “✓ Delivered Cue”</span>`;
  }
  return `<span class="mic-pill ready">🎙️ Your Turn</span>`;
}

function buildPrecedingCueSnippet(prevLine) {
  if (!prevLine || !prevLine.text) return '';
  const words = prevLine.text.trim().split(/\s+/);
  const tail = words.length > 12 ? `…${words.slice(-12).join(' ')}` : prevLine.text.trim();
  return `
    <div class="preceding-cue-strip">
      <span class="cue-from-label">Cue from ${escHtml(formatSpeakerName(prevLine.speaker))}:</span>
      <span class="cue-from-quote">“${escHtml(tail)}”</span>
    </div>
  `;
}

function renderKaraokeFocusInnerHtml(currentLine, currentIdx, userTurn, voiceMap, tol, prevLine = null) {
  if (!currentLine) return `<p>End of scene.</p>`;

  const profile = voiceMap[currentLine.speaker] || VOICE_PROFILES[0];
  const tokens = tokenizeLine(currentLine.text);
  const visMode = state.settings.cueVisibility;

  let karaokeWordsHtml = '';

  if (userTurn) {
    const evalData = liveEvaluation || evaluateSpokenLine(currentLine.text, liveSpokenTranscript, state.settings.tolerance);
    karaokeWordsHtml = evalData.tokens.map((tok, i) => {
      const isHinted = i < state.rehearsal.revealedHints;
      let shouldMask = false;
      if (visMode === 'first-words' && i >= 3 && tok.state === 'upcoming' && !isHinted) {
        shouldMask = true;
      } else if (visMode === 'off-book-blind' && tok.state === 'upcoming' && !isHinted) {
        shouldMask = true;
      }
      const cls = [
        'karaoke-word',
        `word-${tok.state}`,
        isHinted ? 'word-prompted' : '',
        shouldMask ? 'word-masked' : ''
      ].filter(Boolean).join(' ');
      return `<span class="${cls}">${escHtml(tok.display)}</span>`;
    }).join(' ');

    const pct = Math.round((evalData.accuracy || 0) * 100);
    return `
      <div class="focus-header">
        <div class="speaker-banner">
          <span class="role-badge your-cue-badge">YOUR CUE</span>
          <h2 class="focus-speaker">${escHtml(formatSpeakerName(currentLine.speaker))}</h2>
          ${currentLine.direction ? `<span class="stage-direction-inline">[${escHtml(currentLine.direction)}]</span>` : ''}
        </div>
        <div class="accuracy-meter" title="Target accuracy for ${escHtml(tol.label)}: ${Math.round(tol.minOverallRatio * 100)}%">
          <span class="meter-label">${escHtml(tol.shortLabel)} Match: <strong>${pct}%</strong></span>
          <div class="meter-bar"><div class="meter-fill" style="width:${pct}%"></div></div>
        </div>
      </div>

      ${prevLine ? buildPrecedingCueSnippet(prevLine) : ''}

      <div class="karaoke-line-display">
        ${karaokeWordsHtml}
      </div>

      <div class="live-transcript-bar">
        <span class="transcript-label">🎙️ Heard:</span>
        <span class="transcript-text">${liveSpokenTranscript ? `“${escHtml(liveSpokenTranscript)}”` : '<em>Speak your line aloud (or say “Line!” anytime for a 5-word prompt)…</em>'}</span>
      </div>
    `;
  }

  // Partner's turn: highlight words as the TTS voice speaks them
  karaokeWordsHtml = tokens.map((tok, i) => {
    const stateCls = partnerActiveWordIndex < 0
      ? ''
      : i < partnerActiveWordIndex
        ? 'partner-spoken'
        : i === partnerActiveWordIndex
          ? 'partner-active'
          : 'partner-upcoming';
    return `<span class="karaoke-word ${stateCls}">${escHtml(tok.display)}</span>`;
  }).join(' ');

  return `
    <div class="focus-header">
      <div class="speaker-banner">
        <span class="role-badge partner-cue-badge" style="border-color:${safeCssColor(profile.color)};color:${safeCssColor(profile.color)}">
          🔊 ${escHtml(profile.name)} Voice
        </span>
        <h2 class="focus-speaker">${escHtml(formatSpeakerName(currentLine.speaker))}</h2>
        ${currentLine.direction ? `<span class="stage-direction-inline">[${escHtml(currentLine.direction)}]</span>` : ''}
      </div>
      <div class="partner-archetype">${escHtml(profile.archetype)}</div>
    </div>

    <div class="karaoke-line-display partner-script-text">
      ${karaokeWordsHtml}
    </div>
  `;
}

function renderScriptLineCardHtml(line, idx, currentIdx, voiceMap) {
  const isCurrent = idx === currentIdx;
  const isPast = idx < currentIdx;
  const isMine = isUserCharacter(line.speaker);
  const profile = voiceMap[line.speaker] || VOICE_PROFILES[0];
  const stat = state.rehearsal.lineStats[idx];

  const visMode = state.settings.cueVisibility;
  const maskInScroll = isMine && !isPast && !isCurrent && visMode === 'off-book-blind';

  return `
    <article
      class="script-line-card ${isCurrent ? 'is-current' : ''} ${isPast ? 'is-past' : ''} ${isMine ? 'is-mine' : 'is-partner'}"
      data-action="jump-line"
      data-value="${idx}"
    >
      <div class="line-card-header">
        <span class="line-speaker" style="${!isMine ? `color:${safeCssColor(profile.color)}` : ''}">
          ${escHtml(formatSpeakerName(line.speaker))}
        </span>
        <span class="line-badges">
          ${isMine ? '<span class="mini-tag mine-tag">YOU</span>' : `<span class="mini-tag voice-tag">${escHtml(profile.name)}</span>`}
          ${stat ? `<span class="mini-tag score-tag">${Math.round(stat.accuracy * 100)}%${stat.prompted ? ' · Prompted' : ''}</span>` : ''}
        </span>
      </div>
      ${line.direction ? `<div class="line-direction">[${escHtml(line.direction)}]</div>` : ''}
      <p class="line-text ${maskInScroll ? 'blurred-line' : ''}">${escHtml(line.text)}</p>
    </article>
  `;
}

export function renderKaraokeFocusOnly() {
  const deck = $('karaoke-focus-deck');
  if (!deck) return;
  const prevDisplay = deck.querySelector('.karaoke-line-display');
  const prevScrollTop = prevDisplay ? prevDisplay.scrollTop : 0;

  const play = getActivePlay();
  const scene = getActiveScene(play);
  const currentIdx = Math.min(Math.max(0, state.rehearsal.lineIndex), Math.max(0, scene.lines.length - 1));
  const currentLine = scene.lines[currentIdx];
  const prevLine = currentIdx > 0 ? scene.lines[currentIdx - 1] : null;
  const userTurn = currentLine ? isUserCharacter(currentLine.speaker) : false;
  const voiceMap = assignVoicesToCharacters(play.characters, state.voiceOverrides);
  const tol = TOLERANCE_LEVELS[state.settings.tolerance] || TOLERANCE_LEVELS['off-book'];

  deck.className = `karaoke-focus-deck ${userTurn ? 'user-turn' : 'partner-turn'}`;
  deck.innerHTML = renderKaraokeFocusInnerHtml(currentLine, currentIdx, userTurn, voiceMap, tol, prevLine);

  // Preserve scroll position inside long monologues and smoothly keep the active word in view
  const nextDisplay = deck.querySelector('.karaoke-line-display');
  if (nextDisplay) {
    nextDisplay.scrollTop = prevScrollTop;
    const activeWordEl = nextDisplay.querySelector('.word-active, .partner-active');
    if (activeWordEl) {
      const containerRect = nextDisplay.getBoundingClientRect();
      const wordRect = activeWordEl.getBoundingClientRect();
      if (wordRect.bottom > containerRect.bottom - 18 || wordRect.top < containerRect.top + 12) {
        const offset = (wordRect.top - containerRect.top) - containerRect.height * 0.38;
        nextDisplay.scrollBy({ top: offset, behavior: 'smooth' });
      }
    }
  }
  renderMicBadgeOnly();
}

function renderMicBadgeOnly() {
  const slot = $('mic-status-slot');
  if (!slot) return;
  const scene = getActiveScene();
  const currentLine = scene.lines[state.rehearsal.lineIndex];
  slot.innerHTML = renderMicBadgeHtml(currentLine ? isUserCharacter(currentLine.speaker) : false);
}

// ---------- Settings & Green Room Drawer ----------

export function openSettingsDrawer(tabName = 'rehearsal') {
  settingsTab = tabName || 'rehearsal';
  settingsOpen = true;
  renderApp();
}

export function closeSettingsDrawer() {
  settingsOpen = false;
  renderApp();
}

function renderSettingsDrawerHtml() {
  return `
    <div class="drawer-backdrop" data-action="close-settings"></div>
    <aside class="drawer-panel" role="dialog" aria-label="Rehearsal &amp; Voice Settings">
      <div class="drawer-header">
        <h2>Green Room &amp; Settings</h2>
        <button class="icon-btn" data-action="close-settings" aria-label="Close settings">✕</button>
      </div>

      <div class="drawer-tabs">
        <button class="drawer-tab ${settingsTab === 'rehearsal' ? 'active' : ''}" data-action="settings-tab" data-value="rehearsal">Rehearsal &amp; Display</button>
        <button class="drawer-tab ${settingsTab === 'voices' ? 'active' : ''}" data-action="settings-tab" data-value="voices">Voice &amp; AI Engine</button>
        <button class="drawer-tab ${settingsTab === 'cloud' ? 'active' : ''}" data-action="settings-tab" data-value="cloud">Cloud &amp; Backups</button>
      </div>

      <div class="drawer-body">
        ${settingsTab === 'rehearsal' ? renderRehearsalSettingsTabHtml() : ''}
        ${settingsTab === 'voices' ? renderVoicesSettingsTabHtml() : ''}
        ${settingsTab === 'cloud' ? renderCloudSettingsTabHtml() : ''}
      </div>
    </aside>
  `;
}

function renderRehearsalSettingsTabHtml() {
  const tolButtons = TOLERANCE_ORDER.map((k) => {
    const t = TOLERANCE_LEVELS[k];
    return `
      <button class="setting-choice ${state.settings.tolerance === k ? 'active' : ''}" data-action="set-tolerance" data-value="${k}">
        <strong>${escHtml(t.label)}</strong>
        <span>${escHtml(t.badge)} — ${escHtml(t.desc)}</span>
      </button>
    `;
  }).join('');

  const themeButtons = THEME_ORDER.map((k) => {
    const t = THEMES[k];
    return `
      <button class="setting-choice ${state.settings.theme === k ? 'active' : ''}" data-action="set-theme" data-value="${k}">
        <strong>${escHtml(t.label)}</strong>
        <span>${escHtml(t.desc)}</span>
      </button>
    `;
  }).join('');

  return `
    <div class="settings-section">
      <h3>Line Accuracy Tolerance</h3>
      <p class="settings-note">Toggle how forgiving the transcription engine is from “First Pass” to “Final Practice”.</p>
      <div class="choice-stack">${tolButtons}</div>
    </div>

    <div class="settings-section">
      <h3>Karaoke Stage View</h3>
      <div class="choice-stack">${themeButtons}</div>
    </div>

    <div class="settings-section">
      <h3>Rehearsal Flow</h3>
      ${renderToggleRow('autoAdvance', 'Auto-Advance on Line Completion', 'Immediately cue the next character once your line matches within tolerance')}
      ${renderToggleRow('autoListen', 'Auto-Activate Microphone on Your Cue', 'Start live speech recognition automatically whenever it is your character’s turn')}
      ${renderToggleRow('cueToCue', 'Cue-to-Cue Fast Forward', 'Skip scenes or exchanges where your character has no lines')}
      ${renderToggleRow('readStageDirections', 'Read Stage Directions Aloud', 'Have the Stage Manager voice read [stage directions] before lines')}
      ${renderToggleRow('sound', 'Stage Chimes &amp; Cue Tones', 'Play a soft musical cue chime when your turn begins')}
    </div>
  `;
}

function renderVoicesSettingsTabHtml() {
  const status = voiceEngineStatus();
  const play = getActivePlay();
  const voiceMap = assignVoicesToCharacters(play.characters, state.voiceOverrides);

  const castList = play.characters.map((charName) => {
    const current = voiceMap[charName] || VOICE_PROFILES[0];
    const opts = VOICE_PROFILES.map((v) =>
      `<option value="${v.id}" ${v.id === current.id ? 'selected' : ''}>${escHtml(v.name)} (${escHtml(v.archetype)})</option>`
    ).join('');
    return `
      <div class="voice-cast-item">
        <span class="voice-cast-char">${escHtml(formatSpeakerName(charName))}</span>
        <select class="voice-select" data-char-voice="${escHtml(charName)}">${opts}</select>
        <button class="quiet-btn small" data-action="preview-voice" data-value="${escHtml(charName)}">🔊</button>
      </div>
    `;
  }).join('');

  return `
    <div class="settings-section">
      <h3>Voice &amp; Transcription Engine</h3>
      <div class="engine-status-box">
        <p><strong>Active Voice Engine:</strong> ${escHtml(status.ttsEngine)}</p>
        ${status.hasOpenAiKey ? `<p><strong>Saved Key:</strong> <code>${escHtml(status.maskedKey)}</code> ${status.lastModelUsed ? `(Model: <code>${escHtml(status.lastModelUsed)}</code>)` : ''}</p>` : ''}
        ${status.lastError ? `<p style="color:#ef4444;font-weight:700;">Diagnostic: ${escHtml(status.lastError)}</p>` : ''}
        <p><strong>Transcription:</strong> ${escHtml(status.sttEngine)}</p>
      </div>
      <p class="settings-note">Note: Each site origin (e.g. <code>localhost</code> vs. <code>jmerk-bot.github.io</code>) has its own browser storage. If you added your OpenAI key on the OpenAI dashboard or on localhost, paste your <code>sk-...</code> key here on the live site (or sync via Cloud Backup, which encrypts it with AES-256-GCM using your GitHub token) to activate OpenAI Neural Voices.</p>
      <div class="api-key-row">
        <input
          id="openai-api-key"
          class="cloud-input"
          type="password"
          placeholder="${status.hasOpenAiKey ? `Saved (${escHtml(status.maskedKey)}) — paste new sk-... key to replace` : 'Paste your OpenAI Secret Key here (sk-proj-...)'}"
          autocomplete="off"
          spellcheck="false"
        >
        <div class="cloud-actions">
          <button class="start-rehearsal-btn" style="padding:0.55rem 1.1rem;font-size:0.88rem;" data-action="save-openai-key">Save &amp; Test OpenAI Voice</button>
          ${status.hasOpenAiKey ? `<button class="secondary-btn" data-action="test-openai-key">🔊 Test OpenAI Voice</button>` : ''}
          ${status.hasOpenAiKey ? `<button class="quiet-btn" data-action="clear-openai-key">Disconnect Key</button>` : ''}
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h3>Scene Partner Reading Speed (${Math.round(state.settings.voiceSpeed * 100)}%)</h3>
      <div class="speed-row">
        ${[0.85, 0.95, 1.0, 1.1, 1.25].map((spd) => `
          <button class="vis-pill ${Math.abs(state.settings.voiceSpeed - spd) < 0.03 ? 'active' : ''}" data-action="set-voice-speed" data-value="${spd}">
            ${spd}×
          </button>
        `).join('')}
      </div>
    </div>

    <div class="settings-section">
      <h3>Character Voice Casting (${escHtml(play.title)})</h3>
      <div class="voice-cast-stack">${castList}</div>
    </div>
  `;
}

function renderCloudSettingsTabHtml() {
  return `
    <div class="settings-section">
      <h3>Cloud Backup (GitHub Gist)</h3>
      <p class="settings-note">Uses the same private GitHub Gist connection pattern as Addy’s Math Lab (stored separately in <code>scene-partner-state.json</code> so both apps stay 100% independent). Enter a GitHub token with <code>gist</code> access.</p>
      <div class="api-key-row">
        <input id="cloud-token" class="cloud-input" type="password" placeholder="GitHub token (ghp_… or github_pat_…)" autocomplete="off" spellcheck="false">
        <div class="cloud-actions">
          <button class="secondary-btn" data-action="cloud-save">Save &amp; Sync</button>
          <button id="cloud-clear" class="quiet-btn" data-action="cloud-clear" hidden>Disconnect</button>
        </div>
        <p id="cloud-status" class="cloud-status"></p>
      </div>
    </div>

    <div class="settings-section">
      <h3>Device Backup Copy</h3>
      <p class="settings-note">Save your uploaded scripts, voice castings, and rehearsal history to a single JSON file, or restore from one.</p>
      <div class="cloud-actions">
        <button class="secondary-btn" data-action="backup-download">⬇ Download Backup</button>
        <button class="quiet-btn" data-action="backup-restore">⬆ Restore from File</button>
      </div>
    </div>

    <div class="settings-section">
      <h3>Rehearsal Log</h3>
      <p class="settings-note">${state.rehearsal.completedScenes} scenes completed · ${state.rehearsal.totalLinesPracticed} cues delivered · Best accuracy: ${state.rehearsal.bestAccuracy || 0}%</p>
    </div>
  `;
}

export function renderCloudStatusInDrawer() {
  const info = cloudStatus();
  const input = $('cloud-token');
  const clearBtn = $('cloud-clear');
  const statusEl = $('cloud-status');
  if (!input || !clearBtn || !statusEl) return;

  input.placeholder = info.connected
    ? 'Token saved (paste a new token to replace)'
    : 'GitHub token (ghp_… or github_pat_…)';
  clearBtn.hidden = !info.connected;

  statusEl.className = `cloud-status ${info.state}`;
  if (!info.connected) {
    statusEl.textContent = 'Not connected — state is saved in localStorage on this tablet.';
    return;
  }
  const time = info.lastSyncAt ? new Date(info.lastSyncAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
  const gistTag = info.gistId ? ` · Gist ${info.gistId.slice(0, 7)}` : '';
  if (info.state === 'syncing' || info.state === 'error') {
    statusEl.textContent = info.message;
  } else {
    statusEl.textContent = `Connected${time ? ` · Last synced ${time}` : ''}${gistTag}`;
  }
}

onCloudStatus(() => {
  if (settingsOpen && settingsTab === 'cloud') renderCloudStatusInDrawer();
});

onVoiceStatusChange(() => {
  const headerEl = $('app-header');
  if (headerEl) headerEl.innerHTML = renderHeaderHtml();
  if (settingsOpen && settingsTab === 'voices') renderApp();
});

function renderToggleRow(key, label, desc) {
  const on = Boolean(state.settings[key]);
  return `
    <button class="toggle-row ${on ? 'active' : ''}" data-action="toggle-setting" data-value="${key}">
      <span class="toggle-copy">
        <strong>${label}</strong>
        <small>${desc}</small>
      </span>
      <span class="toggle-switch" aria-hidden="true"></span>
    </button>
  `;
}

// ---------- Modals (Paste Sides & Curtain Call) ----------

function renderPasteModalHtml() {
  return `
    <div class="modal-backdrop" data-action="close-modal"></div>
    <div class="modal-card" role="dialog" aria-label="Paste Script or Audition Sides">
      <div class="modal-header">
        <h2>Paste Script or Audition Sides</h2>
        <button class="icon-btn" data-action="close-modal">✕</button>
      </div>
      <p class="settings-note">Paste lines from any play or screenplay. Put character cues in <code>ALL CAPS</code> on their own line or followed by a colon (e.g. <code>JULIET: O Romeo, Romeo!</code>).</p>
      <div class="paste-form">
        <div class="paste-row">
          <input id="paste-script-title" type="text" placeholder="Play or Scene Title (e.g. Audition Sides — Act II)" class="cloud-input">
          <input id="paste-script-author" type="text" placeholder="Playwright (optional)" class="cloud-input">
        </div>
        <textarea id="paste-script-body" rows="10" placeholder="ROMEO:&#10;But, soft! what light through yonder window breaks?&#10;&#10;JULIET:&#10;O Romeo, Romeo! wherefore art thou Romeo?"></textarea>
        <div class="modal-actions">
          <button class="quiet-btn" data-action="close-modal">Cancel</button>
          <button class="start-rehearsal-btn" data-action="submit-pasted-script">Parse &amp; Cast Roles →</button>
        </div>
      </div>
    </div>
  `;
}

function findWeakestUserLineIndex() {
  const entries = Object.entries(state.rehearsal.lineStats || {});
  if (!entries.length) return -1;
  let worstIdx = -1;
  let worstScore = 2;
  for (const [idxStr, st] of entries) {
    const effective = (st.accuracy ?? 1) - (st.prompted ? 0.35 : 0);
    if (effective < 0.85 && effective < worstScore) {
      worstScore = effective;
      worstIdx = Number(idxStr);
    }
  }
  return worstIdx;
}

function renderCurtainModalHtml() {
  const play = getActivePlay();
  const scene = getActiveScene(play);
  const stats = Object.values(state.rehearsal.lineStats);
  const avg = stats.length
    ? Math.round((stats.reduce((s, x) => s + (x.accuracy || 0), 0) / stats.length) * 100)
    : 100;
  const promptedCount = stats.filter((s) => s.prompted).length;
  const tol = TOLERANCE_LEVELS[state.settings.tolerance] || TOLERANCE_LEVELS['off-book'];
  const curTolPos = TOLERANCE_ORDER.indexOf(tol.id);
  const nextTolKey = curTolPos >= 0 && curTolPos + 1 < TOLERANCE_ORDER.length
    ? TOLERANCE_ORDER[curTolPos + 1]
    : null;
  const nextTol = nextTolKey ? TOLERANCE_LEVELS[nextTolKey] : null;
  const weakestIdx = findWeakestUserLineIndex();

  return `
    <div class="modal-backdrop" data-action="close-modal"></div>
    <div class="modal-card curtain-card" role="dialog" aria-label="Curtain Call">
      <span class="eyebrow">👏 CURTAIN CALL</span>
      <h2>Scene Complete!</h2>
      <p class="curtain-sub">${escHtml(play.title)} · ${escHtml(scene.title)}</p>

      <div class="curtain-stats">
        <div class="stat-pill">
          <strong>${avg}%</strong>
          <span>Line Accuracy</span>
        </div>
        <div class="stat-pill">
          <strong>${stats.length}</strong>
          <span>Your Speeches</span>
        </div>
        <div class="stat-pill">
          <strong>${promptedCount}</strong>
          <span>“Line!” Prompts</span>
        </div>
      </div>

      <p class="settings-note">
        ${nextTol
          ? `Rehearsed at <strong>${escHtml(tol.label)}</strong> strictness. Ready to tighten tolerance to <strong>${escHtml(nextTol.label)}</strong> for the next pass?`
          : `Mastered at <strong>${escHtml(tol.label)}</strong> — our strictest word-perfect level!`}
      </p>

      <div class="modal-actions curtain-actions">
        <button class="quiet-btn" data-action="nav" data-value="setup">Change Scene / Roles</button>
        ${weakestIdx >= 0 ? `<button class="secondary-btn" data-action="drill-weakest-line" data-value="${weakestIdx}">🎯 Drill Prompted / Shaky Cue</button>` : ''}
        <button class="secondary-btn" data-action="replay-scene">🔁 Run Again (${escHtml(tol.shortLabel)})</button>
        ${nextTol ? `<button class="start-rehearsal-btn" data-action="level-up-replay" data-value="${nextTol.id}">⬆ Tighten to ${escHtml(nextTol.shortLabel)} &amp; Run</button>` : ''}
      </div>
    </div>
  `;
}

// ---------- Helpers & Action Dispatch ----------

export function formatSpeakerName(allCaps) {
  return String(allCaps || '')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function downloadBackupFile() {
  const data = JSON.stringify(backupCopy(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scene-partner-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function handleBackupFilePicked(file) {
  if (!file) return;
  if (typeof file.size === 'number' && file.size > 4 * 1024 * 1024) {
    statusNotice = 'Backup file exceeds the 4 MB safety limit.';
    renderApp();
    return;
  }
  try {
    const text = await file.text();
    const copy = readBackup(text);
    if (copy && restoreBackup(copy)) {
      location.reload();
    } else {
      statusNotice = 'That file is not a valid Scene Partner backup.';
      renderApp();
    }
  } catch (e) {}
}

export const uiActions = {
  'nav': (val) => navigateTo(val),
  'select-play': (val) => selectPlay(val),
  'delete-custom-play': (val) => deleteCustomPlay(val),
  'toggle-verbatim-only': () => {
    verbatimOnlyFilter = !verbatimOnlyFilter;
    renderApp();
  },
  'select-scene': (val) => selectScene(val),
  'toggle-char': (val) => toggleCharacterSelection(val),
  'preview-voice': (val) => previewCharacterVoice(val),
  'start-rehearsal': () => startSceneRehearsal(true),
  'resume-rehearsal': () => startSceneRehearsal(false),
  'replay-scene': () => startSceneRehearsal(true),
  'level-up-replay': (nextTol) => {
    if (TOLERANCE_LEVELS[nextTol]) {
      state.settings.tolerance = nextTol;
      saveState();
    }
    startSceneRehearsal(true);
  },
  'drill-weakest-line': (val) => {
    const idx = Number(val);
    curtainModalOpen = false;
    state.screen = 'rehearsal';
    state.rehearsal.lineIndex = Number.isInteger(idx) && idx >= 0 ? Math.max(0, idx - 1) : 0;
    state.settings.loopLine = false;
    state.rehearsal.playing = true;
    saveState();
    renderApp();
    runCurrentLineTurn();
  },
  'toggle-play': () => togglePlayPauseRehearsal(),
  'step-line': (val) => stepLine(Number(val)),
  'jump-line': (val) => jumpToLine(Number(val)),
  'prompt-line': () => requestLinePrompt(),
  'finish-user-line': () => markUserLineDone(),
  'replay-partner-line': () => runCurrentLineTurn(),
  'set-theme': (val) => {
    if (THEMES[val]) {
      state.settings.theme = val;
      saveState();
      renderApp();
    }
  },
  'set-tolerance': (val) => {
    if (TOLERANCE_LEVELS[val]) {
      state.settings.tolerance = val;
      saveState();
      renderApp();
    }
  },
  'set-cue-vis': (val) => {
    if (CUE_VISIBILITY_MODES[val]) {
      state.settings.cueVisibility = val;
      saveState();
      renderApp();
    }
  },
  'toggle-cue-to-cue': () => {
    state.settings.cueToCue = !state.settings.cueToCue;
    saveState();
    renderApp();
  },
  'toggle-setting': (key) => {
    if (key in state.settings && typeof state.settings[key] === 'boolean') {
      state.settings[key] = !state.settings[key];
      saveState();
      renderApp();
    }
  },
  'set-voice-speed': (val) => {
    const num = Number(val);
    if (num >= 0.6 && num <= 1.6) {
      state.settings.voiceSpeed = num;
      saveState();
      renderApp();
    }
  },
  'font-scale': (val) => {
    const delta = Number(val);
    state.settings.fontScale = Math.min(1.4, Math.max(0.8, Number((state.settings.fontScale + delta).toFixed(2))));
    saveState();
    applyThemeToDom();
  },
  'filter-playwright': (val) => {
    selectedPlaywrightFilter = val || 'ALL';
    renderApp();
  },
  'clear-search': () => {
    searchQuery = '';
    renderApp();
  },
  'trigger-pdf-upload': () => {
    const input = $('pdf-file-input');
    if (input) {
      input.value = '';
      input.click();
    }
  },
  'open-paste-modal': () => {
    pasteModalOpen = true;
    renderApp();
  },
  'close-modal': () => {
    pasteModalOpen = false;
    curtainModalOpen = false;
    renderApp();
  },
  'submit-pasted-script': () => handlePastedScriptSubmit(),
  'open-settings': (tab) => openSettingsDrawer(tab || 'rehearsal'),
  'close-settings': () => closeSettingsDrawer(),
  'settings-tab': (tab) => {
    settingsTab = tab || 'rehearsal';
    renderApp();
  },
  'save-openai-key': async () => {
    const input = $('openai-api-key');
    const val = input?.value.trim() || '';
    if (val) {
      input.value = '';
      await saveVoiceApiKey(val);
      saveState();
      renderApp();
    } else if (hasOpenAiKey()) {
      await testOpenAiVoiceConnection();
      renderApp();
    } else {
      input?.focus();
    }
  },
  'test-openai-key': async () => {
    await testOpenAiVoiceConnection();
    renderApp();
  },
  'clear-openai-key': () => {
    clearVoiceApiKey();
    saveState();
    renderApp();
  },
  'cloud-save': () => {
    const input = $('cloud-token');
    const val = input?.value.trim() || '';
    if (val) {
      input.value = '';
      setCloudToken(val);
    } else if (cloudStatus().connected) {
      syncWithCloud({ restoreIfAhead: true });
    }
    renderCloudStatusInDrawer();
  },
  'cloud-clear': () => {
    clearCloudToken();
    renderCloudStatusInDrawer();
  },
  'backup-download': () => downloadBackupFile(),
  'backup-restore': () => {
    const input = $('backup-file-input');
    if (input) {
      input.value = '';
      input.click();
    }
  }
};

export function setSearchQuery(val) {
  searchQuery = val || '';
  renderApp();
  // Keep focus in search input after re-render
  const el = $('library-search');
  if (el) {
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }
}
