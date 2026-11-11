import React from 'react';

export type TagTone = 'new' | 'paused' | 'risk' | 'beta' | 'hot' | 'soon';

interface TagProps {
  tone?: TagTone | string;
  size?: 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Tag: React.FC<TagProps> = ({
  tone,
  size,
  icon,
  children,
  className = '',
  style,
}) => {
  return (
    <span
      className={`ph-tag ph-cut-xs ${tone ? `ph-tag--${tone}` : ''} ${
        size === 'lg' ? 'ph-tag--lg' : ''
      } ${className}`}
      style={style}
    >
      {icon}
      {children}
    </span>
  );
};
