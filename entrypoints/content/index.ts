import { browser, defineContentScript } from '#imports'; // WXT built-ins
import { DEFAULT_SCRAMBLE_DENSITY } from '@/lib/Domain/global-defaults';
import { applyOverlayToSelection } from './active-selection-scramble';

export default defineContentScript({
  /**
   * NOTE:
   * `matches` defines the URLs that the content script will *try* to run on,
   * but it does not reflect the permissions required to actually run.
   * Permissions must be defined in the manifest or manually added by the user.
   */
  matches: ['*://*.google.com/*'],
  main() {
    console.log('hello from entrypoints/content/index.ts');

    const settings = {
      scramble_density: DEFAULT_SCRAMBLE_DENSITY, // Default value, will be updated from storage
    };

    // On every selection change, a new overlay function is created with the *current* settings.
    // This ensures that if the `settings` object is updated, subsequent selections use the new values.
    document.addEventListener('selectionchange', () => {
      requestAnimationFrame(applyOverlayToSelection(settings));
    });

    // Request initial settings from the background script
    browser.runtime.sendMessage({ type: 'getSettings' }).then((response) => {
      // eslint-disable-next-line ts/strict-boolean-expressions, ts/no-unsafe-member-access
      if (response?.settings) {
        // eslint-disable-next-line ts/no-unsafe-member-access
        console.log('Applying initial settings from background:', response.settings);
        // eslint-disable-next-line ts/no-unsafe-member-access
        Object.assign(settings, response.settings);
      }
    }).catch((err) => console.error('Could not get settings from background script', err));

    // Listen for settings updates from the background script
    browser.runtime.onMessage.addListener((message) => {
      // eslint-disable-next-line ts/strict-boolean-expressions, ts/no-unsafe-member-access
      if (message.type === 'settingsUpdated' && message.settings) {
        // eslint-disable-next-line ts/no-unsafe-member-access
        console.log('Settings updated:', message.settings);
        // eslint-disable-next-line ts/no-unsafe-member-access
        Object.assign(settings, message.settings);
      }
    });

    // const port = browser.runtime.sendMessage({ name: 'content-script' });
  },
});
