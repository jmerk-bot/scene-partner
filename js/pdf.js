// Script & PDF parser for Scene Partner.
//
// Accepts uploaded PDF files (extracting text page-by-page using PDF.js on demand,
// or pure JS FlateDecode/text-stream extraction when offline), as well as `.txt`,
// `.fountain`, or pasted script text, and converts them into a structured Play object:
//   {
//     id, title, playwright, year, genre, custom: true,
//     characters: ['HAMLET', 'HORATIO', ...],
//     scenes: [{ id, title, lines: [{ speaker, text, direction }] }]
//   }

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs';
const PDFJS_SRI = 'sha384-fzqD3KLclV6zyTSuToNuSG370CipiqN572vfT2zti7ORKnQPaJrvsz8deY+/Tgwe';
const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
const PDFJS_WORKER_SRI = 'sha384-RTiLhGDoA0SEd0K0E9qrg2HwSEEnAo91MwUh79PteR4v01eEByhHOdEkFKxeaeqw';

export const MAX_PDF_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_TEXT_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_PDF_PAGES = 250;
const MAX_SCRIPT_CHARS = 600000;
const MAX_RAW_LINES = 25000;
const MAX_SINGLE_LINE_LEN = 4000;
const MAX_STREAM_OUT_BYTES = 1024 * 1024; // 1 MB per FlateDecode stream (zip-bomb guard)
const MAX_TOTAL_OUT_BYTES = 4 * 1024 * 1024; // 4 MB total decompressed cap

const FORBIDDEN_SPEAKER_KEYS = new Set(['__PROTO__', 'CONSTRUCTOR', 'PROTOTYPE']);

let pdfjsLibPromise = null;

async function fetchVerifiedModuleBlobUrl(url, integrity) {
  const res = await fetch(url, {
    integrity,
    credentials: 'omit',
    referrerPolicy: 'no-referrer'
  });
  if (!res.ok) throw new Error(`CDN HTTP ${res.status}`);
  const code = await res.arrayBuffer();
  return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
}

async function loadPdfJs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = (async () => {
      const [libBlobUrl, workerBlobUrl] = await Promise.all([
        fetchVerifiedModuleBlobUrl(PDFJS_CDN, PDFJS_SRI),
        fetchVerifiedModuleBlobUrl(PDFJS_WORKER_CDN, PDFJS_WORKER_SRI)
      ]);
      try {
        const mod = await import(libBlobUrl);
        if (mod.GlobalWorkerOptions) {
          mod.GlobalWorkerOptions.workerSrc = workerBlobUrl;
        }
        return mod;
      } finally {
        URL.revokeObjectURL(libBlobUrl);
      }
    })().catch((err) => {
      pdfjsLibPromise = null;
      throw err;
    });
  }
  return pdfjsLibPromise;
}

// Extract text from a PDF File or ArrayBuffer
export async function extractTextFromPdf(fileOrBuffer) {
  if (fileOrBuffer && typeof fileOrBuffer.size === 'number' && fileOrBuffer.size > MAX_PDF_BYTES) {
    throw new Error('PDF exceeds 15 MB limit.');
  }
  const buffer = fileOrBuffer instanceof ArrayBuffer
    ? fileOrBuffer
    : await fileOrBuffer.arrayBuffer();

  if (buffer.byteLength > MAX_PDF_BYTES) {
    throw new Error('PDF exceeds 15 MB limit.');
  }

  // First try SRI-verified PDF.js with `isEvalSupported: false` (blocks CVE-2024-4367 font eval exploits)
  try {
    const pdfjs = await loadPdfJs();
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      isEvalSupported: false,
      disableFontFace: true
    });
    const pdf = await loadingTask.promise;
    const pageLimit = Math.min(pdf.numPages, MAX_PDF_PAGES);
    const pages = [];
    let charBudget = 0;

    for (let pageNum = 1; pageNum <= pageLimit; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      let lastY = null;
      const pageLines = [];
      let currentLine = '';

      for (const item of content.items) {
        const str = item.str || '';
        const y = Array.isArray(item.transform) ? Math.round(item.transform[5]) : null;
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 4) {
          if (currentLine.trim()) pageLines.push(currentLine.trim());
          currentLine = str;
        } else {
          currentLine += (currentLine && !currentLine.endsWith(' ') && !str.startsWith(' ') ? ' ' : '') + str;
        }
        if (y !== null) lastY = y;
      }
      if (currentLine.trim()) pageLines.push(currentLine.trim());
      const joinedPage = pageLines.join('\n');
      pages.push(joinedPage);
      charBudget += joinedPage.length;
      if (charBudget >= MAX_SCRIPT_CHARS) break;
    }
    const combined = pages.join('\n\n').slice(0, MAX_SCRIPT_CHARS);
    if (combined.trim().length > 20) return combined;
  } catch (e) {
    // Fall back to lightweight built-in PDF stream extractor (works offline or for simple PDFs)
  }

  return extractPdfStreamsOffline(buffer);
}

async function readStreamWithByteLimit(readable, maxBytes) {
  const reader = readable.getReader();
  const parts = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > maxBytes) {
          await reader.cancel();
          throw new Error('Compressed PDF stream exceeded safe memory bound');
        }
        parts.push(value);
      }
    }
  } finally {
    reader.releaseLock?.();
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of parts) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged;
}

// Offline fallback PDF parser that decompresses FlateDecode streams via DecompressionStream
// with strict zip-bomb byte caps and linear-time regexes.
async function extractPdfStreamsOffline(buffer) {
  const bytes = new Uint8Array(buffer);
  const latin1 = new TextDecoder('latin1').decode(bytes);
  const chunks = [];

  // Linear-time literal string & TJ array extraction (no nested quantifiers -> ReDoS safe)
  const collectTextOperators = (str) => {
    const tjMatches = str.matchAll(/\(([^()\\]{0,4000}(?:\\.[^()\\]{0,4000}){0,64})\)\s*Tj/g);
    for (const m of tjMatches) {
      if (m[1]) chunks.push(unescapePdfString(m[1]));
    }
    const arrayMatches = str.matchAll(/\[([^\]]{1,8192})\]\s*TJ/g);
    for (const m of arrayMatches) {
      const inner = [...m[1].matchAll(/\(([^()\\]{0,2000}(?:\\.[^()\\]{0,2000}){0,32})\)/g)]
        .map((x) => unescapePdfString(x[1]))
        .join('');
      if (inner) chunks.push(inner);
    }
  };

  collectTextOperators(latin1);

  if (typeof DecompressionStream !== 'undefined') {
    const streamRegex = /stream\r?\n([\s\S]{1,350000}?)\r?\nendstream/g;
    let match;
    let totalDecompressed = 0;
    while ((match = streamRegex.exec(latin1)) !== null) {
      if (totalDecompressed >= MAX_TOTAL_OUT_BYTES) break;
      const raw = match[1];
      const rawBytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) rawBytes[i] = raw.charCodeAt(i) & 0xff;
      try {
        const ds = new DecompressionStream('deflate');
        const writer = ds.writable.getWriter();
        writer.write(rawBytes).catch(() => {});
        writer.close().catch(() => {});
        const decompressed = await readStreamWithByteLimit(
          ds.readable,
          Math.min(MAX_STREAM_OUT_BYTES, MAX_TOTAL_OUT_BYTES - totalDecompressed)
        );
        totalDecompressed += decompressed.byteLength;
        const text = new TextDecoder('latin1').decode(decompressed);
        collectTextOperators(text);
      } catch (e) {}
    }
  }

  return chunks.join('\n').slice(0, MAX_SCRIPT_CHARS);
}

function unescapePdfString(s) {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}

// Words that frequently appear in ALL CAPS in headers/margins but are NOT character names
const NON_SPEAKER_HEADINGS = new Set([
  'ACT', 'SCENE', 'PROLOGUE', 'EPILOGUE', 'CHORUS', 'INTERMISSION',
  'BLACKOUT', 'CURTAIN', 'END', 'FINIS', 'THE END', 'CONTINUED',
  'DRAMATIS PERSONAE', 'CHARACTERS', 'CAST', 'SETTING', 'TIME', 'PLACE',
  'ENTER', 'EXIT', 'EXEUNT', 'RE-ENTER', 'SCENE I', 'SCENE II', 'SCENE III',
  'ACT I', 'ACT II', 'ACT III', 'ACT IV', 'ACT V', 'NOTE', 'NOTES', 'PAGE'
]);

function cleanSpeakerName(raw) {
  return String(raw || '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/[:.]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function isLikelySpeakerName(candidate) {
  if (!candidate || candidate.length < 2 || candidate.length > 28) return false;
  if (FORBIDDEN_SPEAKER_KEYS.has(candidate)) return false;
  if (NON_SPEAKER_HEADINGS.has(candidate)) return false;
  if (/^(ACT|SCENE|PAGE|PART|CHAPTER)\b/i.test(candidate)) return false;
  if (/^(ENTER|EXIT|EXEUNT|LIGHTS|MUSIC|SOUND)\b/i.test(candidate)) return false;
  if (!/^[A-Z][A-Z0-9\s'.&-]+$/.test(candidate)) return false;
  const wordCount = candidate.split(/\s+/).length;
  return wordCount <= 4;
}

// Parse raw script text (from PDF, TXT, Fountain, or pasted sides) into structured scenes & lines.
export function parseScriptText(rawText, { defaultTitle = 'Uploaded Script', defaultPlaywright = 'Custom Sides' } = {}) {
  const normalized = String(rawText || '')
    .slice(0, MAX_SCRIPT_CHARS)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const rawLines = normalized.split('\n').slice(0, MAX_RAW_LINES);

  let title = String(defaultTitle || 'Uploaded Script').replace(/\.(pdf|txt|fountain)$/i, '').slice(0, 140);
  let playwright = String(defaultPlaywright || 'Custom Sides').slice(0, 100);

  const scenes = [];
  let currentScene = {
    id: 'scene-1',
    title: 'Scene 1',
    lines: []
  };

  let currentSpeaker = null;
  let currentSpeechParts = [];
  let pendingDirection = '';

  const flushSpeech = () => {
    if (currentSpeaker && currentSpeechParts.length > 0) {
      const joined = currentSpeechParts.join(' ').replace(/\s+/g, ' ').trim();
      if (joined) {
        currentScene.lines.push({
          speaker: currentSpeaker,
          text: joined,
          ...(pendingDirection ? { direction: pendingDirection } : {})
        });
        pendingDirection = '';
      }
    }
    currentSpeechParts = [];
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim().slice(0, MAX_SINGLE_LINE_LEN);
    if (!line) continue;

    // Skip standalone page numbers
    if (/^\d{1,4}$/.test(line) || /^-\s*\d+\s*-$/.test(line)) continue;

    // Scene or Act heading: e.g. "ACT I", "SCENE II. Capulet's Orchard"
    if (/^(ACT|SCENE)\s+([IVXLCDM]+|\d+)\b/i.test(line)) {
      flushSpeech();
      currentSpeaker = null;
      if (currentScene.lines.length > 0) {
        scenes.push(currentScene);
      }
      currentScene = {
        id: `scene-${scenes.length + 1}`,
        title: line.slice(0, 80),
        lines: []
      };
      continue;
    }

    // Pure stage direction in [brackets] or (parentheses) or "Enter ..." / "Exeunt ..."
    if (
      (/^\[.*\]$/.test(line) || /^\(.*\)$/.test(line) || /^(Enter|Exit|Exeunt|Re-enter)\b/i.test(line)) &&
      line.length < 180
    ) {
      const dirClean = line.replace(/^[[(]|[\])]$/g, '').trim();
      if (currentSpeaker && currentSpeechParts.length > 0) {
        currentSpeechParts.push(`[${dirClean}]`);
      } else {
        pendingDirection = pendingDirection ? `${pendingDirection}; ${dirClean}` : dirClean;
      }
      continue;
    }

    // Pattern 1: Inline Speaker Prefix — e.g. "HAMLET: To be, or not to be..." or "HAMLET. To be..."
    const inlineMatch = line.match(/^([A-Z][A-Z0-9\s'.&-]{1,25}?)(?:\s*\([^)]*\))?\s*[:.]\s+(.+)$/);
    if (inlineMatch) {
      const candidate = cleanSpeakerName(inlineMatch[1]);
      const speech = inlineMatch[2].trim();
      if (isLikelySpeakerName(candidate) && speech.length > 0) {
        flushSpeech();
        currentSpeaker = candidate;
        currentSpeechParts.push(speech);
        continue;
      }
    }

    // Pattern 2: Standalone ALL-CAPS cue line (Folio / Samuel French / Dramatists Play Service / Fountain format)
    const candidateSpeaker = cleanSpeakerName(line);
    if (
      line === line.toUpperCase() &&
      isLikelySpeakerName(candidateSpeaker)
    ) {
      flushSpeech();
      currentSpeaker = candidateSpeaker;
      continue;
    }

    // Otherwise, if we have an active speaker, append to their current speech
    if (currentSpeaker) {
      currentSpeechParts.push(line);
    }
  }

  flushSpeech();
  if (currentScene.lines.length > 0) {
    scenes.push(currentScene);
  }

  // Fallback: if the uploaded text didn't use standard ALL-CAPS or COLON speaker cues,
  // try Title-Case `Speaker: dialogue` lines before giving up.
  if (scenes.length === 0 || scenes.every((s) => s.lines.length === 0)) {
    const looseLines = [];
    for (const raw of rawLines) {
      const trimmed = raw.trim();
      const m = trimmed.slice(0, MAX_SINGLE_LINE_LEN).match(/^([A-Za-z][A-Za-z\s'.-]{1,22}):\s*(.+)$/);
      if (m) {
        const spk = cleanSpeakerName(m[1]);
        if (spk && !FORBIDDEN_SPEAKER_KEYS.has(spk)) {
          looseLines.push({
            speaker: spk,
            text: m[2].trim()
          });
        }
      } else if (looseLines.length > 0 && trimmed) {
        looseLines[looseLines.length - 1].text += ` ${trimmed.slice(0, MAX_SINGLE_LINE_LEN)}`;
      }
    }
    if (looseLines.length > 0) {
      scenes.length = 0;
      scenes.push({
        id: 'scene-1',
        title: 'Scene 1',
        lines: looseLines
      });
    }
  }

  // Tally character line counts using a null-prototype map so role names never collide with Object.prototype
  const counts = Object.create(null);
  for (const sc of scenes) {
    for (const l of sc.lines) {
      counts[l.speaker] = (counts[l.speaker] || 0) + 1;
    }
  }

  const characters = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

  return {
    id: `custom-${Date.now().toString(36)}`,
    title,
    playwright,
    year: 'Custom Upload',
    category: 'Uploaded Scripts',
    custom: true,
    characters,
    characterLineCounts: { ...counts },
    scenes
  };
}
