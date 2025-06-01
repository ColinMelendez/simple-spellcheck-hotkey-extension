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
          browser.tabs.create({
            url: browser.runtime.getURL('/welcome-page.html'),
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
