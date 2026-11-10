#!/usr/bin/env node
// Automated verification script for Scene Partner:
//   1. Verifies every file in APP_SHELL in `sw.js` exists on disk
//   2. Verifies storage/cache prefixes are strictly `scene-partner` (no collision with addy-math-lab)
//   3. Verifies the pre-loaded script library has 100+ plays, including all Top 20 Shakespeare plays,
//      and every single play has hydrated scenes, characters, and line counts
//   4. Tests the fuzzy line-matching & karaoke alignment engine across all 5 tolerance levels
//      ("First Pass" -> "Final Practice"), archaic contractions, and "Line!" voice prompts
//   5. Tests the script & PDF text parser (`parseScriptText`) and deterministic character voice assignment

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

import { getAllPlays, groupPlaysByPlaywright } from '../js/library.js';
import { SHAKESPEARE_PLAYS } from '../js/library-shakespeare.js';
import {
  TOLERANCE_LEVELS,
  TOLERANCE_ORDER,
  evaluateSpokenLine,
  isPromptCommand,
  detectSpokenPromptRequest,
  pickBestAlternativeForScript
} from '../js/matcher.js';
import { assignVoicesToCharacters, VOICE_PROFILES } from '../js/voice.js';
import { parseScriptText } from '../js/pdf.js';
import { STORAGE_KEY, LOG_KEY, obfuscateKeyForSync, deobfuscateKeyFromSync } from '../js/state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// 1. Check APP_SHELL in sw.js
const swSource = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
assert.ok(swSource.includes("const CACHE = 'scene-partner-__APP_VERSION__';"), 'sw.js CACHE must use scene-partner prefix');
assert.ok(swSource.includes("key.startsWith('scene-partner-')"), 'sw.js activate filter must only target scene-partner- caches');

const shellMatch = swSource.match(/const APP_SHELL = \[([\s\S]*?)\];/);
assert.ok(shellMatch, 'APP_SHELL array found in sw.js');
const urls = [...shellMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
for (const rel of urls) {
  if (rel === './') continue;
  const fullPath = path.join(ROOT, rel.replace(/^\.\//, ''));
  assert.ok(fs.existsSync(fullPath), `Missing APP_SHELL file on disk: ${rel}`);
}

// 2. Check storage keys
assert.ok(STORAGE_KEY.startsWith('scene-partner:'), 'STORAGE_KEY must start with scene-partner:');
assert.ok(LOG_KEY.startsWith('scene-partner:'), 'LOG_KEY must start with scene-partner:');

// 3. Check pre-loaded library & Top 20 Shakespeare
assert.equal(SHAKESPEARE_PLAYS.length, 20, 'Should include exactly the Top 20 Shakespeare plays');
const allPlays = getAllPlays();
assert.ok(allPlays.length >= 110, `Expected 110+ plays in library, found ${allPlays.length}`);

const groups = groupPlaysByPlaywright(allPlays);
assert.ok(groups.length >= 20, `Expected 20+ playwrights, found ${groups.length}`);

for (const play of allPlays) {
  assert.ok(play.id && play.title && play.playwright, `Play missing metadata: ${JSON.stringify(play)}`);
  assert.ok(Array.isArray(play.scenes) && play.scenes.length > 0, `Play ${play.id} has no scenes`);
  assert.ok(Array.isArray(play.characters) && play.characters.length >= 2, `Play ${play.id} needs at least 2 characters`);
  for (const scene of play.scenes) {
    assert.ok(Array.isArray(scene.lines) && scene.lines.length >= 4, `Scene ${scene.id} in ${play.id} has too few lines`);
  }
}

// 4. Check deterministic voice assignment
const hamletPlay = allPlays.find((p) => p.id === 'shake-hamlet');
const voiceMap = assignVoicesToCharacters(hamletPlay.characters);
for (const char of hamletPlay.characters) {
  assert.ok(voiceMap[char], `Character ${char} was not assigned a voice`);
  assert.ok(VOICE_PROFILES.some((v) => v.id === voiceMap[char].id));
}
// Co-stars in a scene should receive distinct voices
assert.notEqual(voiceMap.HAMLET.id, voiceMap.OPHELIA.id, 'Hamlet and Ophelia should have distinct voices');
assert.notEqual(voiceMap.HAMLET.id, voiceMap.CLAUDIUS.id, 'Hamlet and Claudius should have distinct voices');

// 5. Check fuzzy line matcher across all 5 tolerance levels
const sampleScript = "Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune";

// Exact match completes at every tolerance level, including Final Practice
for (const tolKey of TOLERANCE_ORDER) {
  const exactRes = evaluateSpokenLine(sampleScript, sampleScript, tolKey);
  assert.equal(exactRes.isComplete, true, `Exact line should complete under ${tolKey}`);
  assert.ok(exactRes.accuracy >= 0.95);
}

// Expansion of archaic "'tis" -> "it is" plus dropped middle words should pass in "First Pass" & "Blocking",
// but NOT in "Final Practice"
const roughAttempt = 'Whether it is nobler in mind to suffer slings and arrows of fortune';
const firstPassRes = evaluateSpokenLine(sampleScript, roughAttempt, 'first-pass');
const blockingRes = evaluateSpokenLine(sampleScript, roughAttempt, 'blocking');
const finalPracticeRes = evaluateSpokenLine(sampleScript, roughAttempt, 'final-practice');

assert.equal(firstPassRes.isComplete, true, 'Rough approximation should pass in First Pass mode');
assert.equal(blockingRes.isComplete, true, 'Rough approximation should pass in Blocking mode');
assert.equal(finalPracticeRes.isComplete, false, 'Rough approximation should NOT pass in Final Practice mode');

// Check "Line!" prompt voice trigger (both start-of-speech and mid-monologue)
assert.equal(isPromptCommand('Line!'), true);
assert.equal(isPromptCommand('line please'), true);
assert.equal(isPromptCommand('To be or not to be'), false);
assert.equal(
  detectSpokenPromptRequest('To be or not to be that is the question line', sampleScript, 0),
  true,
  'Mid-monologue "Line!" callout should trigger prompter'
);
assert.equal(
  detectSpokenPromptRequest('Hold the line', 'Hold the line of battle fast', 2),
  false,
  'Speaking "line" when the script expects "line" must NOT false-trigger prompter'
);

// Check multi-alternative STT selection for archaic diction
const bestAlt = pickBestAlternativeForScript(
  ['o romeo romeo where for art now romeo', 'o romeo romeo wherefore art thou romeo'],
  'O Romeo, Romeo! wherefore art thou Romeo?'
);
assert.ok(bestAlt.includes('wherefore art thou'), 'Should select SpeechRecognition alternative matching archaic script words');

// Check Gist secret-scanner key vault obfuscation round-trip
const fakeKey = 'sk-proj-TestKey1234567890AbCdEfGhIjKlMnOpQrStUvWxYz';
const masked = obfuscateKeyForSync(fakeKey);
assert.ok(masked.startsWith('sp1:') && !masked.includes('sk-'), 'Obfuscated sync key must not expose sk- prefix');
assert.equal(deobfuscateKeyFromSync(masked), fakeKey, 'Deobfuscated key must match original');

// Check verbatim classic metadata
const verbatimPlays = allPlays.filter((p) => p.verbatim);
assert.ok(verbatimPlays.length >= 37, `Expected 37+ verbatim plays, found ${verbatimPlays.length}`);

// 6. Check custom script / PDF text parser
const rawSampleSides = `
ACT I
SCENE 1. A Rehearsal Room.

[Enter JULIET and NURSE]

NURSE:
Your lady mother is coming to your chamber.
The day is broke; be wary, look about.

JULIET
Then, window, let day in, and let life out.
Farewell! God knows when we shall meet again.
`;

const parsed = parseScriptText(rawSampleSides, { defaultTitle: 'Audition Sides' });
assert.ok(parsed.characters.includes('NURSE') && parsed.characters.includes('JULIET'));
assert.equal(parsed.scenes[0].lines.length, 2);

console.log(`✓ All checks passed: ${allPlays.length} plays across ${groups.length} playwrights, ${urls.length} cached PWA shell files, 5 tolerance levels verified.`);
