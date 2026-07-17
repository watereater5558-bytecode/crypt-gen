import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-2xl border border-line bg-panel/80 p-5 backdrop-blur-sm sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: ReactNode;
}

export function CardHeader({ eyebrow, title, description, icon }: CardHeaderProps) {
  return (
    <div className="mb-5 flex items-start gap-3">
      {icon ? (
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-brass-400/30 bg-brass-400/10 text-brass-400">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-eyebrow text-brass-400">{eyebrow}</p>
        <h2 className="font-display text-lg font-semibold text-ivory">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-ivory-muted">{description}</p> : null}
      </div>
    </div>
  );
}
