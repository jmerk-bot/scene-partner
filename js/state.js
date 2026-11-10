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
  focusLayout: false, // full-height teleprompter mode (hides bottom scrolling script stream)
  loopLine: false, // loop current speech repeatedly for monologue memorization drills
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

// Legacy v1 XOR salt retained strictly for one-way migration of existing `sp1:` Gist vaults
// to `sp2:` Web Crypto AES-GCM-256 encrypted vaults. Never written by new snapshots.
const LEGACY_MASK_SALT = 'ScenePartnerFolio1623';

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function isSafeObjectKey(key) {
  return typeof key === 'string' && key.length > 0 && key.length <= 80 && !FORBIDDEN_KEYS.has(key);
}

export function isValidOpenAiKeyFormat(key) {
  return typeof key === 'string' && /^sk-[A-Za-z0-9_-]{12,240}$/.test(key.trim());
}

function bytesToHex(bytes) {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function hexToBytes(hex) {
  if (typeof hex !== 'string' || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) {
    return null;
  }
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    out[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return out;
}

async function deriveAesGcmKey(passphrase, saltBytes, usages) {
  const enc = new TextEncoder();
  const baseKey = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(`scene-partner-vault:v2:${passphrase}`),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return globalThis.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    usages
  );
}

// Encrypts the OpenAI key using AES-GCM-256 keyed with PBKDF2-SHA256 from the user's
// GitHub Personal Access Token (which never leaves the user's own devices).
// Resulting `sp2:<saltHex>:<ivHex>:<cipherHex>` contains no `sk-` prefix (safe from
// GitHub secret scanners) AND is cryptographically indecipherable even if the Gist URL leaks.
export async function encryptSecretForCloud(plainKey, passphrase) {
  if (!isValidOpenAiKeyFormat(plainKey) || !passphrase || !globalThis.crypto?.subtle) {
    return '';
  }
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const aesKey = await deriveAesGcmKey(passphrase, salt, ['encrypt']);
  const encoded = new TextEncoder().encode(plainKey.trim());
  const cipherBuf = await globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, encoded);
  return `sp2:${bytesToHex(salt)}:${bytesToHex(iv)}:${bytesToHex(new Uint8Array(cipherBuf))}`;
}

export async function decryptSecretFromCloud(encodedVault, passphrase) {
  if (!encodedVault || typeof encodedVault !== 'string') return '';

  if (encodedVault.startsWith('sp2:')) {
    if (!passphrase || !globalThis.crypto?.subtle) return '';
    const parts = encodedVault.split(':');
    if (parts.length !== 4) return '';
    const salt = hexToBytes(parts[1]);
    const iv = hexToBytes(parts[2]);
    const cipher = hexToBytes(parts[3]);
    if (!salt || salt.length !== 16 || !iv || iv.length !== 12 || !cipher || cipher.length < 17) {
      return '';
    }
    try {
      const aesKey = await deriveAesGcmKey(passphrase, salt, ['decrypt']);
      const plainBuf = await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, cipher);
      const text = new TextDecoder().decode(plainBuf).trim();
      return isValidOpenAiKeyFormat(text) ? text : '';
    } catch (e) {
      return '';
    }
  }

  // Read-only legacy migration path for `sp1:` vaults created before v2 AES-GCM upgrade
  if (encodedVault.startsWith('sp1:')) {
    const legacy = deobfuscateLegacyKey(encodedVault);
    return isValidOpenAiKeyFormat(legacy) ? legacy : '';
  }

  return '';
}

function deobfuscateLegacyKey(encoded) {
  if (!encoded || !encoded.startsWith('sp1:')) return '';
  const bytes = hexToBytes(encoded.slice(4));
  if (!bytes) return '';
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const charCode = bytes[i] ^ LEGACY_MASK_SALT.charCodeAt(i % LEGACY_MASK_SALT.length);
    out += String.fromCharCode(charCode);
  }
  return out;
}

function sanitizeVoiceOverrides(raw) {
  const clean = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return clean;
  for (const [k, v] of Object.entries(raw)) {
    if (!Object.hasOwn(raw, k) || !isSafeObjectKey(k)) continue;
    if (typeof v === 'string' && /^[a-z0-9-]{2,24}$/.test(v)) {
      clean[k] = v;
    }
  }
  return clean;
}

function sanitizeCustomPlay(rawPlay) {
  if (!rawPlay || typeof rawPlay !== 'object' || Array.isArray(rawPlay)) return null;
  if (typeof rawPlay.id !== 'string' || !rawPlay.id.trim() || rawPlay.id.length > 80) return null;
  if (!Array.isArray(rawPlay.scenes) || rawPlay.scenes.length === 0) return null;

  const safeScenes = [];
  for (const sc of rawPlay.scenes.slice(0, 120)) {
    if (!sc || typeof sc !== 'object' || !Array.isArray(sc.lines)) continue;
    const safeLines = [];
    for (const ln of sc.lines.slice(0, 3000)) {
      if (!ln || typeof ln !== 'object') continue;
      const speaker = typeof ln.speaker === 'string' ? ln.speaker.trim().slice(0, 48) : '';
      const text = typeof ln.text === 'string' ? ln.text.trim().slice(0, 8000) : '';
      if (!speaker || !text || !isSafeObjectKey(speaker)) continue;
      const direction = typeof ln.direction === 'string' && ln.direction.trim()
        ? ln.direction.trim().slice(0, 280)
        : undefined;
      safeLines.push(direction ? { speaker, text, direction } : { speaker, text });
    }
    if (safeLines.length > 0) {
      safeScenes.push({
        id: typeof sc.id === 'string' && sc.id.trim() ? sc.id.trim().slice(0, 60) : `scene-${safeScenes.length + 1}`,
        title: typeof sc.title === 'string' && sc.title.trim() ? sc.title.trim().slice(0, 120) : `Scene ${safeScenes.length + 1}`,
        lines: safeLines
      });
    }
  }

  if (safeScenes.length === 0) return null;

  return {
    id: rawPlay.id.trim().slice(0, 80),
    title: typeof rawPlay.title === 'string' && rawPlay.title.trim() ? rawPlay.title.trim().slice(0, 140) : 'Uploaded Script',
    playwright: typeof rawPlay.playwright === 'string' && rawPlay.playwright.trim() ? rawPlay.playwright.trim().slice(0, 100) : 'Custom Sides',
    year: typeof rawPlay.year === 'string' ? rawPlay.year.trim().slice(0, 32) : 'Custom Upload',
    category: 'Uploaded Scripts',
    custom: true,
    scenes: safeScenes
  };
}

function sanitizeHistoryEntry(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
  return {
    at: typeof item.at === 'string' ? item.at.slice(0, 40) : new Date().toISOString(),
    playId: typeof item.playId === 'string' ? item.playId.slice(0, 80) : '',
    playTitle: typeof item.playTitle === 'string' ? item.playTitle.slice(0, 140) : '',
    sceneTitle: typeof item.sceneTitle === 'string' ? item.sceneTitle.slice(0, 140) : '',
    roles: Array.isArray(item.roles)
      ? item.roles.filter((r) => typeof r === 'string' && isSafeObjectKey(r)).slice(0, 12).map((r) => r.slice(0, 48))
      : [],
    tolerance: typeof item.tolerance === 'string' && TOLERANCE_LEVELS[item.tolerance] ? item.tolerance : 'off-book',
    accuracy: typeof item.accuracy === 'number' && Number.isFinite(item.accuracy)
      ? Math.max(0, Math.min(100, Math.round(item.accuracy)))
      : 0,
    linesCount: Number.isInteger(item.linesCount) && item.linesCount >= 0 ? Math.min(10000, item.linesCount) : 0
  };
}

// Local & downloadable snapshot — intentionally NEVER includes API keys or tokens
// so downloaded `.json` backup files are always safe to store or share.
export function savedStateSnapshot() {
  return {
    updatedAt: state.updatedAt,
    screen: state.screen,
    selectedPlayId: state.selectedPlayId,
    selectedSceneId: state.selectedSceneId,
    selectedCharacters: state.selectedCharacters,
    voiceOverrides: sanitizeVoiceOverrides(state.voiceOverrides),
    settings: state.settings,
    customPlays: state.customPlays,
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

// Cloud Gist snapshot — encrypts the OpenAI key with AES-GCM-256 derived from `cloudToken`
export async function serializeStateForCloud(cloudToken) {
  const base = savedStateSnapshot();
  if (!cloudToken) return base;
  try {
    const raw = JSON.parse(localStorage.getItem('scene-partner:openai:v1') || '{}');
    if (raw && isValidOpenAiKeyFormat(raw.apiKey)) {
      const encryptedVault = await encryptSecretForCloud(raw.apiKey.trim(), cloudToken);
      if (encryptedVault) {
        return { ...base, voiceVault: encryptedVault };
      }
    }
  } catch (e) {}
  return base;
}

export async function restoreCloudVoiceVault(cloudData, cloudToken) {
  if (!cloudData || typeof cloudData !== 'object') return false;
  const vault = cloudData.voiceVault;
  if (typeof vault !== 'string' || !vault) return false;
  try {
    const existing = JSON.parse(localStorage.getItem('scene-partner:openai:v1') || '{}');
    if (existing && isValidOpenAiKeyFormat(existing.apiKey)) return false;
    const decryptedKey = await decryptSecretFromCloud(vault, cloudToken);
    if (isValidOpenAiKeyFormat(decryptedKey)) {
      localStorage.setItem('scene-partner:openai:v1', JSON.stringify({
        apiKey: decryptedKey,
        model: 'gpt-4o-mini-tts',
        sttModel: 'gpt-4o-mini-transcribe'
      }));
      return true;
    }
  } catch (e) {}
  return false;
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
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;

  if (Number.isInteger(data.updatedAt) && data.updatedAt >= 0) {
    state.updatedAt = data.updatedAt;
  }
  if (['library', 'setup', 'rehearsal'].includes(data.screen)) {
    state.screen = data.screen;
  }
  if (typeof data.selectedPlayId === 'string' && isSafeObjectKey(data.selectedPlayId)) {
    state.selectedPlayId = data.selectedPlayId;
  }
  if (typeof data.selectedSceneId === 'string' && isSafeObjectKey(data.selectedSceneId)) {
    state.selectedSceneId = data.selectedSceneId;
  }
  if (Array.isArray(data.selectedCharacters) && data.selectedCharacters.length > 0) {
    const validChars = data.selectedCharacters
      .filter((x) => typeof x === 'string' && isSafeObjectKey(x.trim()))
      .slice(0, 20)
      .map((x) => x.trim());
    if (validChars.length > 0) state.selectedCharacters = validChars;
  }
  state.voiceOverrides = sanitizeVoiceOverrides(data.voiceOverrides);

  state.settings = { ...DEFAULT_SETTINGS };
  if (data.settings && typeof data.settings === 'object' && !Array.isArray(data.settings)) {
    const s = data.settings;
    if (Object.hasOwn(THEMES, s.theme)) state.settings.theme = s.theme;
    if (Object.hasOwn(TOLERANCE_LEVELS, s.tolerance)) state.settings.tolerance = s.tolerance;
    if (Object.hasOwn(CUE_VISIBILITY_MODES, s.cueVisibility)) state.settings.cueVisibility = s.cueVisibility;
    for (const boolKey of ['autoAdvance', 'autoListen', 'cueToCue', 'readStageDirections', 'focusLayout', 'loopLine', 'sound']) {
      if (typeof s[boolKey] === 'boolean') state.settings[boolKey] = s[boolKey];
    }
    if (typeof s.voiceSpeed === 'number' && Number.isFinite(s.voiceSpeed) && s.voiceSpeed >= 0.6 && s.voiceSpeed <= 1.6) {
      state.settings.voiceSpeed = s.voiceSpeed;
    }
    if (typeof s.fontScale === 'number' && Number.isFinite(s.fontScale) && s.fontScale >= 0.8 && s.fontScale <= 1.5) {
      state.settings.fontScale = s.fontScale;
    }
  }

  if (Array.isArray(data.customPlays)) {
    state.customPlays = data.customPlays
      .slice(0, 25)
      .map(sanitizeCustomPlay)
      .filter(Boolean);
  }

  if (data.rehearsal && typeof data.rehearsal === 'object' && !Array.isArray(data.rehearsal)) {
    const r = data.rehearsal;
    if (Number.isInteger(r.lineIndex) && r.lineIndex >= 0 && r.lineIndex <= 10000) state.rehearsal.lineIndex = r.lineIndex;
    if (Number.isInteger(r.completedScenes) && r.completedScenes >= 0) state.rehearsal.completedScenes = r.completedScenes;
    if (Number.isInteger(r.totalLinesPracticed) && r.totalLinesPracticed >= 0) state.rehearsal.totalLinesPracticed = r.totalLinesPracticed;
    if (typeof r.bestAccuracy === 'number' && Number.isFinite(r.bestAccuracy)) {
      state.rehearsal.bestAccuracy = Math.max(0, Math.min(100, r.bestAccuracy));
    }
  }

  if (Array.isArray(data.history)) {
    state.history = data.history
      .slice(-100)
      .map(sanitizeHistoryEntry)
      .filter(Boolean);
  }

  return true;
}

export function logRehearsalSession(entry) {
  const clean = sanitizeHistoryEntry({
    at: new Date().toISOString(),
    ...entry
  });
  if (clean) state.history.push(clean);
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
  if (typeof text !== 'string' || text.length > 4 * 1024 * 1024) return null;
  try {
    const copy = JSON.parse(text);
    if (
      copy &&
      typeof copy === 'object' &&
      !Array.isArray(copy) &&
      copy.app === 'scene-partner' &&
      copy.type === 'backup' &&
      copy.state &&
      typeof copy.state === 'object' &&
      !Array.isArray(copy.state)
    ) {
      return copy;
    }
  } catch (e) {}
  return null;
}

export function restoreBackup(copy) {
  if (!copy || !copy.state) return false;
  if (!applySavedState(copy)) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedStateSnapshot()));
  } catch (e) {
    return false;
  }
  frozen = true;
  return true;
}
