import type { CSSProperties } from 'react';

/** Stagger index for the `.enter` entrance animation. */
export const stagger = (n: number) => ({ '--d': n }) as CSSProperties;
