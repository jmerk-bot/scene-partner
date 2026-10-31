# Scene Partner — Off-Book Line & Voice Rehearsal Studio

A tablet-first Progressive Web App (PWA) for aspiring actors to practice lines, get off-book, and run scenes with AI scene partners.

## Features

- **152 Pre-Loaded Scripts Organized by Playwright (42 Playwrights):**
  - **William Shakespeare (Top 20):** *Hamlet*, *Macbeth*, *Romeo and Juliet*, *A Midsummer Night's Dream*, *Othello*, *King Lear*, *The Tempest*, *Much Ado About Nothing*, *Twelfth Night*, *Julius Caesar*, *As You Like It*, *The Merchant of Venice*, *The Taming of the Shrew*, *Antony and Cleopatra*, *The Winter's Tale*, *Measure for Measure*, *Richard III*, *Coriolanus*, *The Comedy of Errors*, and *Love's Labour's Lost*.
  - **World Classics:** Oscar Wilde, Anton Chekhov, Henrik Ibsen, Sophocles, Euripides, Aeschylus, Aristophanes, Molière, George Bernard Shaw, Edmond Rostand, Christopher Marlowe, Ben Jonson, John Webster, Aphra Behn, Richard Brinsley Sheridan, Oliver Goldsmith, August Strindberg, Nikolai Gogol, Friedrich Schiller, Johann Wolfgang von Goethe, Pedro Calderón de la Barca, Lope de Vega, J.M. Synge, Susan Glaspell, and more.
- **Upload PDF / TXT / Fountain Scripts or Paste Audition Sides:**
  - Parses character cues and scenes directly on device (`js/pdf.js`) and saves custom scripts to `localStorage` and Cloud Backup.
- **Unique & Consistent Character Voices (`js/voice.js`):**
  - Assigns each unselected character in the play a distinct, consistent voice archetype (*Onyx*, *Shimmer*, *Echo*, *Nova*, *Fable*, *Alloy*, *Ash*, *Coral*, *Sage*, *Ballad*), with a custom voice-casting selector so you can preview and reassign voices anytime.
  - Supports **OpenAI Neural Theatre TTS (`gpt-4o-mini-tts`) + Whisper transcription** when an OpenAI API key is added in *Green Room → Voice & AI Engine*, and falls back seamlessly to multi-character Browser Web Speech API voices and live `SpeechRecognition` offline.
- **5-Level Fuzzy Line Matcher (`js/matcher.js`):**
  - Toggle line comparison strictness from **First Pass** (45% — very forgiving of paraphrasing) → **Blocking & Flow** (60%) → **Getting Off-Book** (75%) → **Dress Rehearsal** (88%) → **Final Practice** (95% word-perfect).
  - Understands archaic/poetic contractions (`'tis` ↔ `it is`, `o'er` ↔ `over`, `wherefore` ↔ `why`, `thou/thee` ↔ `you`) and phonetic homophones.
  - Say **"Line!"** (or tap **💡 "Line!" (Prompt Me)**) to have the stage manager highlight and read the next 5 words of your speech.
- **4 Karaoke Visual Themes (`css/styles.css`):**
  - **Shakespearean Folio:** Faded antique parchment background with classical Renaissance serif typography and rubricated crimson cues.
  - **Modern Stage:** Warm dark velvet rehearsal studio with gold spotlights.
  - **High Visibility:** Ultra-high-contrast black & bright yellow/white stage teleprompter for reading across the room.
  - **Rehearsal Room Paper:** Daylight ivory page with classic courier script formatting.
- **Zero-Login Single-User State & Cloud Gist Sync (`js/state.js`, `js/cloud.js`):**
  - All keys are strictly namespaced under `scene-partner:` (`scene-partner:v1`, `scene-partner:cloud:v1`, `scene-partner-state.json`, and Service Worker cache `scene-partner-__APP_VERSION__`) so it can be deployed alongside `addy-math-lab` on `https://jmerk-bot.github.io/scene-partner/` without any storage or cache collisions.

## Running Locally

From the `scene-partner` folder:

```bash
python3 -m http.server 8767
```

Then open `http://localhost:8767`.

## Running Checks

```bash
/opt/homebrew/bin/node scripts/check-app.mjs
```
