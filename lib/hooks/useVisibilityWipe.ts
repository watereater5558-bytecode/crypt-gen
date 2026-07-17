'use client';

import { useEffect, useRef } from 'react';

export function useVisibilityWipe(wipe: () => void): void {
  const wipeRef = useRef(wipe);
  wipeRef.current = wipe;

  useEffect(() => {
    function handleVisibilityChange(): void {
      if (document.hidden) {
        wipeRef.current();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
