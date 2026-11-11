import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'danger-soft' | 'ghost';
  block?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  block = false,
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  onClick,
  style,
  type = 'button',
}) => {
  const classes = [
    'ph-btn',
    'ph-cut-sm',
    variant !== 'secondary' ? `ph-btn--${variant}` : '',
    block ? 'ph-btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
      style={style}
    >
      {loading ? <Spinner size={18} /> : icon}
      <span>{children}</span>
    </button>
  );
};
