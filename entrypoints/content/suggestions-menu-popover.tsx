// oxlint-disable jsx-no-new-function-as-prop explanation: this component doesn't need to be optimized for re-render performance
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

const handleNavKeys = (e: React.KeyboardEvent) => {
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
  unmountUi,
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
  unmountUi: () => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const commandListRef = useRef<HTMLInputElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)
  const [suggestedWords, setSuggestedWords] = useState<readonly string[]>([])

  const handleControlKeys = (e: React.KeyboardEvent) => {
    // prevent leakage of control keys to the document
    if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'k' || e.key === 'j') {
      e.preventDefault()
      e.stopPropagation()
    }
    // unmount the component when the user presses enter or escape
    if (e.key === 'Enter' || e.key === 'Escape') {
      unmountUi();
      wordUnderCursor.element?.focus()
    }
  }

  useEffect(() => {
    void ScriptRuntime.runPromise(
      Effect.request(new GetSuggestions({ word: wordUnderCursor.word }), GetSuggestionsResolver),
    ).then((suggestions) => {
      setSuggestedWords(suggestions.words)
    }).catch((error) => {
      console.error('error fetching suggestions', error)
    })
  }, [wordUnderCursor.word])

  // Adjust the rendering position to avoid going off the screen before mounting the component
  useLayoutEffect(() => {
    if (!menuRef.current)
      return

    const rect = menuRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Calculate line height offset to position popup below the text
    let lineHeightOffset = 20 // default fallback
    if (wordUnderCursor.element) {
      const computedStyle = window.getComputedStyle(wordUnderCursor.element)
      const lineHeight = computedStyle.lineHeight
      if (lineHeight === 'normal') {
        // If line-height is 'normal', estimate based on font size
        const fontSize = Number.parseFloat(computedStyle.fontSize)
        lineHeightOffset = fontSize * 1.2 // typical line-height multiplier (may be imprecise)
      }
      else {
        // If line-height is not 'normal', use the computed style
        lineHeightOffset = Number.parseFloat(lineHeight)
      }
    }

    // Convert position to viewport coordinates for bounds checking
    const viewportX = position.x - window.scrollX
    const viewportY = position.y - window.scrollY

    let newX = position.x
    let newY = position.y + lineHeightOffset

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
  }, [position, wordUnderCursor.word, wordUnderCursor.element])

  // Autofocus when the component mounts
  useEffect(() => {
    if (commandListRef.current) {
      commandListRef.current.focus()
    }
  }, [])

  // Handle clicks outside the component to unmount
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof Node
        && menuRef.current
        && !menuRef.current.contains(event.target)) {
        unmountUi()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [unmountUi])

  const handleSuggestionSelection = (selectedWord: string) => {
    if (!wordUnderCursor.element || !wordUnderCursor.range) {
      return
    }

    const element = wordUnderCursor.element
    const { start, end } = wordUnderCursor.range

    // Replace the text at the specified range
    const currentValue = element.value
    const newValue = currentValue.slice(0, start) + selectedWord + currentValue.slice(end)
    element.value = newValue

    // Set cursor position after the replaced word
    const newCursorPosition = start + selectedWord.length
    element.setSelectionRange(newCursorPosition, newCursorPosition)

    // Focus back to the original element
    element.focus()

    // Trigger input event to notify any listeners of the value change
    element.dispatchEvent(new Event('input', { bubbles: true }))
  }

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
      onKeyDown={handleControlKeys}
    >
      <Command
        className={`
          rounded-lg border shadow-md
          md:min-w-[450px]
        `}
        onKeyDown={handleNavKeys}
      >
        <CommandList
          ref={commandListRef}
        >
          <CommandGroup heading="Suggestions">
            <CommandEmpty>{`No results found for ${wordUnderCursor.word}.`}</CommandEmpty>
            {suggestedWords.map((word) => (
              <CommandItem key={word} onSelect={() => handleSuggestionSelection(word)}>
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
