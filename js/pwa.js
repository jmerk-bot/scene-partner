// Fullscreen, offline support, and picking up new versions on the tablet.

import { APP_VERSION } from './version.js';
import { saveState } from './state.js';

const isDev = APP_VERSION.startsWith('__');
const CHECK_EVERY_MS = 60 * 1000;
let lastCheck = 0;

async function fetchLatestVersion() {
  try {
    const res = await fetch('version.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.version === 'string' ? data.version : null;
  } catch (e) {
    return null;
  }
}

async function reloadIfOutdated() {
  if (isDev) return;
  lastCheck = Date.now();
  const latest = await fetchLatestVersion();
  if (!latest || latest === APP_VERSION) return;

  try {
    if (sessionStorage.getItem('scene-partner:reloaded-for') === latest) return;
    sessionStorage.setItem('scene-partner:reloaded-for', latest);
  } catch (e) {
    return;
  }
  saveState({ touch: false });
  location.reload();
}

function goFullscreenOnTap() {
  if (!matchMedia('(display-mode: standalone)').matches) return;
  if (!document.documentElement.requestFullscreen) return;
  document.addEventListener('click', () => {
    if (document.fullscreenElement) return;
    document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  });
}

export function initPwa() {
  const el = document.getElementById('app-version');
  if (el) el.textContent = isDev ? 'dev' : `v${APP_VERSION}`;
  goFullscreenOnTap();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  reloadIfOutdated();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - lastCheck > CHECK_EVERY_MS) {
      reloadIfOutdated();
    }
  });
}
