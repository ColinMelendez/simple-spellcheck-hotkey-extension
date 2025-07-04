import { useCallback } from '#imports';
import * as Effect from 'effect/Effect';
import { useLayoutEffect, useState } from 'react';
import { usePermissionsRuntime } from '@/lib/runtimes/react-runtimes';
import { BrowserTabPermissions } from '@/lib/services/browser-tab-permissions';
import { BrowserTabs } from '@/lib/services/browser-tabs';

export const usePermissions = () => {
  const [pagePermissionState, setPagePermissionState] = useState(false);
  const [tabUrl, setTabUrl] = useState<string>('');

  const togglePermissionState = useCallback((targetState: boolean) => {
    void Effect.gen(function* () {
      yield* BrowserTabPermissions.pipe(
        Effect.flatMap((permissions) => permissions.toggleTabPermission(tabUrl, targetState)),
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
        Effect.flatMap((tabs) => tabs.currentTabUrl),
        Effect.tap((url) => setTabUrl(url)),
      );
      yield* BrowserTabPermissions.pipe(
        Effect.flatMap((permissions) => permissions.checkTabPermissionByUrl(url)),
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
  ] as const;
}
