import { browser, defineBackground } from '#imports'; // WXT built-ins
import * as Console from 'effect/Console';
import * as Effect from 'effect/Effect';
import { backgroundRuntime } from '@/lib/runtimes/background-runtime';
import { BrowserRuntime } from '@/lib/services/browser-runtime';
import { PermissionsToggle } from '@/lib/services/permissions-toggle';
import 'webext-dynamic-content-scripts'; // auto-refresh content-scripts when permissions change

const backgroundEffect = Effect.gen(function* () {
  yield* Console.log('Hello background!', { id: browser.runtime.id });

  // Initialize the permissions toggle feature
  const permissionsToggle = yield* PermissionsToggle;
  yield* permissionsToggle.toggle;

  const browserRuntime = yield* BrowserRuntime;
  yield* browserRuntime.use((runtime) => {
    // Open the welcome page when the extension is first installed
    runtime.onInstalled.addListener((details) => {
      console.log('onInstalled', details);
      if (details.reason === 'install') {
        void browser.tabs.create({
          url: browser.runtime.getURL('/welcome-page.html'),
        });
      }
    });
  })
}).pipe(
  Effect.catchTags({
    BrowserRuntimeError: (error) => Effect.logError(error),
    PermissionsToggleError: (error) => Effect.logError(error),
  }),
  Effect.catchAllDefect((defect) => Effect.logError('fatal defect in background script', defect)),
)

export default defineBackground({
  type: 'module',
  persistent: false,
  // Executed when background is loaded
  main: () => {
    void backgroundRuntime.runPromise(backgroundEffect);
  },
});
