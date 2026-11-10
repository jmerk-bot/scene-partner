// Fuzzy script-matching & line-comparison engine for Scene Partner.
//
// Actors rarely deliver every word verbatim on early passes, and speech-to-text
// engines occasionally mishear archaic or theatrical vocabulary ("wherefore" ->
// "where for", "'tis" -> "it is", "prithee" -> "pretty"). This module compares
// spoken transcripts against the script line using:
//   1. Archaic / theatrical contraction expansion & normalization
//   2. Soundex / phonetic key equivalence for homophones & STT quirks
//   3. Character-level Levenshtein similarity for near-miss words
//   4. Monotonic & windowed word-alignment for live karaoke tracking
//   5. Configurable tolerance levels from "First Pass" to "Final Practice"

export const TOLERANCE_LEVELS = {
  'first-pass': {
    id: 'first-pass',
    label: 'First Pass',
    shortLabel: '1st Pass',
    badge: 'Very Forgiving · 45%',
    desc: 'Paraphrasing & rough approximations pass; advances as soon as you hit the gist or tail words.',
    minOverallRatio: 0.45,
    wordFuzzyThreshold: 0.58,
    tailTriggerRatio: 0.38,
    maxLookahead: 7,
    allowPhonetic: true
  },
  'blocking': {
    id: 'blocking',
    label: 'Blocking & Flow',
    shortLabel: 'Blocking',
    badge: 'Generous · 60%',
    desc: 'Focus on rhythm and movement; skips dropped adjectives or minor word swaps.',
    minOverallRatio: 0.60,
    wordFuzzyThreshold: 0.65,
    tailTriggerRatio: 0.52,
    maxLookahead: 5,
    allowPhonetic: true
  },
  'off-book': {
    id: 'off-book',
    label: 'Getting Off-Book',
    shortLabel: 'Off-Book',
    badge: 'Balanced · 75%',
    desc: 'Catches missed clauses while forgiving natural contractions and slight stumbles.',
    minOverallRatio: 0.75,
    wordFuzzyThreshold: 0.74,
    tailTriggerRatio: 0.70,
    maxLookahead: 4,
    allowPhonetic: true
  },
  'dress-rehearsal': {
    id: 'dress-rehearsal',
    label: 'Dress Rehearsal',
    shortLabel: 'Dress',
    badge: 'Crisp · 88%',
    desc: 'Expects nearly every word in order; only minor STT homophones are forgiven.',
    minOverallRatio: 0.88,
    wordFuzzyThreshold: 0.82,
    tailTriggerRatio: 0.84,
    maxLookahead: 3,
    allowPhonetic: true
  },
  'final-practice': {
    id: 'final-practice',
    label: 'Final Practice',
    shortLabel: 'Word-Perfect',
    badge: 'Strict · 95%',
    desc: 'Word-perfect accuracy required across the entire speech.',
    minOverallRatio: 0.95,
    wordFuzzyThreshold: 0.88,
    tailTriggerRatio: 0.92,
    maxLookahead: 2,
    allowPhonetic: false
  }
};

export const TOLERANCE_ORDER = [
  'first-pass',
  'blocking',
  'off-book',
  'dress-rehearsal',
  'final-practice'
];

// Archaic & poetic equivalents so that if an actor says "it is" for "'tis", or
// STT transcribes "wherefore" as "where for", or "o'er" as "over", both match.
const CANONICAL_SWAPS = {
  tis: 'itis',
  twas: 'itwas',
  twill: 'itwill',
  twere: 'itwere',
  twould: 'itwould',
  oer: 'over',
  neer: 'never',
  eer: 'ever',
  een: 'even',
  oft: 'often',
  ere: 'before',
  wherefore: 'why',
  whither: 'where',
  hither: 'here',
  thither: 'there',
  hence: 'fromhere',
  thence: 'fromthere',
  doth: 'does',
  dost: 'do',
  hath: 'has',
  hast: 'have',
  art: 'are',
  wilt: 'will',
  shalt: 'shall',
  canst: 'can',
  wouldst: 'would',
  shouldst: 'should',
  couldst: 'could',
  didst: 'did',
  hadst: 'had',
  mayst: 'may',
  thee: 'you',
  thou: 'you',
  thy: 'your',
  thine: 'yours',
  ye: 'you',
  anon: 'soon',
  prithee: 'please',
  marry: 'indeed',
  ay: 'yes',
  aye: 'yes',
  yea: 'yes',
  nay: 'no'
};

// Strip stage directions in [brackets] or (parentheses) when comparing spoken text
export function stripStageDirections(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Clean a single token to lowercase alphanumeric
export function normalizeWord(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Split script text into display tokens (preserving punctuation/casing) paired
// with their normalized comparison forms.
export function tokenizeLine(text) {
  const cleaned = stripStageDirections(text);
  if (!cleaned) return [];
  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  const tokens = [];
  for (let i = 0; i < rawTokens.length; i++) {
    const display = rawTokens[i];
    const norm = normalizeWord(display);
    if (!norm) continue;
    tokens.push({
      index: tokens.length,
      display,
      norm,
      canonical: CANONICAL_SWAPS[norm] || norm,
      phonetic: phoneticKey(norm)
    });
  }
  return tokens;
}

// Lightweight phonetic key (Metaphone/Soundex hybrid) to equate homophones
// and common speech-recognition variants ("there"/"their", "night"/"knight", "know"/"no").
export function phoneticKey(word) {
  const w = normalizeWord(word);
  if (!w) return '';
  let s = w
    .replace(/^kn/, 'n')
    .replace(/^gn/, 'n')
    .replace(/^pn/, 'n')
    .replace(/^wr/, 'r')
    .replace(/^wh/, 'w')
    .replace(/^ps/, 's')
    .replace(/igh/g, 'i')
    .replace(/ph/g, 'f')
    .replace(/gh/g, '')
    .replace(/ck/g, 'k')
    .replace(/dg/g, 'j')
    .replace(/tch/g, 'ch')
    .replace(/sh/g, 'x')
    .replace(/th/g, '0')
    .replace(/c([eiy])/g, 's$1')
    .replace(/c/g, 'k')
    .replace(/q/g, 'k')
    .replace(/z/g, 's');

  // Keep first letter, drop non-leading vowels and duplicate adjacent letters
  const first = s[0];
  const rest = s
    .slice(1)
    .replace(/[aeiouy]/g, '')
    .replace(/(.)\1+/g, '$1');
  return (first + rest).slice(0, 6);
}

// Character-level Levenshtein distance between two normalized strings
export function editDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= b.length; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost
      );
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

// Similarity score [0..1] between a script token object and a spoken token object
export function wordSimilarity(scriptTok, spokenTok, tolerance = TOLERANCE_LEVELS['off-book']) {
  if (!scriptTok || !spokenTok) return 0;
  const a = scriptTok.norm;
  const b = spokenTok.norm;
  if (!a || !b) return 0;
  if (a === b) return 1.0;

  // Canonical archaic swap ("thou" / "you", "'tis" / "itis")
  if (scriptTok.canonical === spokenTok.canonical) {
    return tolerance.allowPhonetic ? 0.95 : 0.85;
  }

  // Prefix / stem match for longer words (e.g. "imagining" vs "imagine")
  if (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) {
    const ratio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
    if (ratio >= 0.72) return 0.88;
  }

  // Phonetic match for words of similar length
  if (
    tolerance.allowPhonetic &&
    scriptTok.phonetic &&
    scriptTok.phonetic.length >= 2 &&
    scriptTok.phonetic === spokenTok.phonetic &&
    Math.abs(a.length - b.length) <= 3
  ) {
    return 0.86;
  }

  const maxLen = Math.max(a.length, b.length);
  const dist = editDistance(a, b);
  return Math.max(0, 1 - dist / maxLen);
}

// Detects if the actor just called out "Line!" or "Line please" to ask the
// prompter for a hint — works both at the start of a cue AND mid-monologue,
// while avoiding false triggers when the script itself expects the word "line".
export function isPromptCommand(transcript) {
  const cleaned = normalizeWord(transcript);
  return (
    cleaned === 'line' ||
    cleaned === 'lineplease' ||
    cleaned === 'whatsmyline' ||
    cleaned === 'prompt' ||
    cleaned === 'hint'
  );
}

export function detectSpokenPromptRequest(transcript, scriptText = '', currentActiveIndex = 0) {
  const rawWords = String(transcript || '').trim().split(/\s+/).filter(Boolean);
  if (!rawWords.length) return false;

  const lastOne = normalizeWord(rawWords[rawWords.length - 1]);
  const lastTwo = rawWords.length >= 2
    ? normalizeWord(rawWords.slice(-2).join(''))
    : '';

  const matchedPromptPhrase =
    lastTwo === 'lineplease' ||
    lastTwo === 'whatsmyline' ||
    lastTwo === 'promptme' ||
    lastOne === 'line' ||
    lastOne === 'prompt' ||
    lastOne === 'hint';

  if (!matchedPromptPhrase) return false;

  // Unambiguous two-word prompter requests always trigger
  if (lastTwo === 'lineplease' || lastTwo === 'whatsmyline' || lastTwo === 'promptme') {
    return true;
  }

  // Check whether the script itself expects "line" / "prompt" / "hint" near the active word cursor
  const scriptTokens = tokenizeLine(scriptText);
  if (scriptTokens.length > 0) {
    const winStart = Math.max(0, currentActiveIndex - 1);
    const winEnd = Math.min(scriptTokens.length, currentActiveIndex + 4);
    for (let i = winStart; i < winEnd; i++) {
      if (scriptTokens[i].norm === lastOne) {
        return false;
      }
    }
  }
  return true;
}

// Given up to N SpeechRecognition alternatives for a phrase, pick the hypothesis
// whose words align best with the expected script speech (huge boost for Shakespearean/archaic diction).
export function pickBestAlternativeForScript(alternatives = [], expectedScript = '') {
  const valid = (alternatives || []).map((s) => String(s || '').trim()).filter(Boolean);
  if (valid.length <= 1 || !expectedScript) return valid[0] || '';

  // If any alternative is an explicit "Line!" prompt callout, preserve primary hypothesis
  if (isPromptCommand(valid[0])) return valid[0];

  const scriptTokens = tokenizeLine(expectedScript);
  if (!scriptTokens.length) return valid[0];
  const scriptNormSet = new Set(scriptTokens.map((t) => t.norm));
  const scriptCanonSet = new Set(scriptTokens.map((t) => t.canonical));
  const scriptPhonSet = new Set(scriptTokens.map((t) => t.phonetic).filter(Boolean));

  let bestText = valid[0];
  let bestScore = -1;

  for (let idx = 0; idx < valid.length; idx++) {
    const candidate = valid[idx];
    const toks = tokenizeLine(candidate);
    let score = idx === 0 ? 0.15 : 0; // slight tie-breaker preference for top acoustic confidence
    for (const tok of toks) {
      if (scriptNormSet.has(tok.norm)) score += 1.0;
      else if (scriptCanonSet.has(tok.canonical)) score += 0.9;
      else if (tok.phonetic && scriptPhonSet.has(tok.phonetic)) score += 0.65;
    }
    if (score > bestScore) {
      bestScore = score;
      bestText = candidate;
    }
  }
  return bestText;
}

// Aligns a spoken transcript against a script line and returns rich karaoke
// progress and completion metrics.
//
// Returns:
//   - tokens: array of { display, norm, state: 'matched' | 'approx' | 'missed' | 'upcoming' | 'active', score }
//   - activeIndex: index of the next expected word for the karaoke cursor
//   - matchedCount: number of matched or approximated words
//   - totalCount: total words in script line
//   - accuracy: [0..1] overall line accuracy
//   - progressRatio: [0..1] how far through the line the actor has reached
//   - isComplete: boolean — whether the line should auto-advance under current tolerance
export function evaluateSpokenLine(scriptText, spokenTranscript, toleranceKey = 'off-book') {
  const tolerance = TOLERANCE_LEVELS[toleranceKey] || TOLERANCE_LEVELS['off-book'];
  const scriptTokens = tokenizeLine(scriptText);
  const spokenTokens = tokenizeLine(spokenTranscript);

  if (scriptTokens.length === 0) {
    return {
      tokens: [],
      activeIndex: 0,
      matchedCount: 0,
      totalCount: 0,
      accuracy: 1,
      progressRatio: 1,
      isComplete: true
    };
  }

  //Also join consecutive spoken tokens (e.g. "it" + "is" -> "itis") to match "'tis"
  const spokenWithBigrams = [];
  for (let j = 0; j < spokenTokens.length; j++) {
    spokenWithBigrams.push({
      ...spokenTokens[j],
       bigramNext: j + 1 < spokenTokens.length ? spokenTokens[j].norm + spokenTokens[j + 1].norm : ''
    });
  }

  const states = new Array(scriptTokens.length).fill('upcoming');
  const scores = new Array(scriptTokens.length).fill(0);

  let scriptCursor = 0;
  let highestMatchedIdx = -1;

  for (let j = 0; j < spokenWithBigrams.length && scriptCursor < scriptTokens.length; j++) {
    const sp = spokenWithBigrams[j];
    const windowEnd = Math.min(scriptTokens.length, scriptCursor + tolerance.maxLookahead);

    let bestIdx = -1;
    let bestScore = 0;
    let usedBigram = false;

    for (let i = scriptCursor; i < windowEnd; i++) {
      const sc = scriptTokens[i];
      let sim = wordSimilarity(sc, sp, tolerance);

      // Check if two spoken words ("it is") match one contracted script word ("'tis")
      if (sp.bigramNext && (sc.norm === sp.bigramNext || sc.canonical === sp.bigramNext)) {
        if (0.94 > sim) {
          sim = 0.94;
          usedBigram = true;
        }
      }

      // Slight preference for earlier words in the lookahead window
      const positionPenalty = (i - scriptCursor) * 0.025;
      const effective = sim - positionPenalty;

      if (sim >= tolerance.wordFuzzyThreshold && effective > bestScore) {
        bestScore = sim;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1) {
      // Mark any skipped words between scriptCursor and bestIdx as 'missed' (or 'approx' in very loose modes)
      for (let k = scriptCursor; k < bestIdx; k++) {
        if (states[k] === 'upcoming') {
          states[k] = 'missed';
        }
      }
      states[bestIdx] = bestScore >= 0.92 ? 'matched' : 'approx';
      scores[bestIdx] = bestScore;
      highestMatchedIdx = Math.max(highestMatchedIdx, bestIdx);
      scriptCursor = bestIdx + 1;
      if (usedBigram) j += 1;
    }
  }

  // Count matched & approximated words
  let matchedCount = 0;
  let weightedSum = 0;
  for (let i = 0; i < scriptTokens.length; i++) {
    if (states[i] === 'matched') {
      matchedCount += 1;
      weightedSum += 1;
    } else if (states[i] === 'approx') {
      matchedCount += 1;
      weightedSum += 0.85;
    } else if (
      tolerance.id === 'first-pass' &&
      states[i] === 'missed' &&
      i < highestMatchedIdx &&
      scriptTokens[i].norm.length <= 3
    ) {
      // In First Pass mode, small skipped articles/prepositions between matched words count softly
      weightedSum += 0.5;
    }
  }

  const activeIndex = Math.min(scriptTokens.length - 1, Math.max(0, highestMatchedIdx + 1));
  if (highestMatchedIdx < scriptTokens.length - 1 && states[activeIndex] === 'upcoming') {
    states[activeIndex] = 'active';
  }

  const totalCount = scriptTokens.length;
  const accuracy = totalCount > 0 ? Math.min(1, weightedSum / totalCount) : 1;
  const progressRatio = totalCount > 0 ? (highestMatchedIdx + 1) / totalCount : 1;

  // Tail detection: has the actor spoken one of the final 2 words of the line?
  const tailStart = Math.max(0, totalCount - (tolerance.id === 'first-pass' ? 3 : 2));
  let hitTail = false;
  for (let i = tailStart; i < totalCount; i++) {
    if (states[i] === 'matched' || states[i] === 'approx') {
      hitTail = true;
      break;
    }
  }

  // Determine if the line is complete under the selected tolerance
  const enoughOverall = accuracy >= tolerance.minOverallRatio;
  const enoughWithTail = hitTail && accuracy >= tolerance.tailTriggerRatio && progressRatio >= 0.75;
  // For 1-3 word cues ("My lord?", "Ay, madam."), a single solid match completes the line
  const shortLineMatch = totalCount <= 3 && matchedCount >= Math.max(1, Math.ceil(totalCount * tolerance.minOverallRatio));

  const isComplete = enoughOverall || enoughWithTail || shortLineMatch;
  const isNearCompleteForPause =
    !isComplete &&
    (hitTail || progressRatio >= 0.85) &&
    accuracy >= Math.max(0.35, tolerance.minOverallRatio - 0.14);

  return {
    tokens: scriptTokens.map((t, i) => ({
      display: t.display,
      norm: t.norm,
      state: states[i],
      score: scores[i]
    })),
    activeIndex,
    matchedCount,
    totalCount,
    accuracy,
    progressRatio,
    hitTail,
    isNearCompleteForPause,
    isComplete
  };
}
