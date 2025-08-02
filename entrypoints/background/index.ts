import * as Console from 'effect/Console';
import * as Effect from 'effect/Effect';
import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';
import { messageRouter } from '@/lib/domain/messaging';
import { backgroundRuntime } from '@/lib/runtimes/background-runtime';
import { BrowserRuntime } from '@/lib/services/browser-runtime';
import { PermissionsMenuOption } from '@/lib/services/permissions-menu-option';
import 'webext-dynamic-content-scripts'; // auto-refresh content-scripts when permissions change

const backgroundEffect = Effect.gen(function* () {
  yield* Console.log('Background Initializing, id:', { id: browser.runtime.id });

  // Initialize the permissions menu option
  yield* Effect.flatMap(
    PermissionsMenuOption,
    (self) => self.toggle,
  )

  yield* BrowserRuntime.pipe(
    Effect.flatMap((self) => self.use((runtime) => {
      // Open the welcome page when the extension is first installed
      runtime.onInstalled.addListener((details) => {
        console.debug('onInstalled', details);
        if (details.reason === 'install') {
          void browser.tabs.create({
            url: browser.runtime.getURL('/welcome-page.html'),
          });
        }
      });
      // Set up the message handler for the background runtime.
      runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('onMessage listener triggered', request);
        void backgroundRuntime.runPromise(messageRouter(request, sender, sendResponse))
        return true; // must synchronously return true in the listener to indicate an asynchronous response
      })
    })),
  )
}).pipe(
  Effect.catchTags({
    BrowserRuntimeError: (error) => Effect.logError(error),
    PermissionsMenuOptionError: (error) => Effect.logError(error),
  }),
  Effect.catchAllDefect((defect) => Effect.logError('fatal defect in background script', defect)),
);

export default defineBackground({
  type: 'module',
  persistent: false,
  // Executed when background is loaded
  main: () => {
    void backgroundRuntime.runPromise(backgroundEffect);
  },
});
