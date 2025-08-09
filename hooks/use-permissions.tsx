import * as Effect from 'effect/Effect'
import { useCallback, useLayoutEffect, useState } from 'react'
import { usePermissionsRuntime } from '@/lib/runtimes/react-runtimes'
import { BrowserTabPermissions } from '@/lib/services/browser-tab-permissions'
import { BrowserTabs } from '@/lib/services/browser-tabs'

/**
 * A hook to manage the permission state of the current tab
 */
export const usePermissions = (): {
  /**
   * The current permission state of the page
   */
  pagePermissionState: boolean
  /**
   * A function to toggle the permission state of the page
   */
  togglePermissionState: (targetState: boolean) => void
  /**
   * The URL of the current tab
   */
  tabUrl: string
  /**
   * Whether the current tab is scriptable
   */
  isScriptable: boolean
} => {
  const [pagePermissionState, setPagePermissionState] = useState(false)
  const [tabUrl, setTabUrl] = useState<string>('')
  const [isScriptable, setIsScriptable] = useState(true)

  const togglePermissionState = useCallback((targetState: boolean) => {
    void Effect.asVoid(BrowserTabPermissions.pipe(
      Effect.flatMap((self) => self.toggleTabPermission(tabUrl, targetState)),
      Effect.tap((hasPermission) => {
        setPagePermissionState(hasPermission)
      }),
    )).pipe(
      Effect.catchTags({
        BrowserPermissionsError: (error) => Effect.logError(error),
      }),
      usePermissionsRuntime.runPromise,
    )
  }, [tabUrl])

  useLayoutEffect(() => {
    void Effect.gen(function* () {
      const url = yield* BrowserTabs.pipe(
        Effect.flatMap((self) => self.currentTabUrl),
        Effect.tap((url) => setTabUrl(url)),
      )
      yield* BrowserTabPermissions.pipe(
        Effect.tap((self) => setIsScriptable(self.isScriptableByUrl(url))),
        Effect.flatMap((self) => self.checkTabPermissionByUrl(url)),
        Effect.tap((hasPermission) => setPagePermissionState(hasPermission)),
      )
    }).pipe(
      Effect.catchTags({
        BrowserPermissionsError: (error) => Effect.logError(error),
        BrowserTabsError: (error) => Effect.logError(error),
        GetCurrentTabUrlError: (error) => Effect.logError(error),
      }),
      usePermissionsRuntime.runPromise,
    )
  }, [])

  return {
    pagePermissionState,
    togglePermissionState,
    tabUrl,
    isScriptable,
  } as const
}
