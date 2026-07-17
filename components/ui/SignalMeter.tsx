import type { StrengthRating } from '../../lib/crypto/entropy';

interface SignalMeterProps {
  rating: StrengthRating;
  barCount?: number;
}

export function SignalMeter({ rating, barCount = 32 }: SignalMeterProps) {
  const litBars = Math.round(rating.fillRatio * barCount);
  const heightClasses = ['h-[35%]', 'h-[48%]', 'h-[61%]', 'h-[74%]', 'h-[87%]'];

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] font-medium uppercase tracking-eyebrow text-ivory-muted">Entropy</span>
        <span className="font-mono text-xs text-ivory-muted">
          <span className="text-ivory">{rating.bits.toFixed(1)}</span> bits · {rating.label}
        </span>
      </div>
      <div className="flex h-8 items-end gap-[3px]">
        {Array.from({ length: barCount }).map((_, index) => {
          const lit = index < litBars;
          return (
            <span
              key={index}
              className={`flex-1 rounded-sm transition-colors duration-200 ${heightClasses[index % heightClasses.length]} ${
                lit ? rating.colorClass : 'bg-line-soft'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
