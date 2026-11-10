// Entry point for Scene Partner: wires up click/keyboard/file listeners,
// loads persisted state and voice config, and boots the PWA.

import { state, loadState, saveState } from './state.js';
import { loadVoiceConfig } from './voice.js';
import {
  renderApp,
  uiActions,
  setCharacterVoice,
  setSearchQuery,
  handleUploadedScriptFile,
  handleBackupFilePicked
} from './ui.js';
import { initPwa } from './pwa.js';
import { initCloud } from './cloud.js';

document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  uiActions[action]?.(el.dataset.value);
});

document.addEventListener('change', (event) => {
  const target = event.target;
  if (target?.dataset?.charVoice) {
    setCharacterVoice(target.dataset.charVoice, target.value);
  }
});

document.addEventListener('input', (event) => {
  const target = event.target;
  if (target?.id === 'library-search') {
    setSearchQuery(target.value);
  }
});

// Keyboard shortcuts for rehearsal on tablet/desktop:
// Space = Play/Pause scene, L = "Line!" prompt, Enter / Right = Delivered Cue / Next,
// Left = Prev Cue, F = Full Teleprompter view, R = Loop current cue
document.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const tag = event.target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  if (state.screen === 'rehearsal') {
    if (event.key === ' ') {
      event.preventDefault();
      uiActions['toggle-play']();
    } else if (event.key === 'l' || event.key === 'L') {
      event.preventDefault();
      uiActions['prompt-line']();
    } else if (event.key === 'f' || event.key === 'F') {
      event.preventDefault();
      uiActions['toggle-setting']('focusLayout');
    } else if (event.key === 'r' || event.key === 'R') {
      event.preventDefault();
      uiActions['toggle-setting']('loopLine');
    } else if (event.key === 'ArrowRight' || event.key === 'Enter') {
      event.preventDefault();
      uiActions['finish-user-line']();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      uiActions['step-line'](-1);
    }
  }
});

// Drag-and-drop PDF / TXT script support on the Library upload card
document.addEventListener('dragover', (event) => {
  const dropZone = event.target?.closest?.('#upload-drop-zone');
  if (!dropZone) return;
  event.preventDefault();
  dropZone.classList.add('drag-over');
});

document.addEventListener('dragleave', (event) => {
  const dropZone = event.target?.closest?.('#upload-drop-zone');
  if (!dropZone) return;
  if (!dropZone.contains(event.relatedTarget)) {
    dropZone.classList.remove('drag-over');
  }
});

document.addEventListener('drop', (event) => {
  const dropZone = event.target?.closest?.('#upload-drop-zone');
  if (!dropZone) return;
  event.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = event.dataTransfer?.files?.[0];
  if (file) handleUploadedScriptFile(file);
});

// Hidden file inputs for PDF/Script upload and Backup JSON restore
document.getElementById('pdf-file-input')?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) handleUploadedScriptFile(file);
});

document.getElementById('backup-file-input')?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) handleBackupFilePicked(file);
});

// Ensure browser voices are warmed up on platforms that load them asynchronously
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// Boot sequence
loadVoiceConfig();
loadState();
renderApp();
initPwa();
saveState({ touch: false });
initCloud(() => {
  loadVoiceConfig();
  renderApp();
  saveState({ touch: false });
});
navigator.storage?.persist?.().catch(() => {});
