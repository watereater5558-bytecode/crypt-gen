'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../../lib/utils/clipboard';

interface SecretFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  revealedByDefault?: boolean;
}

export function SecretField({ label, value, placeholder, revealedByDefault = false }: SecretFieldProps) {
  const [revealed, setRevealed] = useState(revealedByDefault);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    const succeeded = await copyToClipboard(value);
    if (succeeded) setCopied(true);
  }

  const hasValue = value.length > 0;

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-eyebrow text-ivory-muted">{label}</span>
        {hasValue ? (
          <span className="text-[11px] tabular-nums text-ivory-faint">{value.length} chars</span>
        ) : null}
      </div>
      <div className="flex items-stretch gap-2">
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-lg border border-line bg-ink-soft">
          <div
            className={`overflow-x-auto whitespace-nowrap px-3 py-2.5 font-mono text-sm text-ivory transition-[filter] duration-150 ${
              hasValue && !revealed ? 'blur-md select-none' : 'blur-none'
            }`}
          >
            {hasValue ? value : <span className="text-ivory-faint">{placeholder ?? 'Nothing generated yet'}</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setRevealed((current) => !current)}
          disabled={!hasValue}
          aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`}
          className="flex w-10 flex-none items-center justify-center rounded-lg border border-line bg-panel text-ivory-muted transition-colors hover:border-brass-400/60 hover:text-brass-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ivory-muted"
        >
          {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!hasValue}
          aria-label={`Copy ${label}`}
          className="flex w-10 flex-none items-center justify-center rounded-lg border border-line bg-panel text-ivory-muted transition-colors hover:border-brass-400/60 hover:text-brass-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ivory-muted"
        >
          {copied ? <Check size={16} className="text-signal-green" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}
