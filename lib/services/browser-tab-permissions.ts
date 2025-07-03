import { browser } from '#imports';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import { findMatchingPatterns } from 'webext-patterns';
import { BrowserTabs } from './browser-tabs';

class BrowserPermissionsError extends Data.TaggedError('BrowserPermissionsError')<{
  cause: unknown
}> {}

export class BrowserTabPermissions extends Effect.Service<BrowserTabPermissions>()('BrowserTabPermissions', {
  effect: Effect.gen(function* () {
    const browserPermissions = browser.permissions;

    /**
     * Use the wrapped browser permissions instance for any of it's synchronous internal methods, safely wrapped in an effect.
     * @param f - The function that accepts and uses the browser permissions instance.
     * @returns - An effect that succeeds with whatever the function returns, or fails with a
     * `BrowserPermissionsError` if any errors are thrown while using the browser permissions.
     */
    const use = <A>(f: (browserPermissions: typeof browser.permissions) => Promise<A>) =>
      Effect.tryPromise({
        try: async () => f(browserPermissions),
        catch: (cause) => new BrowserPermissionsError({ cause }),
      });

    /**
     * Requests script permissions for the specified origins
     * @param url - The url string of the tab to request permissions for
     * @returns Whether the permissions were granted
     */
    const requestPermissionsByUrl = (url: string) => Effect.gen(function* () {
      const permissionData = { origins: [`${new URL(url).origin}/*`] };
      yield* Effect.logDebug('Requesting permissions:', ...permissionData.origins);
      return yield* use(async (browserPermissions) => browserPermissions.request(permissionData));
    })

    /**
     * Requests the removal of script permissions for the specified origins
     * @param url - The url string of the tab to remove permissions for
     * @returns Whether the permissions were removed
     */
    const requestRemovePermissionsByUrl = (url: string) => Effect.gen(function* () {
      const { origins = [] } = yield* use(async (browserPermissions) => browserPermissions.getAll());
      const matchingPatterns = findMatchingPatterns(url, ...origins);
      yield* Effect.logDebug('Removing permissions:', ...matchingPatterns);
      return yield* use(async (browserPermissions) => browserPermissions.remove({
        origins: matchingPatterns,
      }));
    })

    /**
     * Checks if the specified tab has script permissions
     * @param url - The URL of the tab to check permissions for
     * @returns Whether the permissions exist
     */
    const checkTabPermissionByUrl = (url: string) => Effect.gen(function* () {
      return yield* use(async (browserPermissions) => browserPermissions.contains({
        origins: [`${new URL(url).origin}/*`],
      }));
    });

    /**
     * Toggles script permissions for the specified tab
     * @param url - The URL of the tab to toggle permissions for
     * @returns Whether the permissions exist after the toggle
     */
    const toggleTabPermission = (url: string) => Effect.gen(function* () {
      const isPermitted = yield* checkTabPermissionByUrl(url)
      if (isPermitted) {
        yield* requestRemovePermissionsByUrl(url)
      }
      else {
        yield* requestPermissionsByUrl(url)
      }
      return yield* checkTabPermissionByUrl(url);
    });

    return {
      use,
      requestPermissionsByUrl,
      requestRemovePermissionsByUrl,
      checkTabPermissionByUrl,
      toggleTabPermission,
    } as const;
  }),
  dependencies: [BrowserTabs.Default],
}) {}
