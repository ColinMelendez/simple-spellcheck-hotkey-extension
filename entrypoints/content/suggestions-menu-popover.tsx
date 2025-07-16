import type { Hotkey } from 'react-hotkeys-hook/packages/react-hotkeys-hook/dist/types';
import { useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/primitives/popover';

const getCursorPosition = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Use the start of the range for positioning
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
  };
};

export const SuggestionsMenuPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerPosition, setTriggerPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleHotkey = (_e: KeyboardEvent, _handler: Hotkey) => {
    const position = getCursorPosition();
    console.log('position', position);
    if (position) {
      setTriggerPosition(position);
      setIsOpen(true);
    }
  };

  useHotkeys('ctrl+h', handleHotkey, {
    preventDefault: true,
    enableOnFormTags: true,
  });

  const style = useMemo(() => ({
    position: 'absolute',
    left: `${triggerPosition.x}px`,
    top: `${triggerPosition.y}px`,
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 9999,
  } satisfies React.CSSProperties), [triggerPosition]);

  return (
    <div className="size-48 bg-red-500">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          ref={triggerRef}
          style={style}
        >
          {/* Hidden trigger */}
        </PopoverTrigger>
        <PopoverContent side="top" align="start">
          <div>
            <h1>Suggestions</h1>
            <p>Positioned at cursor location</p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
