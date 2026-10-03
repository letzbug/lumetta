# Story Engine V2 – changed files

## Untouched (your working GitHub Pages setup stays as it is)
- `vite.config.ts` (keep `base: '/lumetta/'`)
- `index.html`
- `.github/workflows/deploy.yml`
- `package.json` (no new dependencies)

## Added
- `src/services/storyEngine/` (whole folder: pipeline, prompts, schemas, provider, critic, fingerprint, demo fixtures)
- `src/components/ErrorBoundary.tsx`
- `src/utils/storySanitizer.ts`
- `STORY_ENGINE_V2.md`

## Modified
| File | Change |
|---|---|
| `src/services/storyService.ts` | Wired to Story Engine V2. Same `createStory()` API for the UI. |
| `src/services/demo/coverArt.ts` | 4 new cover subjects: digger, park, cat, crocodile |
| `src/services/storageService.ts` | Tolerant sorting, independent availability probe |
| `src/services/tts/browserSpeechEngine.ts` | One-line strict-mode fix. Behaviour unchanged. |
| `src/types/story.ts` | Optional `engine` metadata and cover `subject`. Backward compatible. |
| `src/store/AppStore.tsx` | Library is sanitised on load |
| `src/main.tsx` | `ErrorBoundary`; service worker registered via `import.meta.env.BASE_URL` |
| `src/locales/fr.json` | Consistent "vous" form in two strings |
| `public/sw.js`, `public/manifest.webmanifest` | Scope-relative paths, so they work at `/` and `/lumetta/` |
| `server/api.mjs`, `server/providers/story.mjs` | New `POST /api/llm` stage proxy (allowlisted stages) |
| `README.md` | Story Engine V2 section |

## How to apply
**Option A – your repo still matches my last ZIP:**
`git apply lumetta-v2.patch`

**Option B – you edited files since then:** copy the folders and files above over your repo. Compare these four first, because you may have adapted them for GitHub Pages:
- `src/main.tsx`
- `public/sw.js`
- `public/manifest.webmanifest`
- `src/store/AppStore.tsx`

**Then:**
```bash
npm run typecheck && npm run build && npm run preview
```
Open `/lumetta/` and test: landing → create → refresh on a story.
