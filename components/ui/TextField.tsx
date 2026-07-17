import type { ChangeEvent } from 'react';

interface TextInputProps {
  label: string;
  value: string;
  placeholder?: string;
  monospace?: boolean;
  onChange: (value: string) => void;
}

export function TextField({ label, value, placeholder, monospace = false, onChange }: TextInputProps) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-eyebrow text-ivory-muted">
        {label}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        className={`w-full rounded-lg border border-line bg-ink-soft px-3 py-2.5 text-sm text-ivory placeholder:text-ivory-faint focus:border-brass-400/60 ${
          monospace ? 'font-mono' : ''
        }`}
      />
    </div>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  monospace?: boolean;
  onChange: (value: string) => void;
}

export function TextAreaField({ label, value, placeholder, rows = 4, monospace = false, onChange }: TextAreaProps) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-eyebrow text-ivory-muted">
        {label}
      </label>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
        className={`w-full resize-y rounded-lg border border-line bg-ink-soft px-3 py-2.5 text-sm text-ivory placeholder:text-ivory-faint focus:border-brass-400/60 ${
          monospace ? 'font-mono' : ''
        }`}
      />
    </div>
  );
}
