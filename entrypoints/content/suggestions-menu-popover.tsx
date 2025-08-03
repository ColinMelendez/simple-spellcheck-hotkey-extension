import * as Effect from 'effect/Effect'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/primitives/command'
import { GetSuggestions, GetSuggestionsResolver } from '@/lib/domain/messaging'
import { ScriptRuntime } from '@/lib/runtimes/script-runtime'

const preventControlPropagation = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'k' || e.key === 'j') {
    e.preventDefault()
    e.stopPropagation()
  }
}

const handleNavControls = (e: React.KeyboardEvent) => {
  // Handle Ctrl+j (move down) and Ctrl+k (move up)
  if (e.ctrlKey && (e.key === 'j' || e.key === 'k')) {
    e.preventDefault()
    e.stopPropagation()
    // Create and dispatch synthetic arrow key events directly to the list
    const syntheticEvent = new KeyboardEvent('keydown', {
      key: e.key === 'j' ? 'ArrowDown' : 'ArrowUp',
      code: e.key === 'j' ? 'ArrowDown' : 'ArrowUp',
      bubbles: true,
      cancelable: true,
    })
    e.currentTarget.dispatchEvent(syntheticEvent)
  }
}

export function SuggestionsMenu({
  wordUnderCursor,
  position,
}: {
  wordUnderCursor: {
    word: string
    element?: HTMLTextAreaElement | HTMLInputElement
    range?: { start: number, end: number }
  }
  position: {
    x: number
    y: number
  }
}) {
  console.log('wordUnderCursor', wordUnderCursor);
  console.log('cursorPosition', position);

  const menuRef = useRef<HTMLDivElement>(null);
  const commandListRef = useRef<HTMLInputElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [suggestedWords, setSuggestedWords] = useState<readonly string[]>([]);

  useEffect(() => {
    console.log('running suggestions fetch');
    void ScriptRuntime.runPromise(
      Effect.request(new GetSuggestions({ word: wordUnderCursor.word }), GetSuggestionsResolver),
    ).then((suggestions) => {
      console.log('suggestions', suggestions);
      setSuggestedWords(suggestions.words);
    }).catch((error) => {
      console.error('error fetching suggestions', error);
    });
  }, [wordUnderCursor.word])

  // Adjust the rendering position to avoid going off the screen before mounting the component
  useLayoutEffect(() => {
    if (!menuRef.current)
      return

    const rect = menuRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Convert position to viewport coordinates for bounds checking
    const viewportX = position.x - window.scrollX
    const viewportY = position.y - window.scrollY

    let newX = position.x
    let newY = position.y

    // Check if menu would go off the right edge of the viewport
    if (viewportX + rect.width > viewportWidth) {
      newX = position.x - rect.width
    }

    // Check if menu would go off the bottom edge of the viewport
    if (viewportY + rect.height > viewportHeight) {
      newY = position.y - rect.height
    }

    // Ensure we don't go off the left or top edges after adjustment
    // Convert back to document coordinates for these checks
    const minX = window.scrollX
    const minY = window.scrollY
    newX = Math.max(minX, newX)
    newY = Math.max(minY, newY)

    setAdjustedPosition({ x: newX, y: newY })
  }, [position, wordUnderCursor.word])

  // Autofocus when the component mounts
  useEffect(() => {
    if (commandListRef.current) {
      commandListRef.current.focus()
    }
  }, [])

  const handleSuggestionSelect = (selectedWord: string) => {
    if (!wordUnderCursor.element || !wordUnderCursor.range) {
      return;
    }

    const element = wordUnderCursor.element;
    const { start, end } = wordUnderCursor.range;

    // Replace the text at the specified range
    const currentValue = element.value;
    const newValue = currentValue.slice(0, start) + selectedWord + currentValue.slice(end);
    element.value = newValue;

    // Set cursor position after the replaced word
    const newCursorPosition = start + selectedWord.length;
    element.setSelectionRange(newCursorPosition, newCursorPosition);

    // Focus back to the original element
    element.focus();

    // Trigger input event to notify any listeners of the value change
    element.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const positioningStyle = useMemo(() => {
    return {
      position: 'absolute',
      left: `${adjustedPosition.x}px`,
      top: `${adjustedPosition.y}px`,
      zIndex: 10000,
    } as const
  }, [adjustedPosition])

  return (
    <div
      ref={menuRef}
      style={positioningStyle}
      onKeyDown={preventControlPropagation}
    >
      <Command
        className={`
          rounded-lg border shadow-md
          md:min-w-[450px]
        `}
        onKeyDown={handleNavControls}
      >
        <CommandList
          ref={commandListRef}
        >
          <CommandGroup heading="Suggestions">
            <CommandEmpty>No results found.</CommandEmpty>
            {suggestedWords.map((word) => (
              <CommandItem key={word} onSelect={() => handleSuggestionSelect(word)}>
                <span>{word}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </Command>
    </div>
  )
}
