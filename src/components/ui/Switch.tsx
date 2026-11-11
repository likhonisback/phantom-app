import React from 'react';
import { Spinner } from './Spinner';

interface SwitchProps {
  checked: boolean;
  saving?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  onChange?: (val: boolean) => void;
  label?: string;
  asIndicator?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  saving = false,
  disabled = false,
  size = 'md',
  onChange,
  label,
  asIndicator = false,
  className = '',
}) => {
  const Component = asIndicator ? 'span' : 'button';

  return (
    <Component
      role="switch"
      aria-checked={!!checked}
      aria-label={label}
      aria-busy={saving || undefined}
      className={`ph-switch ph-cut-xs ${size === 'sm' ? 'ph-switch--sm' : ''} ${className}`}
      disabled={asIndicator ? undefined : disabled}
      onClick={asIndicator || saving || disabled ? undefined : () => onChange?.(!checked)}
    >
      <span className="ph-switch__knob">
        {saving && <Spinner size={12} />}
      </span>
    </Component>
  );
};
