interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function Slider({ label, min, max, step = 1, value, unit = '', onChange }: SliderProps) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-eyebrow text-ivory-muted">{label}</span>
        <span className="font-mono text-sm tabular-nums text-brass-400">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full cursor-pointer"
      />
    </div>
  );
}
