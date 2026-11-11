import React from 'react';

interface Option<T> {
  value: T;
  label: string;
}

interface ChipGroupProps<T extends string> {
  options: Option<T>[];
  value: T;
  pending?: T | null;
  onChange: (val: T) => void;
  label?: string;
  className?: string;
}

export function ChipGroup<T extends string>({
  options,
  value,
  pending,
  onChange,
  className = '',
}: ChipGroupProps<T>) {
  return (
    <div className={`ph-chips ${className}`}>
      {options.map((opt) => {
        const isSelected = opt.value === value;
        const isPending = opt.value === pending;
        return (
          <button
            key={opt.value}
            type="button"
            className="ph-chip"
            aria-pressed={isSelected}
            data-pending={isPending ? '' : undefined}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
