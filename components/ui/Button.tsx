import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-brass-400 text-ink hover:bg-brass-200 shadow-seal',
  secondary: 'border border-line bg-panel text-ivory hover:border-brass-400/50 hover:text-brass-400',
  ghost: 'text-ivory-muted hover:text-ivory'
};

export function Button({ children, variant = 'primary', icon, className = '', ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
