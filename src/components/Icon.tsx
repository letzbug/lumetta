import type { SVGProps } from 'react';

const PATHS = {
  play: <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="6.5" y="5" width="4" height="14" rx="1.6" fill="currentColor" stroke="none" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  restart: <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.7h3.7" />,
  heart: <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10C19.5 15.6 12 20 12 20Z" />,
  heartFilled: <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10C19.5 15.6 12 20 12 20Z" fill="currentColor" />,
  save: <path d="M6.5 4.5h11v15l-5.5-3.6-5.5 3.6v-15Z" />,
  saved: <path d="M6.5 4.5h11v15l-5.5-3.6-5.5 3.6v-15Z" fill="currentColor" />,
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  library: (
    <>
      <path d="M5 4.5h4v15H5zM10.5 4.5h4v15h-4z" />
      <path d="m16 6 3.6-1 3 13.8-3.6 1z" transform="translate(-2.2 0)" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
    </>
  ),
  home: <path d="M4.5 11 12 4.5l7.5 6.5v8.5h-5v-5h-5v5h-5V11Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5.5 12.5 4 4 9-9" />,
  trash: <path d="M5 7h14M9.5 7V5h5v2M7 7l1 12.5h8L17 7M10.5 10.5v6M13.5 10.5v6" />,
  text: <path d="M5 6.5h14M5 11h14M5 15.5h9" />,
  speaker: <path d="M5 9.5h3l4.5-4v13L8 14.5H5v-5ZM16 9a4.5 4.5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />,
  sparkle: <path d="M12 3.5c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.6 5.9-2.2 6.5-6.5ZM18.5 15.5c.3 1.7.9 2.3 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.2 2.2-.8 2.5-2.5Z" />,
  lock: <path d="M7 10.5V8a5 5 0 0 1 10 0v2.5M5.5 10.5h13v9h-13z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8v4.5l3 1.8" />
    </>
  ),
  device: (
    <>
      <rect x="7" y="3.5" width="10" height="17" rx="2.5" />
      <path d="M11 17.5h2" />
    </>
  ),
  phone: <path d="M8 4.5h-2.5A1.5 1.5 0 0 0 4 6.2C4.6 13.6 10.4 19.4 17.8 20a1.5 1.5 0 0 0 1.7-1.5V16l-3.8-1.5-1.9 1.9a10.6 10.6 0 0 1-5.2-5.2L10.5 9.3 9 5.5" />,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
