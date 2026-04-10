import { useEffect } from 'react';

/**
 * Locks the document body scroll while the component that calls this hook is
 * mounted.  This prevents the background page from scrolling on iOS Safari
 * when a modal overlay is open.
 *
 * The original `overflow` value is restored when the hook cleans up.
 */
export function useBodyScrollLock(): void {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);
}
