import React from 'react';

export const Spinner: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({
  size = 16,
  className = '',
  style,
}) => {
  return (
    <span
      className={`ph-spinner ${className}`}
      style={{
        '--s': `${size}px`,
        ...style,
      } as React.CSSProperties}
      aria-hidden="true"
    />
  );
};
