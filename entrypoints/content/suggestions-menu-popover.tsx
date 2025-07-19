import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from 'lucide-react'

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

export function SuggestionsMenu() {
  return (
    <Command
      className={`
        rounded-lg border shadow-md
        md:min-w-[450px]
      `}
    >
      <CommandInput placeholder="Type a command or search..." />
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
  )
}
