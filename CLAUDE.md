# Scene Partner — Architecture & Conventions

## Shared Origin Rules (`https://jmerk-bot.github.io`)

Like `addy-math-lab` and `felix-math-lab`, this app is designed to be served from `https://jmerk-bot.github.io/scene-partner/`. Because all GitHub Pages sites under that account share an origin:
- Every `localStorage` key is prefixed `scene-partner:` (`STORAGE_KEY = 'scene-partner:v1'`, `LOG_KEY = 'scene-partner:log:v1'`, `CLOUD_KEY = 'scene-partner:cloud:v1'`, `OPENAI_KEY_STORAGE = 'scene-partner:openai:v1'`).
- The private GitHub Gist backup file is `scene-partner-state.json` (never `addy-math-lab-state.json`).
- The Service Worker cache in `sw.js` is `scene-partner-__APP_VERSION__` and `activate` only deletes caches starting with `scene-partner-`.
- Every asset path is relative (`./sw.js`, `./css/styles.css`, `./js/main.js`).
- Plain HTML, CSS, and ES modules with no build step.

## Verification

Run `/opt/homebrew/bin/node scripts/check-app.mjs` after any change to the script library, matcher, state, or `sw.js`.
