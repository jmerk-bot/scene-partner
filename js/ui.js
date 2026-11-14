// Complete UI & Rehearsal Controller for Scene Partner.
//
// Streamlined around three calm, focused views:
//   1. Script Library (`state.screen === 'library'`)
//   2. Single-Card Scene & Role Setup (`state.screen === 'setup'`)
//   3. Unified Karaoke Script Stage (`state.screen === 'rehearsal'`)
// Plus a single-sheet Settings drawer.

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

const QUICK_PLAYWRIGHTS = [
  'William Shakespeare',
  'Anton Chekhov',
  'Oscar Wilde',
  'Henrik Ibsen',
  'Sophocles'
];

// Transient UI state (not persisted on every keystroke)
let searchQuery = '';
let selectedPlaywrightFilter = 'ALL';
let liveSpokenTranscript = '';
let liveEvaluation = null;
let partnerActiveWordIndex = -1;
let partnerAudioLoading = false;
let micStatus = 'idle'; // 'idle' | 'listening' | 'blocked' | 'unsupported' | 'warning'
let statusNotice = '';
let settingsOpen = false;
let setupVoicesOpen = false;
let voiceSectionOpen = null; // null = auto-open only when unconfigured/error
let cloudSectionOpen = false;
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
  if (document.body) {
    document.body.dataset.screen = state.screen;
  }
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
  const validChars = state.selectedCharacters.filter((c) => play.characters.includes(c));
  state.selectedCharacters = validChars.length ? validChars : (play.characters[0] ? [play.characters[0]] : []);
  state.rehearsal.lineIndex = 0;
  state.rehearsal.lineStats = {};
  setupVoicesOpen = false;
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
    .find((l) => l.speaker === charName)?.text || 'Speak the speech, I pray you, as I pronounced it to you.';
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
    state.rehearsal.lineIndex = idx - 1;
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
  else scrollActiveLineIntoView();
}

export function advanceRehearsalStep() {
  const scene = getActiveScene();
  const currentLine = scene.lines[state.rehearsal.lineIndex];
  if (!currentLine) return;
  if (isUserCharacter(currentLine.speaker)) {
    markUserLineDone();
  } else if (state.rehearsal.lineIndex + 1 < scene.lines.length) {
    stepLine(1);
  } else {
    finishSceneRehearsal();
  }
}

export function jumpToLine(index) {
  const scene = getActiveScene();
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0 || idx >= scene.lines.length) return;
  if (idx === state.rehearsal.lineIndex) return;
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
  else scrollActiveLineIntoView();
}

// Prompt / "Line!" button: reveals & speaks the next 5 words of the actor's line
export function requestLinePrompt() {
  const play = getActivePlay();
  const scene = getActiveScene(play);
  const currentLine = scene.lines[state.rehearsal.lineIndex];
  if (!currentLine) return;

  const tokens = tokenizeLine(currentLine.text);
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

  // Cue-to-Cue skip logic: jump to 1 line before the user's next cue
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

  warmUpcomingPartnerLines(play, scene, idx + 1, voiceMap);

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
  if (typeof requestAnimationFrame !== 'function') return;
  requestAnimationFrame(() => {
    const activeEl = $('active-speech-card');
    activeEl?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
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
      statusNotice = 'Could not detect character cues in that file. Try pasting the script text using CHARACTER: Line format.';
      renderApp();
      return;
    }

    state.customPlays = [parsedPlay, ...state.customPlays.filter((p) => p.title !== parsedPlay.title)].slice(0, 25);
    statusNotice = '';
    selectPlay(parsedPlay.id);
  } catch (e) {
    statusNotice = `Could not parse "${file.name.slice(0, 80)}". Try pasting your script text instead.`;
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
    statusNotice = 'Put character names in ALL CAPS or follow them with a colon (e.g. HAMLET: To be, or not to be).';
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
  // Preserve open/closed state of <details> disclosures across re-renders
  const existingSetupVoices = $('setup-voices-details');
  if (existingSetupVoices) setupVoicesOpen = existingSetupVoices.open;
  const existingVoiceDetails = $('settings-voice-details');
  if (existingVoiceDetails) voiceSectionOpen = existingVoiceDetails.open;
  const existingCloudDetails = $('settings-cloud-details');
  if (existingCloudDetails) cloudSectionOpen = existingCloudDetails.open;

  applyThemeToDom();

  const headerEl = $('app-header');
  const mainEl = $('app-main');
  const drawerEl = $('settings-drawer');
  const modalEl = $('modal-layer');

  if (headerEl) headerEl.innerHTML = renderHeaderHtml();
  if (mainEl) {
    if (state.screen === 'library') mainEl.innerHTML = renderLibraryScreenHtml();
    else if (state.screen === 'setup') mainEl.innerHTML = renderSetupScreenHtml();
    else {
      mainEl.innerHTML = renderRehearsalScreenHtml();
      scrollActiveLineIntoView();
    }
  }

  if (drawerEl) {
    drawerEl.hidden = !settingsOpen;
    if (settingsOpen) {
      drawerEl.innerHTML = renderSettingsDrawerHtml();
      renderCloudStatusInDrawer();
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
  const vStatus = voiceEngineStatus();

  let voiceChipHtml = '';
  if (vStatus.hasOpenAiKey) {
    if (vStatus.lastError && !vStatus.active) {
      voiceChipHtml = `<button class="status-chip voice-warn" data-action="open-settings" data-value="voices" title="${escHtml(vStatus.lastError)}">⚠️ Voice Key</button>`;
    } else {
      voiceChipHtml = `<button class="status-chip voice-ok" data-action="open-settings" data-value="voices" title="OpenAI Neural Voices active (${escHtml(vStatus.maskedKey)})"><span class="status-dot"></span>Neural</button>`;
    }
  } else {
    voiceChipHtml = `<button class="status-chip voice-offline" data-action="open-settings" data-value="voices" title="Using basic offline voices — tap to add OpenAI key">+ Neural Voice</button>`;
  }

  return `
    <div class="header-inner">
      <button class="brand-btn" data-action="nav" data-value="library" title="All Scripts">
        <img class="brand-logo" src="./icons/icon.svg" alt="" width="30" height="30">
        <span class="brand-title">Scene Partner</span>
      </button>

      <div class="header-controls">
        ${voiceChipHtml}
        <button class="icon-btn" data-action="open-settings" data-value="rehearsal" aria-label="Settings">
          ⚙️ <span class="hide-compact">Settings</span>
        </button>
      </div>
    </div>
  `;
}

// ---------- Screen 1: Calm Script Library ----------

function renderLibraryScreenHtml() {
  const allPlays = getAllPlays(state.customPlays);
  const activePlay = getActivePlay();
  const activeScene = getActiveScene(activePlay);
  const activeRoles = state.selectedCharacters.map(formatSpeakerName).join(', ');
  const hasProgress = (state.rehearsal.lineIndex || 0) > 0 || (state.rehearsal.totalLinesPracticed || 0) > 0;

  const playwrightGroups = groupPlaysByPlaywright(allPlays);
  const q = searchQuery.trim().toLowerCase();

  const filteredGroups = playwrightGroups
    .filter((g) => {
      if (selectedPlaywrightFilter === 'ALL') return true;
      if (selectedPlaywrightFilter === 'CUSTOM') return g.plays.some((p) => p.custom);
      return g.playwright === selectedPlaywrightFilter;
    })
    .map((g) => ({
      ...g,
      plays: g.plays.filter((p) => {
        if (selectedPlaywrightFilter === 'CUSTOM' && !p.custom) return false;
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.playwright.toLowerCase().includes(q) ||
          p.characters.some((c) => c.toLowerCase().includes(q))
        );
      })
    }))
    .filter((g) => g.plays.length > 0);

  // Clean quick pills for the top playwrights + a single dropdown for all 25+ playwrights
  const quickPills = [
    `<button class="filter-pill ${selectedPlaywrightFilter === 'ALL' ? 'active' : ''}" data-action="filter-playwright" data-value="ALL">All (${allPlays.length})</button>`,
    state.customPlays.length
      ? `<button class="filter-pill ${selectedPlaywrightFilter === 'CUSTOM' ? 'active' : ''}" data-action="filter-playwright" data-value="CUSTOM">Uploaded (${state.customPlays.length})</button>`
      : '',
    ...QUICK_PLAYWRIGHTS
      .filter((name) => playwrightGroups.some((g) => g.playwright === name))
      .map((name) => {
        const shortLabel = name === 'William Shakespeare' ? 'Shakespeare' : name.split(' ').pop();
        return `<button class="filter-pill ${selectedPlaywrightFilter === name ? 'active' : ''}" data-action="filter-playwright" data-value="${escHtml(name)}">${escHtml(shortLabel)}</button>`;
      })
  ].filter(Boolean).join('');

  const selectOptions = [
    `<option value="ALL" ${selectedPlaywrightFilter === 'ALL' ? 'selected' : ''}>All Playwrights (${allPlays.length})</option>`,
    ...playwrightGroups.map((g) =>
      `<option value="${escHtml(g.playwright)}" ${selectedPlaywrightFilter === g.playwright ? 'selected' : ''}>${escHtml(g.playwright)} (${g.plays.length})</option>`
    )
  ].join('');

  const sectionsHtml = filteredGroups.length
    ? filteredGroups.map((group) => `
      <section class="playwright-section">
        <div class="section-heading">
          <h2>${escHtml(group.playwright)}</h2>
          <span class="section-sub">${escHtml(group.era)}</span>
        </div>
        <div class="play-grid">
          ${group.plays.map((p) => renderPlayCardHtml(p)).join('')}
        </div>
      </section>
    `).join('')
    : `<div class="empty-library">
         <p>No scripts matched “${escHtml(searchQuery)}”.</p>
         <button class="secondary-btn" data-action="clear-search">Show All Scripts</button>
       </div>`;

  return `
    <div class="library-container">
      ${hasProgress ? `
        <section class="resume-bar" aria-label="Continue active rehearsal">
          <div class="resume-bar-text">
            <span class="resume-dot"></span>
            <span><strong>${escHtml(activePlay.title)}</strong> · ${escHtml(activeScene.title)} (${escHtml(activeRoles || 'Lead')})</span>
          </div>
          <div class="resume-bar-actions">
            <button class="quiet-btn small" data-action="nav" data-value="setup">Setup</button>
            <button class="primary-pill-btn small" data-action="resume-rehearsal">▶ Resume</button>
          </div>
        </section>
      ` : ''}

      <section id="upload-drop-zone" class="library-top-card">
        <div class="library-top-row">
          <div>
            <h1>Choose a Script</h1>
            <p class="subtle-line">Pick a classic play below, or drop your own PDF / text sides.</p>
          </div>
          <div class="upload-btn-group">
            <button class="secondary-btn" data-action="trigger-pdf-upload">📄 Upload PDF</button>
            <button class="quiet-btn" data-action="open-paste-modal">✍️ Paste Sides</button>
          </div>
        </div>

        ${statusNotice ? `<p class="status-banner">${escHtml(statusNotice)}</p>` : ''}

        <div class="library-filter-row">
          <div class="search-box">
            <span class="search-icon" aria-hidden="true">🔍</span>
            <input
              id="library-search"
              type="search"
              placeholder="Search title, playwright, or character…"
              value="${escHtml(searchQuery)}"
              autocomplete="off"
            >
            ${searchQuery ? `<button class="clear-search-btn" data-action="clear-search" aria-label="Clear search">✕</button>` : ''}
          </div>
          <select id="playwright-select" class="playwright-select" aria-label="Filter by playwright">
            ${selectOptions}
          </select>
        </div>

        <div class="quick-pills-row">
          ${quickPills}
        </div>
      </section>

      ${sectionsHtml}
    </div>
  `;
}

function renderPlayCardHtml(play) {
  const isSelected = play.id === state.selectedPlayId;
  const topRoles = play.characters.slice(0, 4).map(formatSpeakerName).join(', ');

  return `
    <article class="play-card ${isSelected ? 'selected' : ''}" data-action="select-play" data-value="${escHtml(play.id)}">
      <div class="play-card-head">
        <h3 class="play-title">${escHtml(play.title)}</h3>
        ${play.custom
          ? `<button class="delete-play-btn" data-action="delete-custom-play" data-value="${escHtml(play.id)}" title="Delete uploaded script" aria-label="Delete ${escHtml(play.title)}">🗑️</button>`
          : ''}
      </div>
      <p class="play-author">${escHtml(play.playwright)}${play.year ? ` · ${escHtml(play.year)}` : ''}${play.custom ? ' · Uploaded' : ''}</p>
      <p class="play-roles">${escHtml(topRoles)}</p>
    </article>
  `;
}

// ---------- Screen 2: Single-Card Setup ----------

function renderSetupScreenHtml() {
  const play = getActivePlay();
  const scene = getActiveScene(play);
  const voiceMap = assignVoicesToCharacters(play.characters, state.voiceOverrides);
  const activeTol = TOLERANCE_LEVELS[state.settings.tolerance] || TOLERANCE_LEVELS['off-book'];

  const sceneCounts = Object.create(null);
  for (const l of scene.lines) {
    if (isSafeObjectKey(l.speaker)) {
      sceneCounts[l.speaker] = (sceneCounts[l.speaker] || 0) + 1;
    }
  }

  const scenePills = play.scenes.map((sc) => {
    const active = sc.id === scene.id ? 'active' : '';
    return `
      <button class="scene-pill ${active}" data-action="select-scene" data-value="${escHtml(sc.id)}">
        <strong>${escHtml(sc.title)}</strong>
        <span>${sc.lines.length} cues</span>
      </button>
    `;
  }).join('');

  const roleChips = play.characters.map((charName) => {
    const isMine = isUserCharacter(charName);
    const count = sceneCounts[charName] ?? play.characterLineCounts[charName] ?? 0;
    return `
      <button class="role-chip ${isMine ? 'active' : ''}" data-action="toggle-char" data-value="${escHtml(charName)}">
        <span class="role-chip-mark">${isMine ? '✓' : '+'}</span>
        <span>${escHtml(formatSpeakerName(charName))}</span>
        <small>${count}</small>
      </button>
    `;
  }).join('');

  const partnerChars = play.characters.filter((c) => !isUserCharacter(c));
  const partnerVoiceRows = partnerChars.map((charName) => {
    const assigned = voiceMap[charName] || VOICE_PROFILES[0];
    const opts = VOICE_PROFILES.map((v) =>
      `<option value="${v.id}" ${v.id === assigned.id ? 'selected' : ''}>${escHtml(v.name)} — ${escHtml(v.archetype.split('·')[0].trim())}</option>`
    ).join('');
    return `
      <div class="partner-voice-row">
        <span class="partner-voice-name">
          <span class="voice-dot" style="background:${safeCssColor(assigned.color)}"></span>
          ${escHtml(formatSpeakerName(charName))}
        </span>
        <div class="partner-voice-actions">
          <select class="voice-select" data-char-voice="${escHtml(charName)}" aria-label="Voice for ${escHtml(charName)}">
            ${opts}
          </select>
          <button class="quiet-btn small" data-action="preview-voice" data-value="${escHtml(charName)}" title="Preview voice">🔊</button>
        </div>
      </div>
    `;
  }).join('');

  const cueVisPills = Object.values(CUE_VISIBILITY_MODES).map((m) => {
    const shortLabels = {
      full: 'Show Words',
      'first-words': 'First 3 Words',
      'off-book-blind': 'Off-Book'
    };
    return `
      <button class="seg-btn ${state.settings.cueVisibility === m.id ? 'active' : ''}" data-action="set-cue-vis" data-value="${m.id}">
        ${escHtml(shortLabels[m.id] || m.label)}
      </button>
    `;
  }).join('');

  const tolPills = TOLERANCE_ORDER.map((key) => {
    const item = TOLERANCE_LEVELS[key];
    return `
      <button class="seg-btn ${state.settings.tolerance === key ? 'active' : ''}" data-action="set-tolerance" data-value="${key}">
        ${escHtml(item.shortLabel)}
      </button>
    `;
  }).join('');

  return `
    <div class="setup-wrap">
      <div class="setup-card">
        <div class="setup-card-nav">
          <button class="quiet-btn small" data-action="nav" data-value="library">← All Scripts</button>
          <span class="setup-author">${escHtml(play.playwright)}</span>
        </div>

        <h1 class="setup-title">${escHtml(play.title)}</h1>
        ${play.studioScene ? `<p class="studio-note">Studio rehearsal cut · <button class="inline-link-btn" data-action="open-paste-modal">Paste your own script cut</button></p>` : ''}

        ${play.scenes.length > 1 ? `
          <div class="setup-group">
            <label class="setup-label">Scene</label>
            <div class="scene-pill-grid">${scenePills}</div>
          </div>
        ` : `
          <p class="single-scene-meta">${escHtml(scene.title)} · ${scene.lines.length} speeches</p>
        `}

        <div class="setup-group">
          <label class="setup-label">Who are you playing?</label>
          <div class="role-chip-grid">${roleChips}</div>

          ${partnerChars.length ? `
            <details id="setup-voices-details" class="subtle-disclosure" ${setupVoicesOpen ? 'open' : ''}>
              <summary>Customize partner voices (${partnerChars.length})</summary>
              <div class="partner-voice-list">${partnerVoiceRows}</div>
            </details>
          ` : ''}
        </div>

        <div class="setup-group">
          <label class="setup-label">My Lines</label>
          <div class="seg-row">${cueVisPills}</div>
        </div>

        <div class="setup-group">
          <div class="setup-label-row">
            <label class="setup-label">Line Matching</label>
            <span class="setup-hint">${escHtml(activeTol.desc)}</span>
          </div>
          <div class="seg-row">${tolPills}</div>
        </div>

        <div class="setup-footer">
          <button
            type="button"
            class="cue-skip-check ${state.settings.cueToCue ? 'active' : ''}"
            data-action="toggle-cue-to-cue"
            role="checkbox"
            aria-checked="${state.settings.cueToCue ? 'true' : 'false'}"
          >
            <span class="mini-check-box" aria-hidden="true">${state.settings.cueToCue ? '✓' : ''}</span>
            <span>Jump straight to my cues (Cue-to-Cue)</span>
          </button>

          <button class="start-rehearsal-btn full-cta" data-action="start-rehearsal">
            Start Rehearsal ▶
          </button>
        </div>
      </div>
    </div>
  `;
}

// ---------- Screen 3: Unified Karaoke Script Stage ----------

function renderRehearsalScreenHtml() {
  const play = getActivePlay();
  const scene = getActiveScene(play);
  const lines = scene.lines || [];
  const currentIdx = Math.min(Math.max(0, state.rehearsal.lineIndex), Math.max(0, lines.length - 1));
  const currentLine = lines[currentIdx];
  const userTurn = currentLine ? isUserCharacter(currentLine.speaker) : false;
  const voiceMap = assignVoicesToCharacters(play.characters, state.voiceOverrides);
  const focusFull = Boolean(state.settings.focusLayout);

  const visShort = [
    { id: 'full', label: 'Show' },
    { id: 'first-words', label: 'First 3' },
    { id: 'off-book-blind', label: 'Off-Book' }
  ];
  const cueVisButtons = visShort.map((m) => `
    <button class="vis-pill ${state.settings.cueVisibility === m.id ? 'active' : ''}" data-action="set-cue-vis" data-value="${m.id}">
      ${escHtml(m.label)}
    </button>
  `).join('');

  const scriptSpeechesHtml = lines.map((line, idx) =>
    renderStageSpeechHtml(line, idx, currentIdx, voiceMap)
  ).join('');

  return `
    <div class="rehearsal-stage ${focusFull ? 'is-focus-layout' : ''}">
      <div class="stage-topbar">
        <div class="stage-meta">
          <button class="quiet-btn small" data-action="nav" data-value="setup">← Setup</button>
          <div class="stage-titles">
            <strong>${escHtml(play.title)}</strong>
            <span>${escHtml(scene.title)} · ${currentIdx + 1} / ${lines.length}</span>
          </div>
        </div>

        <div class="stage-right-cluster">
          <div class="stage-vis-group" role="group" aria-label="My line visibility">
            ${cueVisButtons}
          </div>
          <div id="mic-status-slot" class="mic-status-slot">
            ${renderMicBadgeHtml(userTurn, currentLine, voiceMap)}
          </div>
        </div>
      </div>

      <section id="rehearsal-script-stage" class="script-stage-canvas" aria-label="Scene script">
        ${scriptSpeechesHtml}
      </section>

      <footer class="rehearsal-transport">
        <button class="transport-btn" data-action="step-line" data-value="-1" ${currentIdx === 0 ? 'disabled' : ''}>
          ⏮ Back
        </button>

        <button class="transport-btn play-pause-btn" data-action="toggle-play">
          ${state.rehearsal.playing ? '⏸ Pause' : '▶ Play'}
        </button>

        ${userTurn ? `
          <button class="transport-btn prompt-line-btn" data-action="prompt-line" title="Reveal and speak the next 5 words (or say 'Line!' aloud)">
            💡 Line!
          </button>
        ` : `
          <button class="transport-btn" data-action="replay-partner-line" title="Replay partner speech">
            🔊 Replay
          </button>
        `}

        <button class="transport-btn next-action-btn" data-action="advance-rehearsal">
          ${userTurn ? 'Done →' : 'Skip →'}
        </button>
      </footer>
    </div>
  `;
}

function renderStageSpeechHtml(line, idx, currentIdx, voiceMap) {
  const isCurrent = idx === currentIdx;
  const isPast = idx < currentIdx;
  const isMine = isUserCharacter(line.speaker);
  const profile = voiceMap[line.speaker] || VOICE_PROFILES[0];

  if (isCurrent) {
    return `
      <article
        id="active-speech-card"
        class="script-speech is-current ${isMine ? 'user-turn' : 'partner-turn'}"
      >
        <div class="speech-header">
          <span class="speech-speaker" style="${!isMine ? `color:${safeCssColor(profile.color)}` : ''}">
            ${escHtml(formatSpeakerName(line.speaker))}
          </span>
          ${isMine
            ? '<span class="role-badge your-cue-badge">YOUR CUE</span>'
            : `<span class="role-badge partner-cue-badge">${escHtml(profile.name)}</span>`}
        </div>
        ${line.direction ? `<div class="speech-direction">[${escHtml(line.direction)}]</div>` : ''}
        <div id="active-karaoke-words" class="karaoke-line-display">
          ${renderActiveWordsInnerHtml(line, isMine)}
        </div>
      </article>
    `;
  }

  const maskUpcoming = isMine && !isPast && state.settings.cueVisibility === 'off-book-blind';

  return `
    <article
      class="script-speech ${isPast ? 'is-past' : 'is-upcoming'} ${isMine ? 'is-mine' : 'is-partner'}"
      data-action="jump-line"
      data-value="${idx}"
    >
      <div class="speech-header">
        <span class="speech-speaker" style="${!isMine ? `color:${safeCssColor(profile.color)}` : ''}">
          ${escHtml(formatSpeakerName(line.speaker))}
        </span>
        ${isMine ? '<span class="mini-you-tag">YOU</span>' : ''}
      </div>
      ${line.direction ? `<div class="speech-direction">[${escHtml(line.direction)}]</div>` : ''}
      <p class="speech-text ${maskUpcoming ? 'blurred-line' : ''}">${escHtml(line.text)}</p>
    </article>
  `;
}

function renderActiveWordsInnerHtml(currentLine, userTurn) {
  if (!currentLine) return '';
  const visMode = state.settings.cueVisibility;

  if (userTurn) {
    const evalData = liveEvaluation || evaluateSpokenLine(currentLine.text, liveSpokenTranscript, state.settings.tolerance);
    return evalData.tokens.map((tok, i) => {
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
  }

  const tokens = tokenizeLine(currentLine.text);
  return tokens.map((tok, i) => {
    const stateCls = partnerActiveWordIndex < 0
      ? ''
      : i < partnerActiveWordIndex
        ? 'partner-spoken'
        : i === partnerActiveWordIndex
          ? 'partner-active'
          : 'partner-upcoming';
    return `<span class="karaoke-word ${stateCls}">${escHtml(tok.display)}</span>`;
  }).join(' ');
}

function renderMicBadgeHtml(userTurn, currentLine, voiceMap) {
  if (!state.rehearsal.playing) {
    return `<span class="mic-pill paused">⏸ Paused</span>`;
  }
  if (!userTurn) {
    if (partnerAudioLoading) {
      return `<span class="mic-pill partner">⏳ Loading…</span>`;
    }
    const speaker = currentLine ? formatSpeakerName(currentLine.speaker) : 'Partner';
    return `<span class="mic-pill partner">🔊 ${escHtml(speaker)}</span>`;
  }
  if (micStatus === 'listening') {
    return `<span class="mic-pill listening"><span class="pulse-dot"></span> Listening</span>`;
  }
  if (micStatus === 'blocked' || micStatus === 'unsupported') {
    return `<span class="mic-pill blocked">Mic Off · Tap Done</span>`;
  }
  return `<span class="mic-pill ready">🎙️ Your Cue</span>`;
}

export function renderKaraokeFocusOnly() {
  const wordsEl = $('active-karaoke-words');
  if (!wordsEl) return;

  const play = getActivePlay();
  const scene = getActiveScene(play);
  const currentIdx = Math.min(Math.max(0, state.rehearsal.lineIndex), Math.max(0, scene.lines.length - 1));
  const currentLine = scene.lines[currentIdx];
  if (!currentLine) return;

  const userTurn = isUserCharacter(currentLine.speaker);
  wordsEl.innerHTML = renderActiveWordsInnerHtml(currentLine, userTurn);

  // Smoothly keep the active spoken word centered inside the unified script canvas during long monologues
  const stageEl = $('rehearsal-script-stage');
  const activeWordEl = wordsEl.querySelector('.word-active, .partner-active');
  if (stageEl && activeWordEl) {
    const stageRect = stageEl.getBoundingClientRect();
    const wordRect = activeWordEl.getBoundingClientRect();
    if (wordRect.bottom > stageRect.bottom - 36 || wordRect.top < stageRect.top + 28) {
      const offset = (wordRect.top - stageRect.top) - stageRect.height * 0.42;
      stageEl.scrollBy({ top: offset, behavior: 'smooth' });
    }
  }
  renderMicBadgeOnly();
}

function renderMicBadgeOnly() {
  const slot = $('mic-status-slot');
  if (!slot) return;
  const play = getActivePlay();
  const scene = getActiveScene(play);
  const currentLine = scene.lines[state.rehearsal.lineIndex];
  const voiceMap = assignVoicesToCharacters(play.characters, state.voiceOverrides);
  slot.innerHTML = renderMicBadgeHtml(currentLine ? isUserCharacter(currentLine.speaker) : false, currentLine, voiceMap);
}

// ---------- Single-Page Settings Drawer ----------

export function openSettingsDrawer(section = '') {
  if (section === 'voices') voiceSectionOpen = true;
  if (section === 'cloud') cloudSectionOpen = true;
  settingsOpen = true;
  renderApp();
}

export function closeSettingsDrawer() {
  settingsOpen = false;
  renderApp();
}

function renderSettingsDrawerHtml() {
  const status = voiceEngineStatus();
  const activeTol = TOLERANCE_LEVELS[state.settings.tolerance] || TOLERANCE_LEVELS['off-book'];
  const shouldOpenVoice = voiceSectionOpen !== null
    ? voiceSectionOpen
    : (!status.hasOpenAiKey || Boolean(status.lastError));

  const themePills = THEME_ORDER.map((k) => {
    const t = THEMES[k];
    return `
      <button class="seg-btn ${state.settings.theme === k ? 'active' : ''}" data-action="set-theme" data-value="${k}">
        ${escHtml(t.shortLabel)}
      </button>
    `;
  }).join('');

  const tolPills = TOLERANCE_ORDER.map((k) => {
    const t = TOLERANCE_LEVELS[k];
    return `
      <button class="seg-btn ${state.settings.tolerance === k ? 'active' : ''}" data-action="set-tolerance" data-value="${k}">
        ${escHtml(t.shortLabel)}
      </button>
    `;
  }).join('');

  const speedPills = [0.85, 1.0, 1.15].map((spd) => `
    <button class="seg-btn ${Math.abs(state.settings.voiceSpeed - spd) < 0.04 ? 'active' : ''}" data-action="set-voice-speed" data-value="${spd}">
      ${spd}×
    </button>
  `).join('');

  const voiceSummaryBadge = status.hasOpenAiKey
    ? (status.lastError && !status.active ? '⚠️ Check Key' : '✨ OpenAI Active')
    : 'Offline Voices';

  return `
    <div class="drawer-backdrop" data-action="close-settings"></div>
    <aside class="drawer-panel" role="dialog" aria-label="Settings">
      <div class="drawer-header">
        <h2>Settings</h2>
        <button class="icon-btn" data-action="close-settings" aria-label="Close settings">✕</button>
      </div>

      <div class="drawer-body">
        <div class="settings-section">
          <h3>Stage Theme</h3>
          <div class="seg-row">${themePills}</div>

          <div class="inline-controls-row">
            <div class="inline-control-item">
              <span>Text Size (${Math.round((state.settings.fontScale || 1) * 100)}%)</span>
              <div class="mini-btn-pair">
                <button class="quiet-btn small" data-action="font-scale" data-value="-0.1">A−</button>
                <button class="quiet-btn small" data-action="font-scale" data-value="0.1">A+</button>
              </div>
            </div>
            <div class="inline-control-item">
              <span>Partner Speed</span>
              <div class="seg-row compact-seg">${speedPills}</div>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Line Strictness</h3>
          <div class="seg-row">${tolPills}</div>
          <p class="settings-note" style="margin-top:0.45rem;margin-bottom:0;">${escHtml(activeTol.label)} — ${escHtml(activeTol.desc)}</p>
        </div>

        <div class="settings-section">
          <h3>Rehearsal Flow</h3>
          ${renderToggleRow('autoAdvance', 'Auto-advance on match', 'Cue the next speaker automatically as soon as your line lands')}
          ${renderToggleRow('autoListen', 'Hands-free microphone', 'Listen automatically whenever it is your cue')}
          ${renderToggleRow('cueToCue', 'Cue-to-Cue mode', 'Skip stretches where your character has no lines')}
          ${renderToggleRow('loopLine', 'Loop current speech', 'Repeat the active cue on loop for monologue drill')}
          ${renderToggleRow('focusLayout', 'Across-the-room focus', 'Show only the active speech in oversized type')}
          ${renderToggleRow('readStageDirections', 'Read [stage directions]', 'Speak bracketed stage directions aloud')}
          ${renderToggleRow('sound', 'Cue chimes', 'Soft tone when your turn starts')}
        </div>

        <details id="settings-voice-details" class="settings-disclosure" ${shouldOpenVoice ? 'open' : ''}>
          <summary>
            <span>Neural Voices (OpenAI)</span>
            <span class="disclosure-pill">${escHtml(voiceSummaryBadge)}</span>
          </summary>
          <div class="disclosure-body">
            <p class="settings-note">
              ${status.hasOpenAiKey
                ? `Connected (${escHtml(status.maskedKey)}${status.lastModelUsed ? ` · ${escHtml(status.lastModelUsed)}` : ''}).`
                : 'Paste an OpenAI API key to upgrade all partner roles to natural studio voices.'}
            </p>
            ${status.lastError ? `<p class="error-note">${escHtml(status.lastError)}</p>` : ''}
            <div class="api-key-row">
              <input
                id="openai-api-key"
                class="cloud-input"
                type="password"
                placeholder="${status.hasOpenAiKey ? `Saved (${escHtml(status.maskedKey)}) — paste new sk-... key to replace` : 'Paste OpenAI key (sk-proj-...)'}"
                autocomplete="off"
                spellcheck="false"
              >
              <div class="cloud-actions">
                <button class="primary-pill-btn small" data-action="save-openai-key">Save &amp; Test</button>
                ${status.hasOpenAiKey ? `<button class="secondary-btn small" data-action="test-openai-key">🔊 Test</button>` : ''}
                ${status.hasOpenAiKey ? `<button class="quiet-btn small" data-action="clear-openai-key">Disconnect</button>` : ''}
              </div>
            </div>
          </div>
        </details>

        <details id="settings-cloud-details" class="settings-disclosure" ${cloudSectionOpen ? 'open' : ''}>
          <summary>
            <span>Cloud Sync &amp; Backups</span>
            <span class="disclosure-pill">${cloudStatus().connected ? 'Synced' : 'Local'}</span>
          </summary>
          <div class="disclosure-body">
            <p class="settings-note">Sync scripts, castings, and encrypted voice settings to a private GitHub Gist (<code>gist</code> scope).</p>
            <div class="api-key-row">
              <input id="cloud-token" class="cloud-input" type="password" placeholder="GitHub token (ghp_… or github_pat_…)" autocomplete="off" spellcheck="false">
              <div class="cloud-actions">
                <button class="secondary-btn small" data-action="cloud-save">Save &amp; Sync</button>
                <button id="cloud-clear" class="quiet-btn small" data-action="cloud-clear" hidden>Disconnect</button>
              </div>
              <p id="cloud-status" class="cloud-status"></p>
            </div>
            <div class="cloud-actions" style="margin-top:0.6rem;">
              <button class="quiet-btn small" data-action="backup-download">⬇ Export JSON</button>
              <button class="quiet-btn small" data-action="backup-restore">⬆ Import JSON</button>
            </div>
            <p class="settings-note" style="margin-top:0.65rem;margin-bottom:0;">
              ${state.rehearsal.completedScenes} scenes completed · ${state.rehearsal.totalLinesPracticed} cues · Best ${state.rehearsal.bestAccuracy || 0}%
            </p>
          </div>
        </details>
      </div>
    </aside>
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
    statusEl.textContent = 'Saved locally on this device.';
    return;
  }
  const time = info.lastSyncAt ? new Date(info.lastSyncAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
  const gistTag = info.gistId ? ` · Gist ${info.gistId.slice(0, 7)}` : '';
  if (info.state === 'syncing' || info.state === 'error') {
    statusEl.textContent = info.message;
  } else {
    statusEl.textContent = `Connected${time ? ` · Synced ${time}` : ''}${gistTag}`;
  }
}

onCloudStatus(() => {
  if (settingsOpen) renderCloudStatusInDrawer();
});

onVoiceStatusChange(() => {
  const headerEl = $('app-header');
  if (headerEl) headerEl.innerHTML = renderHeaderHtml();
  if (settingsOpen) renderApp();
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
    <div class="modal-card" role="dialog" aria-label="Paste Script Sides">
      <div class="modal-header">
        <h2>Paste Script Sides</h2>
        <button class="icon-btn" data-action="close-modal">✕</button>
      </div>
      <p class="settings-note">Put character names in <code>ALL CAPS</code> or before a colon (e.g. <code>JULIET: O Romeo, Romeo!</code>).</p>
      <div class="paste-form">
        <div class="paste-row">
          <input id="paste-script-title" type="text" placeholder="Scene Title (e.g. Audition Sides)" class="cloud-input">
          <input id="paste-script-author" type="text" placeholder="Playwright (optional)" class="cloud-input">
        </div>
        <textarea id="paste-script-body" rows="9" placeholder="ROMEO:&#10;But, soft! what light through yonder window breaks?&#10;&#10;JULIET:&#10;O Romeo, Romeo! wherefore art thou Romeo?"></textarea>
        <div class="modal-actions">
          <button class="quiet-btn" data-action="close-modal">Cancel</button>
          <button class="start-rehearsal-btn" data-action="submit-pasted-script">Use Script →</button>
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
    <div class="modal-card curtain-card" role="dialog" aria-label="Scene Complete">
      <span class="eyebrow">SCENE COMPLETE</span>
      <h2>${avg}% Accuracy</h2>
      <p class="curtain-sub">${escHtml(play.title)} · ${escHtml(scene.title)}${promptedCount ? ` · ${promptedCount} prompt${promptedCount === 1 ? '' : 's'}` : ' · Zero prompts'}</p>

      <div class="modal-actions curtain-actions">
        <button class="quiet-btn" data-action="nav" data-value="setup">Setup</button>
        ${weakestIdx >= 0 ? `<button class="secondary-btn" data-action="drill-weakest-line" data-value="${weakestIdx}">🎯 Drill Shaky Cue</button>` : ''}
        <button class="secondary-btn" data-action="replay-scene">🔁 Run Again</button>
        ${nextTol ? `<button class="start-rehearsal-btn" data-action="level-up-replay" data-value="${nextTol.id}">⬆ Try ${escHtml(nextTol.shortLabel)}</button>` : ''}
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
  'advance-rehearsal': () => advanceRehearsalStep(),
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
    if (settingsOpen) renderApp();
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
  'open-settings': (section) => openSettingsDrawer(section || ''),
  'close-settings': () => closeSettingsDrawer(),
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

export function setPlaywrightFilter(val) {
  selectedPlaywrightFilter = val || 'ALL';
  renderApp();
}

export function setSearchQuery(val) {
  searchQuery = val || '';
  renderApp();
  const el = $('library-search');
  if (el) {
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }
}
