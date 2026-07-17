interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-line bg-ink-soft px-3 py-2.5 text-left transition-colors hover:border-brass-400/40"
    >
      <span className="text-sm text-ivory">{label}</span>
      <span
        className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors ${
          checked ? 'bg-brass-400' : 'bg-line'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-ink transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  );
}
