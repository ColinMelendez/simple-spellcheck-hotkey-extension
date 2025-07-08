import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import { findMatchingPatterns } from 'webext-patterns';
import { browser } from 'wxt/browser';
import { BrowserTabs } from './browser-tabs';

// https://source.chromium.org/chromium/chromium/src/+/main:extensions/common/extension_urls.cc;drc=6b42116fe3b3d93a77750bdcc07948e98a728405;l=29
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts
const unscriptableOrigins = new Set([
  'chrome.google.com',
  'chromewebstore.google.com',
  'accounts-static.cdn.mozilla.net',
  'accounts.firefox.com',
  'addons.cdn.mozilla.net',
  'addons.mozilla.org',
  'api.accounts.firefox.com',
  'content.cdn.mozilla.net',
  'discovery.addons.mozilla.org',
  'input.mozilla.org',
  'install.mozilla.org',
  'oauth.accounts.firefox.com',
  'profile.accounts.firefox.com',
  'support.mozilla.org',
  'sync.services.mozilla.com',
  'testpilot.firefox.com',
]);

export class BrowserPermissionsError extends Data.TaggedError('BrowserPermissionsError')<{
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
     * Checks if the specified url is scriptable
     * @param url - The url string to check
     * @returns a boolean indicating whether the url supports script permissions
     */
    const isScriptableByUrl = (url: string) => {
      if (url === '') {
        return false;
      }
      const testUrl = new URL(url);
      return (testUrl.protocol).startsWith('http') && !unscriptableOrigins.has(testUrl.hostname);
    }

    /**
     * Requests script permissions for the specified origins
     * @param url - The url string of the tab to request permissions for
     * @returns Whether the permissions were granted
     */
    const requestPermissionsByUrl = (url: string) => Effect.gen(function* () {
      console.log('requestPermissionsByUrl', url);
      if (!isScriptableByUrl(url)) {
        return false;
      }
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
      if (url === '') {
        return false;
      }
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
    const toggleTabPermission = (url: string, targetState: boolean) => Effect.gen(function* () {
      // const isPermitted = yield* checkTabPermissionByUrl(url)
      if (targetState) {
        yield* requestPermissionsByUrl(url);
      }
      else {
        yield* requestRemovePermissionsByUrl(url);
      }
      return yield* checkTabPermissionByUrl(url);
    });

    return {
      use,
      isScriptableByUrl,
      requestPermissionsByUrl,
      requestRemovePermissionsByUrl,
      checkTabPermissionByUrl,
      toggleTabPermission,
    } as const;
  }),
  dependencies: [BrowserTabs.Default],
}) {}
