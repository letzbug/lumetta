import { useEffect, useState } from 'react';
import type { MotionPreference } from '../store/AppStore';

/** Resolves the motion preference and mirrors it on <html data-motion="…">. */
export function useMotionSetting(pref: MotionPreference) {
  const [systemReduced, setSystemReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setSystemReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const reduced = pref === 'reduced' || (pref === 'system' && systemReduced);
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
  }, [reduced]);
  return reduced;
}
