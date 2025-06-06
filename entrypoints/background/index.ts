import { browser, defineBackground } from '#imports'; // WXT built-ins
import { Effect, Schema } from 'effect';
import addPermissionToggle from 'webext-permission-toggle';
import { SettingsSchema, SettingsServiceLive, SettingsServiceTag } from '@/lib/settings';
import 'webext-dynamic-content-scripts'; // auto-refresh content-scripts when permissions change

export default defineBackground({
  type: 'module',
  persistent: false,
  // Executed when background is loaded, CANNOT BE ASYNC
  main() {
    try {
      console.log('Hello background!', { id: browser.runtime.id });

      // Initialize the permissions toggle feature
      try {
        addPermissionToggle();
      }
      catch (error) {
        console.error('Permission Toggle failed to initialize', error);
      }

      // Open the welcome page when the extension is first installed
      browser.runtime.onInstalled.addListener((details) => {
        console.log('onInstalled', details);

        if (details.reason === 'install') {
          browser.tabs.create({
            url: browser.runtime.getURL('/welcome-page.html'),
          });
        }
      });

      const getSettings = Effect.flatMap(SettingsServiceTag, s => s.get);
      const setSettings = (settings: unknown) =>
        Effect.flatMap(SettingsServiceTag, s =>
          Effect.succeed(settings).pipe(
            Effect.flatMap(Schema.decodeUnknown(SettingsSchema)),
            Effect.flatMap(decoded => s.set(decoded)),
          ));
      const runnableGet = Effect.provide(getSettings, SettingsServiceLive);
      const runnableSet = (s: unknown) => Effect.provide(setSettings(s), SettingsServiceLive);

      browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'getSettings') {
          Effect.runPromise(runnableGet)
            .then(settings => sendResponse({ settings }))
            .catch((error) => {
              console.error('Failed to get settings', error);
              sendResponse({ error: error.message });
            });
          return true; // Indicates that the response is sent asynchronously
        }
        else if (message.type === 'setSettings') {
          Effect.runPromise(runnableSet(message.settings)).catch((error) => {
            console.error('Failed to set settings', error);
          });
        }
      });

      // Push settings updates to content scripts when they change
      browser.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' && changes.settings) {
          const newSettings = changes.settings.newValue;
          browser.tabs.query({}).then((tabs) => {
            for (const tab of tabs) {
              if (tab.id) {
                browser.tabs
                  .sendMessage(tab.id, {
                    type: 'settingsUpdated',
                    settings: newSettings,
                  })
                  .catch((error) => {
                    if (!error.message.includes('Receiving end does not exist'))
                      console.error(`Failed to send message to tab ${tab.id}:`, error);
                  });
              }
            }
          });
        }
      });

      // It is HIGHLY recommended to have a catch-all error handler for the background script.
      // Extension background scripts are full of sharp edges and prone to silent failures.
    }
    catch (error) {
      console.error('Error in background script', error);
    }
  },
});
