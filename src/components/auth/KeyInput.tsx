import React, { useRef, useState } from 'react';

interface KeyInputProps {
  value: string;
  onChange: (val: string) => void;
  prefix: string;
  label: string;
  pasteLabel: string;
  error?: string | null;
  errorKey?: string | null;
  onSubmit?: (e: React.FormEvent) => void;
  autoFocus?: boolean;
}

export function formatKey(raw: string, prefix: string): string {
  // Strip prefix if present in raw to avoid doubling
  let clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.startsWith(prefix.toUpperCase())) {
    clean = clean.slice(prefix.length);
  }
  const parts = clean.slice(0, 12).match(/.{1,4}/g) || [];
  return [prefix, ...parts].join('-');
}

export const KeyInput: React.FC<KeyInputProps> = ({
  value,
  onChange,
  prefix,
  label,
  pasteLabel,
  error,
  errorKey,
  autoFocus = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [shaking, setShaking] = useState(false);

  // Trigger shake animation when errorKey changes
  React.useEffect(() => {
    if (errorKey) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 450);
      return () => clearTimeout(timer);
    }
  }, [errorKey]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const formatted = formatKey(text.trim(), prefix);
        onChange(formatted);
        inputRef.current?.focus();
      }
    } catch {
      // Fallback if clipboard permission denied
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatKey(raw, prefix);
    onChange(formatted);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        className="ph-keyinput ph-cut-sm"
        data-error={error ? '' : undefined}
        data-shake={shaking ? '' : undefined}
      >
        <div className="ph-keyinput__inner ph-cut-sm">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={`${prefix}-XXXX-XXXX-XXXX`}
            autoFocus={autoFocus}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck="false"
            aria-label={label}
          />
          <button
            type="button"
            className="ph-keyinput__paste ph-cut-xs"
            onClick={handlePaste}
          >
            {pasteLabel}
          </button>
        </div>
      </div>
      {error && <div className="ph-fielderror">{error}</div>}
    </div>
  );
};
