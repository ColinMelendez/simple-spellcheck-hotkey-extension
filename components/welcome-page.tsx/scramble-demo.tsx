import { useEffect, useRef } from 'react';
import { useSettingsStorage } from '@/hooks/use-settings-storage';
import { applyOverlayToSelection, clearOverlays } from '@/lib/utils/active-selection-scramble';

export const ScrambleDemo = () => {
  const textElementRef = useRef<HTMLParagraphElement | null>(null);
  const { settings } = useSettingsStorage();

  useEffect(() => {
    if (textElementRef.current) {
      const controller = new AbortController();

      document.addEventListener('selectionchange', () => {
        requestAnimationFrame(applyOverlayToSelection(settings));
      }, {
        passive: true,
        signal: controller.signal,
      });

      // apply the overlay immediately in case a selection was already active when the component mounted.
      applyOverlayToSelection(settings)();

      // remove the event listener and clear any overlays when the component unmounts.
      return () => {
        controller.abort();
        clearOverlays();
      }
    }
  }, [settings]);

  return (
    <div
      className="flex max-w-2xl flex-col items-center justify-center align-middle"
    >
      <p ref={textElementRef} className="text-lg">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
    </div>
  )
}
