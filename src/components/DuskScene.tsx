/**
 * The companion's world: a paper-cut dusk landscape with lit windows.
 * Layers drift very slowly (CSS); reduced motion keeps them still.
 */
export function DuskScene({ variant = 'full' }: { variant?: 'full' | 'low' }) {
  return (
    <div className={`dusk dusk--${variant}`} aria-hidden="true">
      <div className="dusk__stars" />
      <svg className="dusk__layer dusk__layer--far" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0 260 C 180 180 320 230 480 200 S 820 120 1000 190 S 1300 160 1440 210 V400 H0 Z" />
      </svg>
      <svg className="dusk__layer dusk__layer--mid" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0 300 C 160 250 300 290 460 262 S 760 210 940 268 S 1240 240 1440 280 V400 H0 Z" />
        <g className="dusk__houses">
          <path d="M1040 262 l26 -24 26 24 v30 h-52 Z" />
          <rect x="1058" y="262" width="10" height="12" rx="2" className="dusk__window" />
          <path d="M1108 270 l20 -18 20 18 v24 h-40 Z" />
          <rect x="1122" y="276" width="8" height="10" rx="2" className="dusk__window dusk__window--late" />
          <path d="M300 280 l22 -20 22 20 v26 h-44 Z" />
          <rect x="315" y="286" width="9" height="11" rx="2" className="dusk__window" />
        </g>
      </svg>
      <svg className="dusk__layer dusk__layer--near" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0 340 C 220 300 380 350 620 322 S 1000 300 1180 330 S 1360 320 1440 330 V400 H0 Z" />
      </svg>
    </div>
  );
}
