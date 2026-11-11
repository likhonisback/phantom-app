import React from 'react';

export type IconName =
  | 'home'
  | 'features'
  | 'manage'
  | 'globe'
  | 'back'
  | 'chevron'
  | 'close'
  | 'check'
  | 'copy'
  | 'plus'
  | 'refresh'
  | 'lock'
  | 'external'
  | 'logout'
  | 'phone'
  | 'play'
  | 'alert'
  | 'bell';

const iconPaths: Record<IconName, string> = {
  home: '<path d="M4 10 12 3.5 20 10v10h-5.5v-5.5h-5V20H4z" stroke-linejoin="miter"/>',
  features: '<path d="M5 6.5h14l3 3v5l-3 3H5l-3-3v-5z"/><rect x="13" y="9.5" width="5" height="5" fill="currentColor" stroke="none"/>',
  manage: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9M12 3c-2.5 2.6-3.8 5.6-3.8 9s1.3 6.4 3.8 9"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  copy: '<rect x="8" y="8" width="12" height="12"/><path d="M16 8V4H4v12h4"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v5h-5"/>',
  lock: '<rect x="5" y="11" width="14" height="9"/><path d="M8 11V7h8v4"/>',
  external: '<path d="M7 17 17 7M9 7h8v8"/>',
  logout: '<path d="M15 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>',
  phone: '<rect x="7" y="3" width="10" height="18"/><path d="M11 18h2"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none"/>',
  alert: '<path d="M12 4v10M12 18v2"/>',
  bell: '<path d="M6 16V10a6 6 0 0 1 12 0v6l2 3H4zM9.5 19a2.5 2.5 0 0 0 5 0"/>',
};

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  flip?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  strokeWidth = 2.2,
  flip = false,
  className = '',
  style,
}) => {
  const path = iconPaths[name] || '';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      className={`${flip ? 'ph-flip ' : ''}${className}`}
      aria-hidden="true"
      style={style}
      dangerouslySetInnerHTML={{ __html: path }}
    />
  );
};
