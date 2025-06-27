import { browser, defineBackground } from '#imports'; // WXT built-ins
import addPermissionToggle from 'webext-permission-toggle';
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
          void browser.tabs.create({
            url: browser.runtime.getURL('/welcome-page.html'),
          });
        }
      });

      // Listen for messages from content scripts
      browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // eslint-disable-next-line ts/no-unsafe-member-access
        if (message.type === 'getSettings') {
          void (async () => {
            const data = await browser.storage.sync.get('settings');
            // Provide default settings if none are stored
            // eslint-disable-next-line ts/no-unsafe-assignment
            const settings = data.settings !== undefined ? data.settings : { scramble_density: 0.7 };
            // eslint-disable-next-line ts/no-unsafe-assignment
            sendResponse({ settings });
          })();
          return true; // Indicates that the response is sent asynchronously
        }
        // eslint-disable-next-line ts/no-unsafe-member-access
        else if (message.type === 'setSettings') {
          // eslint-disable-next-line ts/no-unsafe-assignment, ts/no-unsafe-member-access
          void browser.storage.sync.set({ settings: message.settings });
        }
      });

      // Push settings updates to content scripts when they change
      browser.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' && changes.settings) {
          // eslint-disable-next-line ts/no-unsafe-assignment
          const newSettings = changes.settings.newValue;
          void browser.tabs.query({}).then((tabs) => {
            for (const tab of tabs) {
              if (tab.id !== null) {
                void browser.tabs.sendMessage(tab.id as number, {
                  type: 'settingsUpdated',
                  // eslint-disable-next-line ts/no-unsafe-assignment
                  settings: newSettings,
                }).catch((error: unknown) => {
                  // It's expected that some tabs won't have the content script injected.
                  if (error instanceof Error && !error.message.includes('Receiving end does not exist'))
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
