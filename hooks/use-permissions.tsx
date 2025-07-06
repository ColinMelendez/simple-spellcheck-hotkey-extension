import { useCallback } from '#imports';
import * as Effect from 'effect/Effect';
import { useLayoutEffect, useState } from 'react';
import { usePermissionsRuntime } from '@/lib/runtimes/react-runtimes';
import { BrowserTabPermissions } from '@/lib/services/browser-tab-permissions';
import { BrowserTabs } from '@/lib/services/browser-tabs';

export const usePermissions = () => {
  const [pagePermissionState, setPagePermissionState] = useState(false);
  const [tabUrl, setTabUrl] = useState<string>('');
  const [isScriptable, setIsScriptable] = useState(true);

  const togglePermissionState = useCallback((targetState: boolean) => {
    void Effect.gen(function* () {
      yield* BrowserTabPermissions.pipe(
        Effect.flatMap((self) => self.toggleTabPermission(tabUrl, targetState)),
        Effect.tap((hasPermission) => {
          setPagePermissionState(hasPermission);
        }),
      );
    }).pipe(
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
      );
      yield* BrowserTabPermissions.pipe(
        Effect.tap((self) => setIsScriptable(self.isScriptableByUrl(url))),
        Effect.flatMap((self) => self.checkTabPermissionByUrl(url)),
        Effect.tap((hasPermission) => {
          setPagePermissionState(hasPermission);
        }),
      );
    }).pipe(
      Effect.catchTags({
        BrowserPermissionsError: (error) => Effect.logError(error),
        BrowserTabsError: (error) => Effect.logError(error),
        GetCurrentTabUrlError: (error) => Effect.logError(error),
      }),
      usePermissionsRuntime.runPromise,
    )
  }, [])

  return [
    pagePermissionState,
    togglePermissionState,
    tabUrl,
    isScriptable,
  ] as const;
}
