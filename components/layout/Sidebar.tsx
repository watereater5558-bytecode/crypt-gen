'use client';

import { MODULE_REGISTRY } from './moduleRegistry';
import type { ModuleId } from '../../lib/types';

interface SidebarProps {
  activeModule: ModuleId;
  onSelect: (id: ModuleId) => void;
}

export function Sidebar({ activeModule, onSelect }: SidebarProps) {
  return (
    <>
      <nav className="hidden w-60 flex-none flex-col gap-1 border-r border-line px-3 py-5 sm:flex">
        {MODULE_REGISTRY.map((module) => {
          const Icon = module.icon;
          const isActive = module.id === activeModule;
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => onSelect(module.id)}
              aria-current={isActive}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brass-400/10 text-brass-400 shadow-[inset_0_0_0_1px_rgba(212,162,76,0.3)]'
                  : 'text-ivory-muted hover:bg-panel-raised hover:text-ivory'
              }`}
            >
              <Icon size={17} className="flex-none" />
              <span className="truncate">{module.label}</span>
            </button>
          );
        })}
      </nav>
      <nav className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2.5 sm:hidden">
        {MODULE_REGISTRY.map((module) => {
          const Icon = module.icon;
          const isActive = module.id === activeModule;
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => onSelect(module.id)}
              aria-current={isActive}
              className={`flex flex-none items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isActive ? 'bg-brass-400/10 text-brass-400' : 'text-ivory-muted'
              }`}
            >
              <Icon size={15} />
              {module.shortLabel}
            </button>
          );
        })}
      </nav>
    </>
  );
}
