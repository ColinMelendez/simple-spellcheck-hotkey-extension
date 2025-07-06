import * as Effect from 'effect/Effect';
import { CircleQuestionMarkIcon } from 'lucide-react';
import { useCallback } from 'react';
import { browser } from 'wxt/browser';
import { usePermissions } from '@/hooks/use-permissions';
import { permissionsToggleRuntime } from '@/lib/runtimes/react-runtimes';
import { BrowserTabs } from '@/lib/services/browser-tabs';
import { Checkbox, type CheckedState } from '../ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/primitives/tooltip';

const disableScrambleScript = (url: string) => {
  void Effect.flatMap(
    BrowserTabs,
    (self) => self.use(async (browserTabs) => {
      void browserTabs.query({ url: `${new URL(url).origin}/*` }).then((tabs) => {
        for (const tab of tabs) {
          if (tab.id !== undefined) {
            void browser.tabs.sendMessage(tab.id, {
              messageCategory: 'disable-scramble',
            });
          }
        }
      });
    }),
  ).pipe(
    Effect.catchTags({
      BrowserTabsError: (error) => Effect.logError(error),
    }),
    permissionsToggleRuntime.runPromise,
  )
};

export const PermissionsToggle = () => {
  const [pagePermissionState, togglePermissionState, tabUrl, isScriptable] = usePermissions();

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
      {isScriptable && (
        <>
          <Checkbox
            checked={pagePermissionState}
            onCheckedChange={setPermissions}
          />
          <p className="text-sm text-primary">
            {tabUrl ? `${new URL(tabUrl).hostname}` : ''}
          </p>
        </>
      )}
      {!isScriptable && (
        <div className="flex flex-row items-center gap-2 rounded-md bg-destructive px-2 text-sm text-accent">
          <p className="p-2 text-sm text-accent">
            The extension can not be enabled on this page
          </p>
          <Tooltip>
            <TooltipTrigger>
              <CircleQuestionMarkIcon className="size-4 text-accent" />
            </TooltipTrigger>
            <TooltipContent className="max-w-2xs border-1 border-background text-center">
              <p>The browser blocks extensions from running on some types of pages, like those originating from opened files, other extensions, or internal features of the browser.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
};
