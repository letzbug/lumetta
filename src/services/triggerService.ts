import type { Story } from '../types/story';

/**
 * FUTURE – physical objects (NFC / RFID / QR / Bluetooth).
 * Not implemented in the prototype; this module defines the contract.
 *
 * A physical figure or card stores a stable reference. Scanning it opens
 *   <app-url>/#/story/<storyId>
 * or resolves a hardware tag id through `externalTriggerId`.
 * Story ids are UUIDs and never change, so a reference stays valid.
 */
export function storyDeepLink(story: Pick<Story, 'id'>, origin = window.location.origin + window.location.pathname): string {
  return `${origin}#/story/${story.id}`;
}

export function findByTrigger(stories: Story[], triggerId: string): Story | undefined {
  return stories.find((s) => s.externalTriggerId === triggerId || s.id === triggerId);
}
