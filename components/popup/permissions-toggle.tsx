import * as Effect from 'effect/Effect';
import { useCallback } from 'react';
import { browser } from 'wxt/browser';
import { usePermissions } from '@/hooks/use-permissions';
import { permissionsToggleRuntime } from '@/lib/runtimes/react-runtimes';
import { BrowserTabs } from '@/lib/services/browser-tabs';
import { Checkbox, type CheckedState } from '../ui/checkbox';

const disableScrambleScript = (url: string) => {
  void Effect.gen(function* () {
    const tabsService = yield* BrowserTabs;
    yield* tabsService.use(async (browserTabs) => {
      void browserTabs.query({ url: `${new URL(url).origin}/*` }).then((tabs) => {
        for (const tab of tabs) {
          if (tab.id !== undefined) {
            void browser.tabs.sendMessage(tab.id, {
              messageCategory: 'disable-scramble',
            });
          }
        }
      })
    })
  }).pipe(
    Effect.catchTags({
      BrowserTabsError: (error) => Effect.logError(error),
    }),
    permissionsToggleRuntime.runPromise,
  )
}

export const PermissionsToggle = () => {
  const [pagePermissionState, togglePermissionState, tabUrl] = usePermissions();

  const setPermissions = useCallback((nextState: CheckedState) => {
    if (nextState === true) {
      togglePermissionState(true);
    }
    else {
      togglePermissionState(false);
      void disableScrambleScript(tabUrl);
    }
  }, [togglePermissionState, tabUrl])

  return (
    <div className="flex flex-row items-center justify-center justify-items-center gap-2">
      <Checkbox
        checked={pagePermissionState}
        onCheckedChange={setPermissions}
      />
      <p className="text-sm text-primary">
        {tabUrl ? `${new URL(tabUrl).hostname}` : ''}
      </p>
    </div>
  );
};
