# Lumetta – personalised stories for children (prototype)

> *The child's interest is the doorway.*
> A parent describes what their child loves. Lumetta turns it into a short illustrated story of about 3–4 minutes, read aloud, saved on the device and ready to be told again.

"Lumetta" is a working title.

---

## Quick start

Requirements: **Node.js 20.19 or newer** (Node 22 recommended).

```bash
npm install
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).
It also works on phones and tablets in the same network: use the "Network" address Vite prints.

The app starts in **demo mode**. It needs no API keys, makes no external calls and costs nothing.
Stories, cover illustrations and narration are all created on the device.

### Production build

```bash
npm run build      # builds the app into dist/
npm run start      # serves dist/ and the API on http://localhost:8080
```

### Type check

```bash
npm run typecheck
```

---

## The tested demo scenario

The app language follows the browser (German, French or English). You can change it under Settings.

1. **Landing** → *Geschichte erschaffen*.
2. **Child:** age **7**, name **Leo**, *ein Junge*.
3. **Interests:** *Dinosaurier*, *Weltall*, *Abenteuer*, plus the free text “Raumschiffe”.
4. **Story kind:** *Abenteuer*.
5. **Story guidance:** *Mit anderen Kindern sprechen*.
6. **Create the story.**

The light thinks while the story comes together, then the story opens: **“Leo, Tiko und die Pusteblumen-Station”** (about 4 minutes).

A shy baby dinosaur on a dandelion-shaped space station wants to join the moon-hoppers but cannot find the words. The two of them watch first. Then they bring a small gift that fills a gap in the marble run, and finally say a first quiet word. There is no lecture and no diagnosis.

From the player you can play, pause, resume, restart, seek, save, favourite and go back. The story then appears in **Unsere Geschichten** and opens again after a reload.

**About narration in demo mode:** the device voice is used as a fallback.
- Chrome, Edge and Safari on desktop, iOS and Android usually provide German, French and English voices.
- If a device has no suitable voice, the player switches to a silent **read-along mode**. The text then moves along on its own.

---

## Story Engine V2

Story generation runs through a staged pipeline:

`Interpreter → Imagination → Selector → Architect → Characters → Guidance → Writer → Critic → targeted rewrite → Fingerprint`

- All stage prompts are in `src/services/storyEngine/prompts.ts`.
- Every request takes the same V2 path (PLAN → WRITE → REVIEW, about 3 model calls).
- Without a story provider, Lumetta honestly offers labelled example stories instead of a template.
- Regression tests: `npm run test:engine`.
- Details: [STORY_ENGINE_V2.md](STORY_ENGINE_V2.md).

## Architecture

```
src/
  config/              ← everything specialists or operators change, no code involved
    guidance/principles.json   central Story Guidance principles and themes (versioned)
    ageProfiles.json           vocabulary, sentence length, emotional depth, pacing per age band
    safety.json                screening terms for situations that need real help
    supportResources.json      helplines shown in that case (verify locally!)
    languages.ts               language registry (Luxembourgish prepared, disabled)
    voices.ts                  storyteller voices
    app.ts                     demo mode and app settings
  locales/             de.json, fr.json, en.json, lb.json (ALL interface text)
  services/
    storyService.ts    single entry point for story creation (demo ↔ remote)
    imageService.ts    cover illustrations (demo SVG ↔ remote image API)
    tts/               narration: studio audio, device voice, read-along engines
    storageService.ts  StoryRepository interface (IndexedDB now, EU backend later)
    safetyService.ts   screening of parent-entered text
    triggerService.ts  contract for future physical objects (NFC/RFID/QR/BLE)
    demo/              on-device story engine, language packs, cover painter
  components/          LightCompanion, StoryCover, AppChrome, DuskScene, Icon, Toast
  pages/               Landing, Create (4 steps), Creating, Player, Library, Settings
  store/               app state (React context) and the tiny hash router
  hooks/               narration and motion preference
  styles/              tokens, base, components, companion, pages
server/                framework-free Node API (keys never reach the browser)
public/                PWA manifest, icons, service worker
```

### Two layers for story generation

- **Layer 1 – imagination engine.** Interests become the world, the story kind sets mood, opening and ending, and age sets length and depth.
- **Layer 2 – Story Guidance (optional).** The theme is carried through a supporting character, metaphor and a small, realistic success. It sits underneath the adventure and never on top of it.

The principles, techniques and forbidden phrasing live in `src/config/guidance/principles.json`.
- Both the demo engine and the server-side prompt read this file.
- Specialists can change the guidance **without touching code**.
- Bump `version` on every change; the version is shown under Settings → About.

### Safety

Free text from parents is screened in the browser **and again on the server**. The screen looks for signs of abuse, self-harm, violence or other situations that need professional help.

If something is detected, no story is created from that text. The parent instead sees a calm notice with support contacts, with two choices:
- edit the text, or
- create a story without it.

On the server, generated text is also checked against the forbidden phrasing list, and the story is regenerated once if needed.

> ⚠️ Before any public use, specialists must review the term lists in `safety.json` and the contacts in `supportResources.json`.

### Privacy by design

- No account. Only an age is needed; the first name is optional. There is no field for surname, birthday, school, address or photo.
- Stories are stored **only on the device** (IndexedDB). The `StoryRepository` interface is the seam for a later EU-hosted backend (e.g. Supabase in an EU region).
- Before story wishes leave the device, the first name is replaced by the token `{{HERO}}` (`storyService.pseudonymize`). The real name is restored on the device afterwards.
- Image prompts never contain the name. Covers never depict the child.
- The parent's own guidance text is used for one request and is never stored. A saved story only records *that* custom guidance was used.
- The server logs no request bodies and keeps nothing.
- **Exception:** a connected narration service necessarily receives the finished story text, including the name, so it can read it aloud. Choose a provider with a data processing agreement and no data retention.

---

## Connecting real providers

All secrets go into `.env`, which is read **only by the server layer**. Nothing secret is bundled into the browser.

```bash
cp .env.example .env
```

| What | Variable | Supported values |
|---|---|---|
| Leave demo mode | `VITE_DEMO_MODE=false` | |
| Story text | `STORY_PROVIDER` | `mistral` (EU-based), `openai`, `anthropic` |
| Cover image | `IMAGE_PROVIDER` | `openai` |
| Narration | `TTS_PROVIDER` | `openai`, `elevenlabs` |
| Keys | `MISTRAL_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY` | |
| Models | `STORY_MODEL`, `IMAGE_MODEL`, `TTS_MODEL` | Optional. Defaults are in the provider files. Model names change often, so set them explicitly. |
| Voices | `TTS_VOICE_WARM_FEMALE`, `TTS_VOICE_WARM_MALE`, `TTS_VOICE_NEUTRAL` | Provider voice ids |

Restart `npm run dev` after changing `.env`.

- `GET /api/health` shows which capabilities are active. It never shows keys.
- Each capability falls back to the demo on its own. For example, you can have real stories with demo covers.

**Where the code lives:**
- `server/providers/story.mjs`, `image.mjs` and `tts.mjs` contain the providers. Add a new provider there and list it in `server/config.mjs → capabilities()`.
- `server/prompt.mjs` builds the story prompt from the configuration files.
- `server/api.mjs` contains the endpoints, input validation, safety screening and a simple rate limit that protects your budget.

### Hosting in the EU

`npm run start` runs on any Node host.
- For a GDPR-first setup, choose an EU region (for example Scaleway, OVHcloud, Hetzner, or AWS/GCP/Azure EU regions) and EU or no-retention AI providers.
- The app itself is static and can also be served from a CDN, with the API deployed separately. Set `VITE_API_BASE` to point the app at it.

---

## Languages

- The interface and stories are available in German, French and English.
- All interface text lives in `src/locales/*.json`; no component contains hard-coded copy.
- The story language is chosen per story and can differ from the interface language.

**Luxembourgish (`lb`) is prepared throughout:** type, locale file, language registry, story language and voice mapping.
- It is shown as “Lëtzebuergesch — coming soon”.
- To enable it:
  1. Translate `src/locales/lb.json` (missing keys fall back to German).
  2. Connect a narration provider with a natural lb-LU voice.
  3. Set `uiEnabled` and `storyEnabled` in `src/config/languages.ts`.
- The device voice is deliberately **not** allowed for Luxembourgish (`browserTtsAllowed: false`).

---

## Accessibility and motion

- Large touch targets, strong contrast and visible keyboard focus.
- Real radio groups with arrow-key navigation, screen reader labels and focus moved to each new step.
- Typography: *Atkinson Hyperlegible* (designed for low-vision readers) for the interface, *Literata* (a reading face) for stories.
- **Movement** under Settings: *Like my device* follows `prefers-reduced-motion`. *Calm* keeps soft fades and the glow of the light, without floating or travelling.
- Story covers morph between library and player via the View Transitions API where the browser supports it.

## The light companion

`src/components/LightCompanion.tsx` has seven states: idle, listening, thinking, ready, speaking, paused and success.
- Each state's traits (orbiting particles, sparkle, glints, glow) are defined in `COMPANION_STATES`.
- While narrating, the light reacts to the voice through a level signal; this updates CSS directly without re-rendering.
- New states or personality traits can be added in one place.

## PWA and offline

- Manifest, icons and theme colour are included. Install via the browser's "Add to Home Screen".
- In production builds the service worker caches the app shell, so saved stories (in IndexedDB) open offline.
- The icons are placeholders.

## Prepared for later

- **Physical objects:** every story has a stable UUID and an `externalTriggerId` field. The deep link `#/story/<id>` opens it directly (see `services/triggerService.ts`).
- **Professional / educator mode:** guidance themes are data with `version`, `status` and `reviewedBy` fields. Curated profiles from specialists can later be loaded as additional theme sets without changing the UI.

## Known limits of the prototype

- Demo stories come from a template engine: 3 worlds × 3 companions × 5 story arcs × 6 moods, adapted by age, in 3 languages. A connected story provider writes completely free stories.
- Device voices differ a lot between systems. Professional narration needs `TTS_PROVIDER`.
- Read-along highlighting with studio audio is aligned proportionally. Providers that return word timestamps can make it exact later.
