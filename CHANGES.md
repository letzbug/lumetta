# Story Engine V2.1 – correction: arbitrary input, no V1 fallback

## Untouched
- `vite.config.ts` (keep `base: '/lumetta/'`)
- `index.html`
- `.github/workflows/deploy.yml`
- `public/`
- Player, TTS, library and settings logic

## DELETE in your repo
- `src/services/demo/demoStoryEngine.ts` (the V1 Mosslight template engine)
- `src/services/demo/packs/` (whole folder)

## Added
- `src/services/storyEngine/engineConfig.ts`: efficient/granular mode and rewrite limit
- `src/services/storyEngine/plan.ts`: PLAN call (Interpreter → Guidance as sections of one structured answer)
- `src/services/storyEngine/review.ts`: REVIEW call (critic and fingerprint)
- `src/pages/create/DemoNotice.tsx`: honest no-provider screen with explicitly chosen, labelled examples
- `tests/engine.regression.test.ts` and `tests/mockStories.ts`: 11 regression tests, including George / 6 / "red car" / EN

## Modified
| File | Change |
|---|---|
| `storyEngine/storyEngine.ts` | `runStoryEngine` → efficient PLAN/WRITE/REVIEW (default) or granular |
| `storyEngine/critic.ts` | V1-marker, interest-injection and stronger swap-test checks; name-case check |
| `storyEngine/prompts.ts` | Combined PLAN/REVIEW prompts; `systemPrompt()` |
| `storyEngine/schemas.ts` | `StoryPlan` / review validators; engine kinds |
| `storyEngine/provider.ts` | Uses `systemPrompt()` |
| `storyEngine/demo/demoEngine.ts` | Examples only. No matching, no V1. |
| `storyEngine/demo/fixtures.ts` | Header comment only |
| `services/storyService.ts` | One V2 path; `NoStoryProvider`; `createExampleStory`; `finalizeText` (name case) |
| `services/imageService.ts` | No V1 dependency; neutral cover for live stories without an image provider |
| `services/demo/coverArt.ts` | `abstract` cover |
| `types/story.ts` | `abstract` subject; `v2-demo-example` kind (old kinds still load) |
| `pages/CreatingPage.tsx` | Demo notice instead of fake generation |
| `pages/PlayerPage.tsx`, `pages/LibraryPage.tsx` | "Example story" badge |
| `styles/pages.css` | Demo notice styles |
| `locales/de.json`, `en.json`, `fr.json` | `demo.*` strings |
| `server/api.mjs` | `plan`/`review` stages, per-stage models, CORS (`ALLOWED_ORIGINS`) |
| `.env.example` | New variables |
| `README.md`, `STORY_ENGINE_V2.md` | Documentation |

## package.json – merge by hand (two lines)
```json
"scripts":         { "test:engine": "tsx tests/engine.regression.test.ts" },
"devDependencies": { "tsx": "^4.19.0" }
```

## Apply and verify
**Option A – your repo matches my last full ZIP:**
`git apply lumetta-v2.1.patch`

**Option B – otherwise:**
1. Copy the files from this folder into your repo.
2. Delete the two V1 entries listed above.
3. Merge the two `package.json` lines.

**Then run:**
```bash
npm install
npm run typecheck
npm run test:engine
npm run build && npm run preview
```
Open `/lumetta/` and test: George → 6 → "red car" → Surprise me → Create.

## 2026-10-04 — Honest voice UI, thematic covers, real player duration
- Removed placeholder male/neutral voice choices while xAI Eve is the only real studio narrator.
- Normalizes old voice settings to the current Lumetta narrator.
- Live stories now derive a small local cover scene from title/cover prompt (cup, vehicle, robot, castle, space, ocean, dinosaur, dragon, cat, digger, park, crocodile) instead of always using the same abstract cover.
- Player duration badge switches to the real loaded audio duration, so a 1:56 narration displays about 2 min rather than a stale text estimate.
