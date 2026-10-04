# Lumetta beta fix — voices + French covers

- xAI voice mapping: warm-female -> Eve, warm-male -> Altair, neutral/storyteller -> Ara.
- Voice choice restored in Settings and saved for subsequent stories.
- Cloudflare Worker accepts Altair and maps Lumetta's stable voice IDs to xAI voice IDs.
- Remote cover generation is language-independent, reinforces canonical English interest concepts, and retries once before local fallback.
- Existing cue/story safeguards remain unchanged.

Deployment: update GitHub files AND deploy the included CLOUDFLARE_WORKER.js in the existing Worker.
