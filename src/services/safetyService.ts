import safety from '../config/safety.json';
import supportResources from '../config/supportResources.json';
import { normalize } from '../utils/text';
import { APP_CONFIG } from '../config/app';

/**
 * Safety layer for the optional Story Guidance.
 *
 * A story is NOT an adequate response to serious harm. When the parent's own
 * words suggest abuse, self-harm, violence or a situation needing professional
 * help, the guidance text is not turned into a story. Instead the parent is
 * gently shown where to find real support. The same screen runs again on the
 * server (defence in depth) before anything reaches a provider.
 */
export type SafetyLevel = 'ok' | 'support';

const TERMS: string[] = Object.entries(safety.support)
  .filter(([key]) => !key.startsWith('$'))
  .flatMap(([, list]) => list as string[])
  .map(normalize);

const PATTERN = TERMS.length
  ? new RegExp(`(^|[^a-z0-9])(${TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'i')
  : null;

export function screenText(text: string | undefined): SafetyLevel {
  if (!text || !PATTERN) return 'ok';
  return PATTERN.test(normalize(text)) ? 'support' : 'ok';
}

export interface SupportResource {
  id: string;
  phone: string | null;
}

export function getSupportResources(region: string = APP_CONFIG.supportRegion): SupportResource[] {
  const regions = supportResources.regions as Record<string, SupportResource[]>;
  return regions[region] ?? regions.default;
}
