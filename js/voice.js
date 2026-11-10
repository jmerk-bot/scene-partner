// Voice production (TTS) and Speech-to-Text (STT) engine for Scene Partner.
//
// Supports:
//   1. High-quality OpenAI Neural TTS (`gpt-4o-mini-tts` / `tts-1`) with 11 distinct
//      theatrical character voices and prosody instructions, cached in memory so
//      re-running a scene is instant and doesn't re-bill.
//   2. Automatic fallback to curated Browser SpeechSynthesis voices with distinct
//      pitch and rate profiles per character when offline or when no API key is set.
//   3. Live streaming Speech-to-Text via Browser SpeechRecognition (`webkitSpeechRecognition`)
//      for real-time word-by-word karaoke highlighting, paired with optional OpenAI
//      Whisper / `gpt-4o-mini-transcribe` verification when an OpenAI key is configured.
//   4. Gentle Web Audio stage chimes (soft cue tone, prompt chime, curtain chord).

import { pickBestAlternativeForScript } from './matcher.js';

const OPENAI_KEY_STORAGE = 'scene-partner:openai:v1';

// 11 distinct character voice profiles (OpenAI voice ID + theatrical persona + Web Speech fallback tuning)
export const VOICE_PROFILES = [
  {
    id: 'onyx',
    name: 'Onyx',
    OpenAIVoice: 'onyx',
    archetype: 'Commanding Baritone · Kings, Ghosts & Elders',
    gender: 'male',
    pitch: 0.84,
    rate: 0.92,
    color: '#60a5fa',
    instructions: 'Speak with a resonant, commanding classical theatre baritone voice with clear diction and gravitas.'
  },
  {
    id: 'shimmer',
    name: 'Shimmer',
    OpenAIVoice: 'shimmer',
    archetype: 'Lyrical Soprano · Leading Ladies & Ingenues',
    gender: 'female',
    pitch: 1.12,
    rate: 0.97,
    color: '#f472b6',
    instructions: 'Speak with an expressive, warm, lyrical theatrical voice full of emotion and clarity.'
  },
  {
    id: 'echo',
    name: 'Echo',
    OpenAIVoice: 'echo',
    archetype: 'Warm Tenor · Romantic Leads & Poets',
    gender: 'male',
    pitch: 0.98,
    rate: 0.96,
    color: '#34d399',
    instructions: 'Speak with an earnest, articulate, expressive theatrical tenor voice.'
  },
  {
    id: 'nova',
    name: 'Nova',
    OpenAIVoice: 'nova',
    archetype: 'Spirited Wit · Comedic Heroines & Rebels',
    gender: 'female',
    pitch: 1.06,
    rate: 1.02,
    color: '#fbbf24',
    instructions: 'Speak with a bright, witty, agile theatrical voice with crisp comedic timing.'
  },
  {
    id: 'fable',
    name: 'Fable',
    OpenAIVoice: 'fable',
    archetype: 'Classical British · Nobles, Puck & Narrators',
    gender: 'neutral',
    pitch: 1.02,
    rate: 0.98,
    color: '#a78bfa',
    instructions: 'Speak with a refined classical British theatrical cadence, rich storytelling inflection, and crisp consonants.'
  },
  {
    id: 'alloy',
    name: 'Alloy',
    OpenAIVoice: 'alloy',
    archetype: 'Measured Contralto · Queens, Judges & Mentors',
    gender: 'female',
    pitch: 0.92,
    rate: 0.94,
    color: '#fb923c',
    instructions: 'Speak with a poised, dignified, authoritative theatrical contralto.'
  },
  {
    id: 'ash',
    name: 'Ash',
    OpenAIVoice: 'ash',
    archetype: 'Gritty Bass-Baritone · Villains, Soldiers & Rivals',
    gender: 'male',
    pitch: 0.88,
    rate: 0.95,
    color: '#f87171',
    instructions: 'Speak with a sharp, intense, grounded dramatic voice.'
  },
  {
    id: 'coral',
    name: 'Coral',
    OpenAIVoice: 'coral',
    archetype: 'Warm Mezzo · Confidantes, Mothers & Friends',
    gender: 'female',
    pitch: 1.04,
    rate: 0.96,
    color: '#2dd4bf',
    instructions: 'Speak with a warm, empathetic, conversational stage voice.'
  },
  {
    id: 'sage',
    name: 'Sage',
    OpenAIVoice: 'sage',
    archetype: 'Thoughtful Scholar · Philosophers, Doctors & Friars',
    gender: 'neutral',
    pitch: 0.95,
    rate: 0.91,
    color: '#c084fc',
    instructions: 'Speak with a calm, measured, wise theatrical cadence.'
  },
  {
    id: 'ballad',
    name: 'Ballad',
    OpenAIVoice: 'ballad',
    archetype: 'Melodic Storyteller · Bards, Messengers & Chorus',
    gender: 'male',
    pitch: 1.0,
    rate: 0.95,
    color: '#38bdf8',
    instructions: 'Speak with a poetic, musical, theatrical storytelling delivery.'
  },
  {
    id: 'verse',
    name: 'Verse',
    OpenAIVoice: 'verse',
    archetype: 'Dynamic Stage Actor · Mercurial Wits & Courtiers',
    gender: 'male',
    pitch: 1.01,
    rate: 0.98,
    color: '#818cf8',
    instructions: 'Speak with a dynamic, expressive, classical stage actor delivery.'
  },
  {
    id: 'marin',
    name: 'Marin',
    OpenAIVoice: 'marin',
    archetype: 'Crisp Modern Lead · Contemporary & Realist Drama',
    gender: 'female',
    pitch: 1.05,
    rate: 0.98,
    color: '#fb7185',
    instructions: 'Speak with a natural, deeply human, emotionally nuanced theatrical delivery.'
  },
  {
    id: 'cedar',
    name: 'Cedar',
    OpenAIVoice: 'cedar',
    archetype: 'Rich Character Actor · Grounded Drama & Classics',
    gender: 'male',
    pitch: 0.90,
    rate: 0.95,
    color: '#a3e635',
    instructions: 'Speak with a warm, grounded, natural character-actor voice.'
  }
];

export const STAGE_DIRECTION_VOICE = {
  id: 'stage',
  name: 'Stage Manager',
  OpenAIVoice: 'fable',
  pitch: 0.95,
  rate: 1.0,
  color: '#9ca3af',
  instructions: 'Read this stage direction neutrally and concisely like a stage manager in rehearsal.'
};

// Known character hints so famous roles automatically get a fitting voice archetype
const CHARACTER_ARCHETYPE_HINTS = {
  HAMLET: 'echo',
  HORATIO: 'sage',
  CLAUDIUS: 'onyx',
  GERTRUDE: 'alloy',
  OPHELIA: 'shimmer',
  GHOST: 'onyx',
  POLONIUS: 'fable',
  LAERTES: 'ash',
  ROMEO: 'echo',
  JULIET: 'shimmer',
  MERCUTIO: 'fable',
  BENVOLIO: 'ballad',
  TYBALT: 'ash',
  NURSE: 'coral',
  FRIAR_LAURENCE: 'sage',
  MACBETH: 'onyx',
  LADY_MACBETH: 'alloy',
  BANQUO: 'echo',
  MACDUFF: 'ash',
  OTHELLO: 'onyx',
  IAGO: 'ash',
  DESDEMONA: 'shimmer',
  EMILIA: 'coral',
  CASSIO: 'echo',
  LEAR: 'onyx',
  CORDELIA: 'shimmer',
  GONERIL: 'alloy',
  REGAN: 'nova',
  EDMUND: 'ash',
  EDGAR: 'echo',
  FOOL: 'fable',
  KENT: 'sage',
  PUCK: 'fable',
  OBERON: 'onyx',
  TITANIA: 'shimmer',
  BOTTOM: 'ash',
  HERMIA: 'nova',
  HELENA: 'coral',
  LYSANDER: 'echo',
  DEMETRIUS: 'ballad',
  PROSPERO: 'onyx',
  MIRANDA: 'shimmer',
  ARIEL: 'fable',
  CALIBAN: 'ash',
  BEATRICE: 'nova',
  BENEDICK: 'fable',
  VIOLA: 'nova',
  OLIVIA: 'shimmer',
  ORSINO: 'echo',
  MALVOLIO: 'fable',
  PORTIA: 'nova',
  SHYLOCK: 'onyx',
  BASSANIO: 'echo',
  ROSALIND: 'nova',
  ORLANDO: 'echo',
  JAQUES: 'sage',
  CLEOPATRA: 'alloy',
  ANTONY: 'onyx',
  JACK: 'echo',
  ALGERNON: 'fable',
  GWENDOLEN: 'nova',
  CECILY: 'shimmer',
  LADY_BRACKNELL: 'alloy',
  NORA: 'shimmer',
  TORVALD: 'onyx',
  KRogSTAD: 'ash',
  HEDDA: 'alloy',
  TESMAN: 'sage',
  BRACK: 'fable',
  OEDIPUS: 'onyx',
  JOCASTA: 'alloy',
  CREON: 'ash',
  TIRESIAS: 'sage',
  ANTIGONE: 'shimmer',
  ISMENE: 'coral',
  MEDEA: 'alloy',
  JASON: 'ash',
  CYRANO: 'onyx',
  ROXANE: 'shimmer',
  CHRISTIAN: 'echo',
  VANYA: 'echo',
  SONYA: 'shimmer',
  ASTROV: 'onyx',
  ELENA: 'alloy',
  TREPLEV: 'echo',
  NINA: 'shimmer',
  ARKADINA: 'alloy',
  TRIGORIN: 'fable',
  RANEVSKAYA: 'alloy',
  LOPAKHIN: 'ash',
  TROFIMOV: 'echo',
  HIGGINS: 'fable',
  ELIZA: 'nova',
  PICKERING: 'sage',
  TARTUFFE: 'ash',
  ORGON: 'onyx',
  DORINE: 'nova',
  ALCESTE: 'onyx',
  CELIMENE: 'nova',
  FAUSTUS: 'onyx',
  MEPHISTOPHILIS: 'ash',
  SALOME: 'shimmer',
  HEROD: 'onyx'
};

// Deterministic hash so every character in any play (or uploaded PDF) gets a
// unique, consistent voice profile across the whole script.
export function assignVoicesToCharacters(characters = [], customOverrides = {}) {
  const map = {};
  const usedRecently = new Set();

  characters.forEach((charName, index) => {
    const key = String(charName || '').trim();
    if (!key) return;

    if (customOverrides[key]) {
      const found = VOICE_PROFILES.find((v) => v.id === customOverrides[key]);
      if (found) {
        map[key] = found;
        return;
      }
    }

    const upper = key.toUpperCase().replace(/[^A-Z]/g, '_');
    const hintId = CHARACTER_ARCHETYPE_HINTS[upper];
    if (hintId && !usedRecently.has(hintId)) {
      const hinted = VOICE_PROFILES.find((v) => v.id === hintId);
      if (hinted) {
        map[key] = hinted;
        usedRecently.add(hintId);
        if (usedRecently.size >= VOICE_PROFILES.length - 1) usedRecently.clear();
        return;
      }
    }

    // Cycle deterministically through VOICE_PROFILES so co-stars in a scene never share the same voice
    let hash = index * 7;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    let idx = hash % VOICE_PROFILES.length;
    for (let attempt = 0; attempt < VOICE_PROFILES.length; attempt++) {
      const candidate = VOICE_PROFILES[(idx + attempt) % VOICE_PROFILES.length];
      if (!usedRecently.has(candidate.id)) {
        map[key] = candidate;
        usedRecently.add(candidate.id);
        if (usedRecently.size >= VOICE_PROFILES.length - 1) usedRecently.clear();
        return;
      }
    }
    map[key] = VOICE_PROFILES[idx];
  });

  return map;
}

export function getVoiceProfile(voiceId) {
  return VOICE_PROFILES.find((v) => v.id === voiceId) || VOICE_PROFILES[0];
}

// ---------- OpenAI API Key Management ----------

let openAiConfig = { apiKey: '', model: 'gpt-4o-mini-tts', sttModel: 'gpt-4o-mini-transcribe' };
let lastOpenAiStatus = { active: false, lastModelUsed: '', lastError: '', testedAt: 0 };
let onVoiceStatusCallback = null;

export function onVoiceStatusChange(fn) {
  onVoiceStatusCallback = fn;
}

function setVoiceRuntimeStatus(patch) {
  lastOpenAiStatus = { ...lastOpenAiStatus, ...patch };
  onVoiceStatusCallback?.(lastOpenAiStatus);
}

export function loadVoiceConfig() {
  try {
    const raw = JSON.parse(localStorage.getItem(OPENAI_KEY_STORAGE));
    if (raw && typeof raw === 'object') {
      if (typeof raw.apiKey === 'string') openAiConfig.apiKey = raw.apiKey.trim();
      if (typeof raw.model === 'string') openAiConfig.model = raw.model;
    }
  } catch (e) {}
  return openAiConfig;
}

export async function saveVoiceApiKey(rawKey) {
  openAiConfig.apiKey = (rawKey || '').trim();
  try {
    localStorage.setItem(OPENAI_KEY_STORAGE, JSON.stringify(openAiConfig));
  } catch (e) {}
  if (openAiConfig.apiKey) {
    return testOpenAiVoiceConnection();
  }
  return false;
}

export function clearVoiceApiKey() {
  openAiConfig.apiKey = '';
  setVoiceRuntimeStatus({ active: false, lastModelUsed: '', lastError: '' });
  try {
    localStorage.removeItem(OPENAI_KEY_STORAGE);
  } catch (e) {}
}

export function hasOpenAiKey() {
  return Boolean(openAiConfig.apiKey && openAiConfig.apiKey.length > 12);
}

export async function testOpenAiVoiceConnection() {
  if (!hasOpenAiKey()) {
    setVoiceRuntimeStatus({ active: false, lastError: 'No OpenAI API key saved yet.' });
    return false;
  }
  setVoiceRuntimeStatus({ lastError: 'Testing OpenAI Neural Voice connection…' });
  try {
    await speakCharacterLine('Stage voice check: OpenAI neural voice is connected and ready.', VOICE_PROFILES[0], {
      speed: 1.0,
      forceOpenAIOnly: true
    });
    return true;
  } catch (err) {
    setVoiceRuntimeStatus({
      active: false,
      lastError: err?.message || 'OpenAI request failed'
    });
    return false;
  }
}

export function voiceEngineStatus() {
  const hasKey = hasOpenAiKey();
  const hasWebSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const hasWebStt = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  return {
    hasOpenAiKey: hasKey,
    maskedKey: hasKey ? `${openAiConfig.apiKey.slice(0, 7)}…${openAiConfig.apiKey.slice(-4)}` : '',
    lastError: lastOpenAiStatus.lastError,
    lastModelUsed: lastOpenAiStatus.lastModelUsed,
    active: lastOpenAiStatus.active,
    ttsEngine: hasKey
      ? (lastOpenAiStatus.lastError && !lastOpenAiStatus.active
          ? `⚠️ OpenAI Error (${lastOpenAiStatus.lastError}) — Falling back to Device Voice`
          : `✨ OpenAI Neural Theatre Voices (${lastOpenAiStatus.lastModelUsed || 'gpt-4o-mini-tts / tts-1-hd'})`)
      : (hasWebSpeech ? '⚠️ Device Offline Voices (No OpenAI key on this site yet — open Settings to paste your sk-… key)' : 'Text-only'),
    sttEngine: hasKey && hasWebStt
      ? 'Live Karaoke Speech Recognition + OpenAI Whisper Assist'
      : hasKey
        ? 'OpenAI Whisper Audio Transcription'
        : hasWebStt
          ? 'Live Browser Speech Recognition'
          : 'Microphone unavailable on this browser'
  };
}

// ---------- Web Audio Cues & Chimes ----------

let audioCtx = null;
let soundEnabled = true;

export function setSoundEnabled(on) {
  soundEnabled = Boolean(on);
}

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq, delay = 0, { type = 'sine', length = 0.35, level = 0.14 } = {}) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime + delay;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(level, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + length);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + length + 0.04);
  } catch (e) {}
}

// Gentle cue chime when it becomes the actor's turn to speak
export function playYourCueChime() {
  playTone(440, 0, { length: 0.22, level: 0.1 });
  playTone(554.37, 0.09, { length: 0.32, level: 0.12 });
}

// Subtle confirmation when the actor completes a line
export function playLineCompleteChime() {
  playTone(523.25, 0, { length: 0.2, level: 0.09 });
  playTone(659.25, 0.07, { length: 0.28, level: 0.1 });
}

// Warm chord at curtain call (end of scene)
export function playCurtainChord() {
  [261.63, 329.63, 392.0, 523.25].forEach((f, i) =>
    playTone(f, i * 0.09, { type: 'triangle', length: 0.55, level: 0.13 })
  );
}

// ---------- TTS Voice Production ----------

const ttsAudioCache = new Map(); // key: `${voiceId}:${speed}:${text}` -> objectUrl
const ttsInFlight = new Map(); // key -> Promise<string> (deduplicates background prefetch + live play)
let activeAudioEl = null;
let activeAbortController = null;
let activeWordTimer = null;

export function stopAllSpeaking() {
  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }
  if (activeWordTimer) {
    clearInterval(activeWordTimer);
    activeWordTimer = null;
  }
  if (activeAudioEl) {
    try {
      activeAudioEl.pause();
      activeAudioEl.currentTime = 0;
    } catch (e) {}
    activeAudioEl = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

// Clean text for TTS so stage directions in brackets aren't spoken unless intended
function cleanTextForSpeech(text) {
  return String(text || '')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Speak a line in the character's assigned voice, invoking `onWord(wordIndex)`
// progressively for karaoke highlighting and `onEnd()` when finished.
export async function speakCharacterLine(text, voiceProfile = VOICE_PROFILES[0], {
  speed = 1.0,
  onWord = null,
  onEnd = null,
  onLoading = null,
  preferCloud = true,
  forceOpenAIOnly = false
} = {}) {
  stopAllSpeaking();

  const spokenText = cleanTextForSpeech(text);
  if (!spokenText) {
    onEnd?.();
    return;
  }

  const words = spokenText.split(/\s+/).filter(Boolean);

  // Try OpenAI Neural TTS first if key is configured and online
  if (preferCloud && hasOpenAiKey() && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
    try {
      await speakViaOpenAI(spokenText, words, voiceProfile, speed, onWord, onEnd, onLoading);
      return;
    } catch (err) {
      onLoading?.(false);
      if (err?.name === 'AbortError') return;
      setVoiceRuntimeStatus({
        active: false,
        lastError: err?.message || 'OpenAI TTS error'
      });
      if (forceOpenAIOnly) throw err;
      // Fall through seamlessly to browser speechSynthesis on network/API error
    }
  }

  speakViaBrowser(spokenText, words, voiceProfile, speed, onWord, onEnd);
}

// Pre-warm upcoming partner lines in the background while the current cue is running
// so scene partner responses play with near-zero latency.
export function prefetchCharacterLine(text, voiceProfile = VOICE_PROFILES[0], speed = 1.0) {
  if (!hasOpenAiKey() || (typeof navigator !== 'undefined' && navigator.onLine === false)) return;
  const spokenText = cleanTextForSpeech(text);
  if (!spokenText) return;
  ensureOpenAiAudioUrl(spokenText, voiceProfile, speed).catch(() => {});
}

// Legacy `tts-1-hd` and `tts-1` only support these 6 voices; `gpt-4o-mini-tts` supports all 11.
const LEGACY_TTS_VOICE_MAP = {
  ash: 'onyx',
  ballad: 'echo',
  coral: 'nova',
  sage: 'fable',
  verse: 'fable',
  marin: 'shimmer',
  cedar: 'onyx'
};

async function requestOpenAiSpeechBlob(modelName, voiceName, spokenText, instructions, speedNum, signal) {
  const isMiniTts = modelName.includes('gpt-4o');
  const safeVoice = isMiniTts ? voiceName : (LEGACY_TTS_VOICE_MAP[voiceName] || voiceName || 'onyx');
  const payload = {
    model: modelName,
    voice: safeVoice,
    input: spokenText,
    speed: speedNum,
    ...(isMiniTts && instructions ? { instructions } : {})
  };

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    signal,
    headers: {
      'Authorization': `Bearer ${openAiConfig.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    let errDetail = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) errDetail = errJson.error.message;
    } catch (e) {}
    throw new Error(errDetail);
  }
  return res.blob();
}

async function ensureOpenAiAudioUrl(spokenText, voiceProfile, speed) {
  const voiceKey = voiceProfile.OpenAIVoice || 'onyx';
  const cacheKey = `${voiceKey}:${speed.toFixed(2)}:${spokenText}`;
  const cached = ttsAudioCache.get(cacheKey);
  if (cached) {
    setVoiceRuntimeStatus({ active: true, lastError: '' });
    return cached;
  }

  if (ttsInFlight.has(cacheKey)) {
    return ttsInFlight.get(cacheKey);
  }

  const promise = (async () => {
    const targetSpeed = Math.min(1.5, Math.max(0.65, speed * (voiceProfile.rate || 1.0)));
    const modelsToTry = ['gpt-4o-mini-tts', 'tts-1-hd', 'tts-1'];
    let blob = null;
    let lastErr = null;
    let succeededModel = '';

    for (const modelName of modelsToTry) {
      try {
        blob = await requestOpenAiSpeechBlob(
          modelName,
          voiceKey,
          spokenText,
          voiceProfile.instructions || 'Speak with clear, expressive theatrical delivery.',
          targetSpeed
        );
        succeededModel = modelName;
        break;
      } catch (e) {
        lastErr = e;
        // If 401 Invalid API key or 429 Insufficient Quota, no need to retry other models
        if (/incorrect api key|invalid_api_key|quota|billing/i.test(e?.message || '')) {
          break;
        }
      }
    }

    if (!blob) {
      throw lastErr || new Error('OpenAI TTS failed');
    }

    setVoiceRuntimeStatus({
      active: true,
      lastModelUsed: succeededModel,
      lastError: '',
      testedAt: Date.now()
    });

    const audioUrl = URL.createObjectURL(blob);
    ttsAudioCache.set(cacheKey, audioUrl);
    return audioUrl;
  })();

  ttsInFlight.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    ttsInFlight.delete(cacheKey);
  }
}

async function speakViaOpenAI(spokenText, words, voiceProfile, speed, onWord, onEnd, onLoading) {
  const voiceKey = voiceProfile.OpenAIVoice || 'onyx';
  const cacheKey = `${voiceKey}:${speed.toFixed(2)}:${spokenText}`;
  const controller = new AbortController();
  activeAbortController = controller;

  let loadingTimer = null;
  if (!ttsAudioCache.has(cacheKey) && onLoading) {
    loadingTimer = setTimeout(() => {
      if (!controller.signal.aborted) onLoading(true);
    }, 220);
  }

  let audioUrl;
  try {
    audioUrl = await ensureOpenAiAudioUrl(spokenText, voiceProfile, speed);
  } finally {
    if (loadingTimer) clearTimeout(loadingTimer);
    onLoading?.(false);
  }

  if (controller.signal.aborted) return;

  const audio = new Audio(audioUrl);
  activeAudioEl = audio;

  // Estimate word progression aligned with audio playback duration
  audio.addEventListener('play', () => {
    let idx = 0;
    onWord?.(0);
    activeWordTimer = setInterval(() => {
      if (!activeAudioEl || activeAudioEl.paused) return;
      const dur = activeAudioEl.duration;
      if (Number.isFinite(dur) && dur > 0) {
        const ratio = Math.min(0.99, activeAudioEl.currentTime / (dur * 0.94));
        const nextIdx = Math.min(words.length - 1, Math.floor(ratio * words.length));
        if (nextIdx !== idx) {
          idx = nextIdx;
          onWord?.(idx);
        }
      } else {
        idx = Math.min(words.length - 1, idx + 1);
        onWord?.(idx);
      }
    }, 120);
  });

  audio.addEventListener('ended', () => {
    if (activeWordTimer) {
      clearInterval(activeWordTimer);
      activeWordTimer = null;
    }
    onWord?.(words.length - 1);
    activeAudioEl = null;
    onEnd?.();
  });

  audio.addEventListener('error', () => {
    if (activeWordTimer) {
      clearInterval(activeWordTimer);
      activeWordTimer = null;
    }
    activeAudioEl = null;
    speakViaBrowser(spokenText, words, voiceProfile, speed, onWord, onEnd);
  });

  await audio.play();
}

function pickDistinctBrowserVoice(voiceProfile) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  const english = voices.filter((v) => /^en(-|_|$)/i.test(v.lang));
  const pool = english.length ? english : voices;
  if (!pool.length) return null;

  // Prefer enhanced/natural voices when available on macOS/iOS/Android
  const premium = pool.filter((v) => /natural|enhanced|premium|siri|google|daniel|samantha|karen|moira|arthur|oliver|martha/i.test(v.name));
  const list = premium.length ? premium : pool;

  const idx = VOICE_PROFILES.findIndex((v) => v.id === voiceProfile.id);
  return list[Math.max(0, idx) % list.length];
}

function speakViaBrowser(spokenText, words, voiceProfile, speed, onWord, onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    // Fallback timer if browser has no TTS at all
    let idx = 0;
    onWord?.(0);
    const msPerWord = Math.max(180, Math.round(320 / speed));
    activeWordTimer = setInterval(() => {
      idx += 1;
      if (idx >= words.length) {
        clearInterval(activeWordTimer);
        activeWordTimer = null;
        onEnd?.();
      } else {
        onWord?.(idx);
      }
    }, msPerWord);
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(spokenText);
    const chosen = pickDistinctBrowserVoice(voiceProfile);
    if (chosen) utter.voice = chosen;
    utter.pitch = voiceProfile.pitch || 1.0;
    utter.rate = Math.min(1.6, Math.max(0.65, (voiceProfile.rate || 0.96) * speed));

    let wordCursor = 0;
    onWord?.(0);

    // Boundary events fire per word on most desktop/tablet browsers; also run a gentle backup timer
    let boundaryFired = false;
    utter.onboundary = (event) => {
      if (event.name === 'word' || typeof event.charIndex === 'number') {
        boundaryFired = true;
        const prefix = spokenText.slice(0, event.charIndex);
        const wIdx = Math.max(0, prefix.trim() ? prefix.trim().split(/\s+/).length - 1 : 0);
        wordCursor = Math.min(words.length - 1, wIdx);
        onWord?.(wordCursor);
      }
    };

    const estWordMs = Math.max(210, Math.round(340 / utter.rate));
    activeWordTimer = setInterval(() => {
      if (!boundaryFired && wordCursor < words.length - 1) {
        wordCursor += 1;
        onWord?.(wordCursor);
      }
    }, estWordMs);

    utter.onend = () => {
      if (activeWordTimer) {
        clearInterval(activeWordTimer);
        activeWordTimer = null;
      }
      onWord?.(words.length - 1);
      onEnd?.();
    };

    utter.onerror = () => {
      if (activeWordTimer) {
        clearInterval(activeWordTimer);
        activeWordTimer = null;
      }
      onEnd?.();
    };

    window.speechSynthesis.speak(utter);
  } catch (e) {
    onEnd?.();
  }
}

// ---------- Live Speech Recognition (Karaoke Transcription Engine) ----------

let activeRecognition = null;
let recognitionShouldRun = false;
let recognitionRestartTimer = null;
let accumulatedFinalTranscript = '';
let mediaRecorder = null;
let recordedChunks = [];
let whisperInterval = null;

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition || hasOpenAiKey());
}

export function stopListening() {
  recognitionShouldRun = false;
  if (recognitionRestartTimer) {
    clearTimeout(recognitionRestartTimer);
    recognitionRestartTimer = null;
  }
  if (activeRecognition) {
    try {
      activeRecognition.onend = null;
      activeRecognition.stop();
    } catch (e) {}
    activeRecognition = null;
  }
  if (whisperInterval) {
    clearInterval(whisperInterval);
    whisperInterval = null;
  }
  if (mediaRecorder) {
    try {
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      mediaRecorder.stream?.getTracks()?.forEach((t) => t.stop());
    } catch (e) {}
    mediaRecorder = null;
  }
  recordedChunks = [];
}

// Merge new final segment without duplicating cumulative phrases emitted on Android Chrome
function appendFinalSegmentSafely(existing, nextSegment) {
  const prev = String(existing || '').trim();
  const next = String(nextSegment || '').trim();
  if (!next) return prev;
  if (!prev) return next;
  const prevLower = prev.toLowerCase();
  const nextLower = next.toLowerCase();
  if (nextLower === prevLower) return prev;
  if (nextLower.startsWith(prevLower)) return next;
  if (prevLower.endsWith(nextLower)) return prev;
  return `${prev} ${next}`.trim();
}

// Starts listening to the actor's microphone and streams interim & final transcripts
// to `onTranscript(fullTranscript, isFinal)` in real time.
export function startListening({
  expectedScriptPrompt = '',
  onTranscript = null,
  onStatusChange = null,
  onError = null
} = {}) {
  stopListening();
  accumulatedFinalTranscript = '';
  recognitionShouldRun = true;

  const SpeechRec = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

  if (SpeechRec) {
    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.maxAlternatives = 4;

      rec.onstart = () => {
        onStatusChange?.('listening');
      };

      rec.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const alts = [];
          for (let k = 0; k < res.length; k++) {
            if (res[k]?.transcript) alts.push(res[k].transcript);
          }
          const chosen = pickBestAlternativeForScript(alts, expectedScriptPrompt);
          if (res.isFinal) {
            accumulatedFinalTranscript = appendFinalSegmentSafely(accumulatedFinalTranscript, chosen);
          } else {
            interim = `${interim} ${chosen}`.trim();
          }
        }
        const combined = `${accumulatedFinalTranscript} ${interim}`.trim();
        if (combined) {
          onTranscript?.(combined, Boolean(!interim && accumulatedFinalTranscript));
        }
      };

      rec.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          recognitionShouldRun = false;
          onStatusChange?.('blocked');
          onError?.('Microphone permission was blocked. Tap the mic icon or use “✓ Delivered Cue”.');
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          onStatusChange?.('warning');
        }
      };

      rec.onend = () => {
        if (recognitionShouldRun) {
          clearTimeout(recognitionRestartTimer);
          recognitionRestartTimer = setTimeout(() => {
            if (!recognitionShouldRun || activeRecognition !== rec) return;
            try {
              rec.start();
            } catch (e) {}
          }, 140);
        } else {
          onStatusChange?.('idle');
        }
      };

      activeRecognition = rec;
      rec.start();
      return true;
    } catch (e) {
      // Fall through to OpenAI Whisper MediaRecorder if available
    }
  }

  // Fallback: if browser lacks Web SpeechRecognition (e.g. Firefox) and user has OpenAI key,
  // record short audio chunks via MediaRecorder and transcribe with OpenAI Whisper.
  if (hasOpenAiKey() && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
    startWhisperStream({ expectedScriptPrompt, onTranscript, onStatusChange, onError });
    return true;
  }

  onStatusChange?.('unsupported');
  onError?.('Live speech recognition works best in Chrome, Edge, or Safari, or with an OpenAI API key.');
  return false;
}

function whisperFilenameForMime(mime = '') {
  const m = String(mime).toLowerCase();
  if (m.includes('mp4') || m.includes('m4a') || m.includes('aac')) return 'rehearsal.mp4';
  if (m.includes('ogg')) return 'rehearsal.ogg';
  if (m.includes('wav')) return 'rehearsal.wav';
  return 'rehearsal.webm';
}

async function startWhisperStream({ expectedScriptPrompt, onTranscript, onStatusChange, onError }) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (!recognitionShouldRun) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];
    onStatusChange?.('listening');

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.start(1000);
    let whisperBusy = false;

    whisperInterval = setInterval(async () => {
      if (!recognitionShouldRun || whisperBusy || !recordedChunks.length) return;
      const mimeType = mediaRecorder?.mimeType || 'audio/webm';
      const blob = new Blob(recordedChunks, { type: mimeType });
      if (blob.size < 1800) return;
      whisperBusy = true;
      try {
        const form = new FormData();
        form.append('file', blob, whisperFilenameForMime(mimeType));
        form.append('model', 'whisper-1');
        form.append('language', 'en');
        if (expectedScriptPrompt) {
          form.append('prompt', expectedScriptPrompt.slice(0, 220));
        }
        const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openAiConfig.apiKey}` },
          body: form
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.text) {
            onTranscript?.(data.text.trim(), false);
          }
        }
      } catch (e) {} finally {
        whisperBusy = false;
      }
    }, 2400);
  } catch (e) {
    onStatusChange?.('blocked');
    onError?.('Could not access microphone.');
  }
}
