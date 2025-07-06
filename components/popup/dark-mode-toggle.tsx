// oxlint-disable jsx-no-new-function-as-prop
import { Moon, Sun } from 'lucide-react'

import { useCallback } from 'react'
import { Button } from '@/components/ui/primitives/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/primitives/dropdown-menu'
import { useTheme } from '@/components/ui/theme-provider'

export function ModeToggle({ ...props }: React.ComponentProps<typeof Button>) {
  const { setTheme, theme } = useTheme()

  const handleThemeChange = useCallback((theme: 'light' | 'dark' | 'system') =>
    () => setTheme(theme), [setTheme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          {...props}
        >
          <Sun className={`
            size-5 scale-100 rotate-0 transition-all duration-300
            dark:scale-0 dark:-rotate-90
          `}
          />
          <Moon className={`
            absolute size-5 scale-0 rotate-90 transition-all duration-300
            dark:scale-100 dark:rotate-0
          `}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuCheckboxItem
          checked={theme === 'light'}
          onClick={handleThemeChange('light')}
        >
          Light
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === 'dark'}
          onClick={handleThemeChange('dark')}
        >
          Dark
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === 'system'}
          onClick={handleThemeChange('system')}
        >
          System
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
