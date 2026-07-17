interface SegmentedControlProps<T extends string> {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="w-full">
      <span className="mb-2 block text-[11px] font-medium uppercase tracking-eyebrow text-ivory-muted">{label}</span>
      <div className="inline-flex rounded-lg border border-line bg-ink-soft p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              value === option.value ? 'bg-brass-400 text-ink' : 'text-ivory-muted hover:text-ivory'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
