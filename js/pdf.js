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
const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

let pdfjsLibPromise = null;

async function loadPdfJs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import(PDFJS_CDN).then((mod) => {
      if (mod.GlobalWorkerOptions) {
        mod.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
      }
      return mod;
    });
  }
  return pdfjsLibPromise;
}

// Extract text from a PDF File or ArrayBuffer
export async function extractTextFromPdf(fileOrBuffer) {
  const buffer = fileOrBuffer instanceof ArrayBuffer
    ? fileOrBuffer
    : await fileOrBuffer.arrayBuffer();

  // First try full PDF.js for multi-column & compressed font streams
  try {
    const pdfjs = await loadPdfJs();
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;
    const pages = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      let lastY = null;
      let pageLines = [];
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
      pages.push(pageLines.join('\n'));
    }
    const combined = pages.join('\n\n');
    if (combined.trim().length > 20) return combined;
  } catch (e) {
    // Fall back to lightweight built-in PDF stream extractor (works offline or for simple PDFs)
  }

  return extractPdfStreamsOffline(buffer);
}

// Offline fallback PDF parser that decompresses FlateDecode streams via DecompressionStream
// and extracts literal `(text)` and `[(text)]` operators.
async function extractPdfStreamsOffline(buffer) {
  const bytes = new Uint8Array(buffer);
  const latin1 = new TextDecoder('latin1').decode(bytes);
  const chunks = [];

  // Extract uncompressed literal strings first
  const collectTextOperators = (str) => {
    const matches = str.matchAll(/\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*Tj|\[((?:[^[\]]|\([^)]*\))*)\]\s*TJ/g);
    for (const m of matches) {
      if (m[1] !== undefined) {
        chunks.push(unescapePdfString(m[1]));
      } else if (m[2] !== undefined) {
        const inner = [...m[2].matchAll(/\(([^()\\]*(?:\\.[^()\\]*)*)\)/g)]
          .map((x) => unescapePdfString(x[1]))
          .join('');
        if (inner) chunks.push(inner);
      }
    }
  };

  collectTextOperators(latin1);

  // Also try decompressing FlateDecode streams if DecompressionStream is available
  if (typeof DecompressionStream !== 'undefined') {
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;
    while ((match = streamRegex.exec(latin1)) !== null) {
      const raw = match[1];
      if (raw.length > 0 && raw.length < 500000) {
        const rawBytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) rawBytes[i] = raw.charCodeAt(i) & 0xff;
        try {
          const ds = new DecompressionStream('deflate');
          const writer = ds.writable.getWriter();
          writer.write(rawBytes);
          writer.close();
          const decompressed = await new Response(ds.readable).arrayBuffer();
          const text = new TextDecoder('latin1').decode(decompressed);
          collectTextOperators(text);
        } catch (e) {}
      }
    }
  }

  return chunks.join('\n');
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
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const rawLines = normalized.split('\n');

  let title = defaultTitle.replace(/\.(pdf|txt|fountain)$/i, '');
  let playwright = defaultPlaywright;

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
    const line = rawLines[i].trim();
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
      const m = trimmed.match(/^([A-Za-z][A-Za-z\s'.-]{1,22}):\s*(.+)$/);
      if (m) {
        looseLines.push({
          speaker: cleanSpeakerName(m[1]),
          text: m[2].trim()
        });
      } else if (looseLines.length > 0 && trimmed) {
        looseLines[looseLines.length - 1].text += ` ${trimmed}`;
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

  // Tally character line counts and sort characters by prominence
  const counts = {};
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
    characterLineCounts: counts,
    scenes
  };
}
