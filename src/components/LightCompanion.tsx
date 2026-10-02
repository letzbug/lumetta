import { useEffect, useRef, type CSSProperties } from 'react';
import { useI18n } from '../i18n/i18n';

/**
 * The story companion – a small, warm, living light.
 *
 * It is deliberately not a person, animal or robot. Personality comes from
 * light, rhythm and two barely-there glints. Each state is defined in
 * COMPANION_STATES so behaviour can grow later (new states, moods, reactions
 * to the child) without touching the pages that use it.
 */
export type CompanionState = 'idle' | 'listening' | 'thinking' | 'ready' | 'speaking' | 'paused' | 'success';

export interface CompanionTraits {
  /** particles orbiting the light */
  orbit: number;
  /** a one-off sparkle when entering the state */
  burst: boolean;
  /** how open the glints are: 1 = open, 0 = closed */
  glints: number;
  /** base glow multiplier */
  glow: number;
}

export const COMPANION_STATES: Record<CompanionState, CompanionTraits> = {
  idle: { orbit: 0, burst: false, glints: 1, glow: 1 },
  listening: { orbit: 0, burst: false, glints: 1, glow: 1.1 },
  thinking: { orbit: 6, burst: false, glints: 0.6, glow: 1.15 },
  ready: { orbit: 0, burst: true, glints: 1, glow: 1.3 },
  speaking: { orbit: 0, burst: false, glints: 0.8, glow: 1.1 },
  paused: { orbit: 0, burst: false, glints: 0.3, glow: 0.8 },
  success: { orbit: 0, burst: true, glints: 1, glow: 1.25 },
};

interface Props {
  state: CompanionState;
  size?: number;
  /** -1..1 – where the light is "looking" */
  gaze?: { x: number; y: number };
  /** subscribe to a 0..1 level (e.g. narration loudness); updates CSS directly, no re-render */
  levelSource?: (listener: (level: number) => void) => () => void;
  className?: string;
  decorative?: boolean;
}

export function LightCompanion({ state, size = 120, gaze, levelSource, className, decorative }: Props) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const traits = COMPANION_STATES[state];

  useEffect(() => {
    if (!levelSource) return;
    let smoothed = 0;
    return levelSource((level) => {
      smoothed += (level - smoothed) * 0.25;
      ref.current?.style.setProperty('--level', smoothed.toFixed(3));
    });
  }, [levelSource]);

  useEffect(() => {
    if (state !== 'speaking') ref.current?.style.setProperty('--level', '0');
  }, [state]);

  const style = {
    '--size': `${size}px`,
    '--gx': (gaze?.x ?? 0).toFixed(2),
    '--gy': (gaze?.y ?? 0).toFixed(2),
    '--glints': traits.glints,
    '--glow': traits.glow,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={`companion ${className ?? ''}`}
      data-state={state}
      style={style}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : t('a11y.companion')}
      aria-hidden={decorative ? true : undefined}
    >
      <div className="companion__float">
        <div className="companion__halo" />
        <div className="companion__glow" />
        <div className="companion__core">
          <span className="companion__glint companion__glint--l" />
          <span className="companion__glint companion__glint--r" />
        </div>
        {traits.orbit > 0 && (
          <div className="companion__orbit">
            {Array.from({ length: traits.orbit }, (_, i) => (
              <span key={i} style={{ '--i': i, '--n': traits.orbit } as CSSProperties} />
            ))}
          </div>
        )}
        {traits.burst && (
          <div className="companion__burst" key={state}>
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} style={{ '--i': i } as CSSProperties} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
