// App state, themes, persistence, and backup copies for Scene Partner.
//
// Everything this app stores in localStorage and Cache Storage is strictly
// prefixed `scene-partner` so it never collides with `addy-math-lab` or
// `felix-math-lab` on the shared `https://jmerk-bot.github.io` origin.

import { APP_VERSION } from './version.js';
import { TOLERANCE_LEVELS } from './matcher.js';

export const STORAGE_KEY = 'scene-partner:v1';
export const LOG_KEY = 'scene-partner:log:v1';

// Karaoke visual themes requested by the user:
//   - "Shakespearean" (Faded parchment / First Folio background with archaic serif script)
//   - "Modern" (Clean contemporary stage dark studio)
//   - "High Visibility" (High-contrast black & brilliant yellow/white stage teleprompter)
//   - "Paperback Sides" (Crisp daylight rehearsal script page)
export const THEMES = {
  shakespearean: {
    id: 'shakespearean',
    label: 'Shakespearean Folio',
    shortLabel: 'Shakespearean',
    desc: 'Faded parchment scroll with classical Renaissance serif typography & rubricated cues'
  },
  modern: {
    id: 'modern',
    label: 'Modern Stage',
    shortLabel: 'Modern',
    desc: 'Warm velvet theatre dark mode with crisp spotlight typography'
  },
  'high-visibility': {
    id: 'high-visibility',
    label: 'High Visibility',
    shortLabel: 'High Vis',
    desc: 'Ultra-high-contrast black & gold teleprompter for reading across the room'
  },
  daylight: {
    id: 'daylight',
    label: 'Rehearsal Room Paper',
    shortLabel: 'Script Page',
    desc: 'Clean ivory script page with classic courier-style rehearsal markings'
  }
};

export const THEME_ORDER = ['shakespearean', 'modern', 'high-visibility', 'daylight'];

// How much of the actor's own line is shown on screen before they speak it
export const CUE_VISIBILITY_MODES = {
  'full': {
    id: 'full',
    label: 'Full Karaoke Script',
    desc: 'Show all words of your line and light them up as you speak'
  },
  'first-words': {
    id: 'first-words',
    label: 'First 3 Words Only',
    desc: 'Show only the opening cue words; reveal each word as you speak it'
  },
  'off-book-blind': {
    id: 'off-book-blind',
    label: 'True Off-Book (Hidden)',
    desc: 'Blur your lines until you speak them or tap "Line!" for a prompt'
  }
};

export const DEFAULT_SETTINGS = {
  theme: 'shakespearean',
  tolerance: 'off-book', // 'first-pass' | 'blocking' | 'off-book' | 'dress-rehearsal' | 'final-practice'
  cueVisibility: 'full', // 'full' | 'first-words' | 'off-book-blind'
  autoAdvance: true, // automatically advance to the next character when user completes their line
  autoListen: true, // automatically activate microphone on user's turn
  cueToCue: false, // skip long stretches where user's character has no lines
  readStageDirections: false, // speak [stage directions] aloud
  voiceSpeed: 1.0,
  fontScale: 1.0, // 0.85 to 1.35
  sound: true
};

export const state = {
  updatedAt: 0,
  screen: 'library', // 'library' | 'setup' | 'rehearsal'
  selectedPlayId: 'shake-hamlet',
  selectedSceneId: 'act1-sc2',
  selectedCharacters: ['HAMLET'], // one or more characters the user is playing
  voiceOverrides: {}, // { 'HAMLET': 'echo', 'OPHELIA': 'shimmer' }
  settings: { ...DEFAULT_SETTINGS },
  customPlays: [], // uploaded PDF / text scripts saved on device & cloud
  rehearsal: {
    lineIndex: 0,
    playing: false, // whether the scene run is actively running
    revealedHints: 0, // how many words of the current line have been prompted via "Line!"
    lineStats: {}, // index -> { accuracy, attempts, prompted }
    completedScenes: 0,
    totalLinesPracticed: 0,
    bestAccuracy: 0
  },
  history: [] // rehearsal session log entries
};

let frozen = false;

export function savedStateSnapshot() {
  let openAiKey = '';
  try {
    const raw = JSON.parse(localStorage.getItem('scene-partner:openai:v1'));
    if (raw && typeof raw.apiKey === 'string') openAiKey = raw.apiKey.trim();
  } catch (e) {}

  return {
    updatedAt: state.updatedAt,
    screen: state.screen,
    selectedPlayId: state.selectedPlayId,
    selectedSceneId: state.selectedSceneId,
    selectedCharacters: state.selectedCharacters,
    voiceOverrides: state.voiceOverrides,
    settings: state.settings,
    customPlays: state.customPlays,
    ...(openAiKey ? { openAiKey } : {}),
    rehearsal: {
      lineIndex: state.rehearsal.lineIndex,
      completedScenes: state.rehearsal.completedScenes,
      totalLinesPracticed: state.rehearsal.totalLinesPracticed,
      bestAccuracy: state.rehearsal.bestAccuracy
    },
    history: state.history.slice(-100)
  };
}

export function serializeState() {
  return savedStateSnapshot();
}

export function saveState({ touch = true } = {}) {
  if (frozen) return;
  try {
    if (touch) state.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedStateSnapshot()));
  } catch (e) {}
}

export function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (raw) applySavedState(raw);
  } catch (e) {}
}

export function applySavedState(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const data = raw.app === 'scene-partner' && raw.type === 'backup' && raw.state
    ? raw.state
    : raw;

  if (Number.isInteger(data.updatedAt) && data.updatedAt >= 0) {
    state.updatedAt = data.updatedAt;
  }
  if (['library', 'setup', 'rehearsal'].includes(data.screen)) {
    state.screen = data.screen;
  }
  if (typeof data.selectedPlayId === 'string' && data.selectedPlayId) {
    state.selectedPlayId = data.selectedPlayId;
  }
  if (typeof data.selectedSceneId === 'string' && data.selectedSceneId) {
    state.selectedSceneId = data.selectedSceneId;
  }
  if (Array.isArray(data.selectedCharacters) && data.selectedCharacters.length > 0) {
    state.selectedCharacters = data.selectedCharacters.filter((x) => typeof x === 'string' && x.trim());
  }
  if (data.voiceOverrides && typeof data.voiceOverrides === 'object' && !Array.isArray(data.voiceOverrides)) {
    state.voiceOverrides = { ...data.voiceOverrides };
  }

  state.settings = { ...DEFAULT_SETTINGS };
  if (data.settings && typeof data.settings === 'object') {
    const s = data.settings;
    if (THEMES[s.theme]) state.settings.theme = s.theme;
    if (TOLERANCE_LEVELS[s.tolerance]) state.settings.tolerance = s.tolerance;
    if (CUE_VISIBILITY_MODES[s.cueVisibility]) state.settings.cueVisibility = s.cueVisibility;
    for (const boolKey of ['autoAdvance', 'autoListen', 'cueToCue', 'readStageDirections', 'sound']) {
      if (typeof s[boolKey] === 'boolean') state.settings[boolKey] = s[boolKey];
    }
    if (typeof s.voiceSpeed === 'number' && s.voiceSpeed >= 0.6 && s.voiceSpeed <= 1.6) {
      state.settings.voiceSpeed = s.voiceSpeed;
    }
    if (typeof s.fontScale === 'number' && s.fontScale >= 0.8 && s.fontScale <= 1.5) {
      state.settings.fontScale = s.fontScale;
    }
  }

  if (Array.isArray(data.customPlays)) {
    state.customPlays = data.customPlays.filter((p) => p && typeof p.id === 'string' && Array.isArray(p.scenes));
  }

  // Restore OpenAI API key from private Gist / backup if this device doesn't have one yet
  if (typeof data.openAiKey === 'string' && data.openAiKey.startsWith('sk-')) {
    try {
      const existing = JSON.parse(localStorage.getItem('scene-partner:openai:v1') || '{}');
      if (!existing.apiKey) {
        localStorage.setItem('scene-partner:openai:v1', JSON.stringify({
          apiKey: data.openAiKey.trim(),
          model: 'gpt-4o-mini-tts',
          sttModel: 'gpt-4o-mini-transcribe'
        }));
      }
    } catch (e) {}
  }

  if (data.rehearsal && typeof data.rehearsal === 'object') {
    const r = data.rehearsal;
    if (Number.isInteger(r.lineIndex) && r.lineIndex >= 0) state.rehearsal.lineIndex = r.lineIndex;
    if (Number.isInteger(r.completedScenes) && r.completedScenes >= 0) state.rehearsal.completedScenes = r.completedScenes;
    if (Number.isInteger(r.totalLinesPracticed) && r.totalLinesPracticed >= 0) state.rehearsal.totalLinesPracticed = r.totalLinesPracticed;
    if (typeof r.bestAccuracy === 'number') state.rehearsal.bestAccuracy = r.bestAccuracy;
  }

  if (Array.isArray(data.history)) {
    state.history = data.history.slice(-100);
  }

  return true;
}

export function logRehearsalSession(entry) {
  state.history.push({
    at: new Date().toISOString(),
    ...entry
  });
  if (state.history.length > 100) {
    state.history = state.history.slice(-100);
  }
  saveState();
}

export function backupCopy() {
  return {
    app: 'scene-partner',
    type: 'backup',
    v: 1,
    savedAt: new Date().toISOString(),
    version: APP_VERSION,
    state: savedStateSnapshot()
  };
}

export function readBackup(text) {
  try {
    const copy = JSON.parse(text);
    if (copy && copy.app === 'scene-partner' && copy.type === 'backup' && copy.state) {
      return copy;
    }
  } catch (e) {}
  return null;
}

export function restoreBackup(copy) {
  if (!copy || !copy.state) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(copy.state));
  } catch (e) {
    return false;
  }
  frozen = true;
  return true;
}
