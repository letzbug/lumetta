# Lumetta – Story Engine V2

## What changed
The single-prompt / template story generation was replaced by a staged pipeline. UI, visual identity, routing and deployment setup were not changed.

```
Child input → Interpreter → Imagination (4 candidates + diversity check) → Selector
→ Architect → Characters → (optional) Guidance → Writer → Critic → targeted rewrite
→ Final story → Fingerprint
```

The critic sends a weak story back to the **earliest responsible stage**:

| Problem layer | Stage the story returns to |
|---|---|
| `concept` | Imagination, re-run with the rejected premise excluded |
| `architect` | Architect |
| `character` | Character Engine and Writer |
| `guidance` | Guidance and Writer |
| `writer` | Writer only |

At most 2 revisions are made. If the model critic fails, the deterministic local checks still apply.

## Where things live (`src/services/storyEngine/`)

| File | Responsibility |
|---|---|
| `schemas.ts` | Contracts for every stage plus validators. Model JSON is never trusted blindly. |
| `prompts.ts` | **All stage prompts**, age tendencies and sampling settings, in one place |
| `provider.ts` | `LlmProvider` interface (`generateStructured` / `generateText`), JSON recovery, retries |
| `interpreter.ts` … `writer.ts` | One file per stage |
| `critic.ts` | Model critic plus deterministic local checks (see below) |
| `cliches.ts` | Context-aware cliché detector: a pattern is flagged only if the request did not ask for it |
| `fingerprint.ts` | Privacy-minimised fingerprints, keeps the last 8 in localStorage to reduce repetition |
| `storyEngine.ts` | Orchestrator |
| `demo/fixtures.ts` | 5 benchmark stories (DE), each a different story form |
| `demo/demoEngine.ts` | Demo mode: matching fixture, otherwise the V1 template engine, labelled as such |

The local critic checks: forbidden phrasing, clichés, length, sound-effect spam, the protagonist token, and a rough swap test.

The guidance principles still come from `src/config/guidance/principles.json`, so specialists edit one file.

## Providers and keys
- The browser only calls `POST /api/llm`, one pipeline stage per call.
- Keys stay on the server: `server/api.mjs` and `server/providers/story.mjs`, with Mistral, OpenAI and Anthropic configured via `.env`.
- The server accepts only the 9 known stage names, re-runs the safety screen and rate-limits requests.
- **Privacy:** the child's first name is replaced by `{{HERO}}` before anything leaves the device and is restored afterwards. Fingerprints never contain names or story text.

## Demo mode, including GitHub Pages
GitHub Pages has no server, so the app automatically stays in demo mode there. This holds even with `VITE_DEMO_MODE=false`: `/api/health` returns 404, and the app falls back to demo.

| Benchmark | Story | Form |
|---|---|---|
| A, age 5, „Bagger“ | „Was wird das wohl?“ | realistic everyday story with a refrain |
| B, age 7, „Fantasialand + Magie“ | „Lotti zaubert rückwärts“ | magical situational comedy with a rule puzzle |
| C, age 8, „Dinosaurier im Weltraum“ | „Funkspruch aus der Kreidezeit“ | science-fiction adventure told over a radio dialogue |
| D, age 9, „Meine Katze kann nur dienstags sprechen“ | „Mathilda hat bis Mitternacht“ | character comedy with a deadline and an information puzzle |
| E, age 6, Krokodil / rosa Porsche / Zahnarzt | „Herr Knurr muss zum Zahnarzt“ | small situational comedy with a mutual hidden fear |

Requests that match no fixture, and all French or English requests, use the V1 template engine. A real provider writes free stories.

## Robustness
- **Render errors:** an `ErrorBoundary` replaces a blank white page with the friendly Lumetta message.
- **Damaged or legacy library data:** sanitised on load; invalid records are skipped.
- **Missing dates in stored records:** IndexedDB sorting tolerates them.
- **Malformed model JSON:** fences and trailing commas are recovered, a second attempt is made with feedback, and only then does the friendly error state appear.
- **Service worker and manifest:** paths are relative to their scope and work at `/` and at `/lumetta/`.

## Tests run (in the build environment, without network)
- **Strict `tsc` (noUnused*):** all engine, service, config, utils and type files pass with 0 errors.
- **Engine unit run:** all 5 benchmarks select their fixture; the local critic passes all of them; duration is 3.6–4.4 min.
- **Remote pipeline with a scripted mock model:**
  - the diversity re-generation triggered;
  - malformed JSON was recovered;
  - the critic's "rewrite: architect" re-ran the architect, characters, guidance and writer stages;
  - the fingerprint was scrubbed of the name token;
  - a provider failure was caught.
- **Production bundle served under `/lumetta/` (GitHub-Pages-like 404 server):**
  - Clean load with no API key: the landing page renders.
  - Damaged localStorage and IndexedDB records: no crash; the valid V1 story still shows.
  - Story creation: the crocodile benchmark works; „sami“ becomes „Sami“.
  - Playback, pause, save and library all work.
  - Refreshing on `#/story/<id>`: no blank page.
  - `VITE_DEMO_MODE=false` without an API: demo fallback works.
  - A broken engine API: the friendly error with a retry button appears, with no uncaught exception.
  - No 404s for any asset.

Not possible here: `npm install`, `vite build` and a type check of the React `.tsx` files. No package registry was reachable, so these must be run in your environment or CI.
