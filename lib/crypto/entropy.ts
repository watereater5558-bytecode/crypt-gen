export interface StrengthRating {
  bits: number;
  label: string;
  colorClass: string;
  fillRatio: number;
}

export function calculateEntropyBits(poolSize: number, length: number): number {
  if (poolSize <= 1 || length <= 0) return 0;
  return length * Math.log2(poolSize);
}

export function classifyStrength(bits: number): StrengthRating {
  const thresholds: Array<{ min: number; label: string; colorClass: string }> = [
    { min: 100, label: 'Excellent', colorClass: 'bg-signal-green' },
    { min: 80, label: 'Very strong', colorClass: 'bg-signal-green' },
    { min: 60, label: 'Strong', colorClass: 'bg-brass-400' },
    { min: 40, label: 'Fair', colorClass: 'bg-brass-400' },
    { min: 0, label: 'Weak', colorClass: 'bg-signal-red' }
  ];
  const match = thresholds.find((tier) => bits >= tier.min) ?? thresholds[thresholds.length - 1]!;
  const fillRatio = Math.max(0.04, Math.min(1, bits / 128));
  return { bits, label: match.label, colorClass: match.colorClass, fillRatio };
}
