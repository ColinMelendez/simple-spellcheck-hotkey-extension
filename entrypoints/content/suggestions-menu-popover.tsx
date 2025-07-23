import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from 'lucide-react'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/primitives/command'

const checkAndHandleNavKeys = (e: React.KeyboardEvent) => {
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

  const menuRef = useRef<HTMLDivElement>(null)
  const commandInputRef = useRef<HTMLInputElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)

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
  }, [position, wordUnderCursor.word]) // Re-run when position or word changes

  useEffect(() => {
    // Auto-focus the command input when component mounts
    if (commandInputRef.current) {
      commandInputRef.current.focus()
    }
  }, [])

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
    >
      <Command
        className={`
          rounded-lg border shadow-md
          md:min-w-[450px]
        `}
      >
        <CommandInput
          ref={commandInputRef}
          placeholder={`${wordUnderCursor.word}...`}
        />
        <CommandList onKeyDown={checkAndHandleNavKeys}>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Calendar />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <Smile />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem disabled>
              <Calculator />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}
