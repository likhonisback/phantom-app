import React from 'react';

interface StatusPillProps {
  tone?: 'ok' | 'warn' | 'bad';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const StatusPill: React.FC<StatusPillProps> = ({ tone, children, className = '', style }) => {
  return (
    <span
      className={`ph-status ph-cut-xs ${tone ? `ph-status--${tone}` : ''} ${className}`}
      role="status"
      style={style}
    >
      {children}
    </span>
  );
};
