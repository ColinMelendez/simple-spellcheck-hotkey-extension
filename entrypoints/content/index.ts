import { defineContentScript } from '#imports'; // WXT built-ins
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
      scramble_density: 0.5,
    };

    document.addEventListener('selectionchange', () => {
      requestAnimationFrame(applyOverlayToSelection(settings));
    });

    // const port = browser.runtime.sendMessage({ name: 'content-script' });
  },
});
