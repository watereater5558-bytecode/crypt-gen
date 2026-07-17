import { ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-brass-400/30 bg-brass-400/10 text-brass-400">
          <ShieldCheck size={18} />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold leading-none tracking-tight text-ivory">CryptGen</h1>
          <p className="mt-1 text-xs text-ivory-muted">Local cryptographic toolkit</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-brass-400/25 bg-brass-400/[0.06] px-4 py-2">
        <span className="h-1.5 w-1.5 flex-none rounded-full bg-signal-green shadow-[0_0_0_3px_rgba(61,214,140,0.15)]" />
        <p className="text-xs font-medium text-ivory">We do not log generated secrets or keys.</p>
      </div>
    </header>
  );
}
