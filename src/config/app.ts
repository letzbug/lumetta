/**
 * Application configuration.
 *
 * DEMO MODE
 *  - VITE_DEMO_MODE=true  → always demo (default; no external calls, no costs)
 *  - VITE_DEMO_MODE=false → the app asks the server (/api/health) which providers
 *    are configured. Missing providers fall back to the demo for that capability.
 *
 * Secrets NEVER live here. Provider keys are read by the server layer only.
 */
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const APP_CONFIG = {
  name: 'Lumetta',
  version: '0.1.0',
  demoModeForced: String(env.VITE_DEMO_MODE ?? 'true').toLowerCase() !== 'false',
  apiBase: env.VITE_API_BASE ?? '/api',
  /** Region used for support resources (see config/supportResources.json). */
  supportRegion: 'LU',
  ages: { min: 3, max: 12 },
  /** Rough pacing of the demo generation, so the moment can breathe. */
  demoStageMs: 1500,
  storage: { dbName: 'lumetta', dbVersion: 1, settingsKey: 'lumetta.settings.v1' },
} as const;
