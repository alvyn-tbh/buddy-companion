import { useEffect, useRef, type RefObject } from 'react';

export function useScrollToBottom(): [
  RefObject<HTMLDivElement>,
  RefObject<HTMLDivElement>,
] {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver(() => {
        // Add debouncing to prevent excessive scrolling
        requestAnimationFrame(() => {
          end.scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: false, // Only watch for DOM changes, not attribute changes
        characterData: false, // Only watch for DOM changes, not text changes
      });

      return () => observer.disconnect();
    }
  }, []);

  // @ts-expect-error error
  return [containerRef, endRef];
}
