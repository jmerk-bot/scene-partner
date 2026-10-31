// Cloud backup and restore via a private GitHub Gist (`scene-partner-state.json`).
//
// Follows the exact pattern from Addy's Math Lab (`js/cloud.js`), using a
// completely separate Gist filename (`scene-partner-state.json`) and storage key
// (`scene-partner:cloud:v1`) so both apps can use the same GitHub Personal Access Token
// without ever overwriting each other's state.

import { state, serializeState, applySavedState, saveState } from './state.js';

const CLOUD_KEY = 'scene-partner:cloud:v1';
const GIST_FILENAME = 'scene-partner-state.json';
const GIST_DESC = 'Scene Partner — Off-Book Rehearsal Cloud Backup';
const SYNC_EVERY_MS = 60 * 1000;

let config = { token: '', gistId: null, lastSyncAt: 0 };
let status = { state: 'idle', message: '' };
let syncing = false;
let onRestoreCallback = null;
let onStatusCallback = null;

function loadConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(CLOUD_KEY));
    if (saved && typeof saved === 'object') {
      if (typeof saved.token === 'string') config.token = saved.token.trim();
      if (typeof saved.gistId === 'string' && /^[a-f0-9]+$/i.test(saved.gistId)) config.gistId = saved.gistId;
      if (Number.isInteger(saved.lastSyncAt) && saved.lastSyncAt >= 0) config.lastSyncAt = saved.lastSyncAt;
    }
  } catch (e) {}
}

function saveConfig() {
  try {
    localStorage.setItem(CLOUD_KEY, JSON.stringify(config));
  } catch (e) {}
}

function setStatus(stateName, message = '') {
  status = { state: stateName, message };
  onStatusCallback?.();
}

export function cloudStatus() {
  return {
    connected: Boolean(config.token),
    gistId: config.gistId,
    lastSyncAt: config.lastSyncAt,
    ...status
  };
}

export function onCloudStatus(fn) {
  onStatusCallback = fn;
}

function progressOf(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { totalLines: 0, scenes: 0, customPlays: 0, updatedAt: 0 };
  }
  const s = data.app === 'scene-partner' && data.type === 'backup' && data.state
    ? data.state
    : data;
  const totalLines = Number.isInteger(s.rehearsal?.totalLinesPracticed) ? s.rehearsal.totalLinesPracticed : 0;
  const scenes = Number.isInteger(s.rehearsal?.completedScenes) ? s.rehearsal.completedScenes : 0;
  const customPlays = Array.isArray(s.customPlays) ? s.customPlays.length : 0;
  const updatedAt = Number.isInteger(s.updatedAt) ? s.updatedAt : 0;
  return { totalLines, scenes, customPlays, updatedAt };
}

export function isCloudAhead(local, cloud) {
  if (!cloud || typeof cloud !== 'object' || Array.isArray(cloud)) return false;
  const l = progressOf(local);
  const c = progressOf(cloud);
  for (const key of ['totalLines', 'scenes', 'customPlays', 'updatedAt']) {
    if (c[key] !== l[key]) return c[key] > l[key];
  }
  return false;
}

function headers(token) {
  return {
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

async function findExistingGist(token) {
  const res = await fetch('https://api.github.com/gists?per_page=100', {
    headers: headers(token),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(res.status === 401 || res.status === 403 ? 'Token needs gist permission' : `GitHub HTTP ${res.status}`);
  const list = await res.json();
  if (!Array.isArray(list)) return null;
  const match = list.find((g) => g && g.files && g.files[GIST_FILENAME]);
  return match ? match.id : null;
}

async function fetchGistState(token, gistId) {
  const res = await fetch(`https://api.github.com/gists/${encodeURIComponent(gistId)}`, {
    headers: headers(token),
    cache: 'no-store'
  });
  if (res.status === 404) {
    config.gistId = null;
    saveConfig();
    return null;
  }
  if (!res.ok) throw new Error(res.status === 401 || res.status === 403 ? 'Token needs gist permission' : `GitHub HTTP ${res.status}`);
  const gist = await res.json();
  const content = gist?.files?.[GIST_FILENAME]?.content;
  if (typeof content !== 'string' || !content.trim()) return null;
  return JSON.parse(content);
}

async function pushGistState(token, gistId, payload, { keepalive = false } = {}) {
  const body = JSON.stringify({
    description: GIST_DESC,
    ...(gistId ? {} : { public: false }),
    files: {
      [GIST_FILENAME]: { content: JSON.stringify(payload, null, 2) }
    }
  });
  const url = gistId
    ? `https://api.github.com/gists/${encodeURIComponent(gistId)}`
    : 'https://api.github.com/gists';
  const res = await fetch(url, {
    method: gistId ? 'PATCH' : 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body,
    keepalive
  });
  if (res.status === 404 && gistId) {
    config.gistId = null;
    saveConfig();
    return pushGistState(token, null, payload, { keepalive });
  }
  if (!res.ok) throw new Error(res.status === 401 || res.status === 403 ? 'Token needs gist permission' : `GitHub HTTP ${res.status}`);
  const data = await res.json();
  if (typeof data?.id === 'string') config.gistId = data.id;
}

export async function syncWithCloud({ restoreIfAhead = false, keepalive = false } = {}) {
  if (syncing || !config.token) return false;
  syncing = true;
  setStatus('syncing', 'Syncing with GitHub Gist…');

  try {
    if (!config.gistId) {
      config.gistId = await findExistingGist(config.token);
      saveConfig();
    }

    if (restoreIfAhead && config.gistId) {
      const cloudData = await fetchGistState(config.token, config.gistId);
      const localData = serializeState();
      if (cloudData && isCloudAhead(localData, cloudData)) {
        if (applySavedState(cloudData)) {
          saveState({ touch: false });
          config.lastSyncAt = Date.now();
          saveConfig();
          onRestoreCallback?.();
          setStatus('ok', 'Restored latest scripts & rehearsal state from cloud');
          return true;
        }
      }
    }

    await pushGistState(config.token, config.gistId, serializeState(), { keepalive });
    config.lastSyncAt = Date.now();
    saveConfig();
    setStatus('ok', 'Saved to cloud');
    return true;
  } catch (e) {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    setStatus('error', offline ? 'Offline — will sync when online' : (e?.message || 'Cloud sync failed'));
    return false;
  } finally {
    syncing = false;
  }
}

export async function setCloudToken(rawToken) {
  const token = (rawToken || '').trim();
  if (!token) return false;
  if (token !== config.token) {
    config.token = token;
    config.gistId = null;
    config.lastSyncAt = 0;
    saveConfig();
  }
  return syncWithCloud({ restoreIfAhead: true });
}

export function clearCloudToken() {
  config = { token: '', gistId: null, lastSyncAt: 0 };
  saveConfig();
  setStatus('idle', '');
}

export function initCloud(onRestore) {
  onRestoreCallback = onRestore;
  loadConfig();
  if (config.token) {
    syncWithCloud({ restoreIfAhead: true });
  }

  setInterval(() => {
    if (document.visibilityState === 'visible' && config.token) {
      syncWithCloud();
    }
  }, SYNC_EVERY_MS);

  document.addEventListener('visibilitychange', () => {
    if (!config.token) return;
    if (document.visibilityState === 'hidden') {
      if (state.updatedAt > config.lastSyncAt) {
        syncWithCloud({ keepalive: true });
      }
    } else if (Date.now() - config.lastSyncAt >= SYNC_EVERY_MS) {
      syncWithCloud({ restoreIfAhead: true });
    }
  });

  window.addEventListener('online', () => {
    if (config.token && document.visibilityState === 'visible') {
      syncWithCloud({ restoreIfAhead: config.lastSyncAt === 0 });
    }
  });
}
