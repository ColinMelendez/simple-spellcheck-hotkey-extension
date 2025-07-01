import {
  browser,
  defineContentScript,
} from '#imports'; // WXT built-ins
import * as Schema from 'effect/Schema';
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
} from '@/lib/domain/global-defaults';
import { Settings } from '@/lib/domain/settings-schema';
import { applyOverlayToSelection } from './active-selection-scramble';

export default defineContentScript({
  /**
   * NOTE:
   * `matches` defines the URLs that the content script will *try* to run on,
   * but it does not reflect the permissions required to actually run.
   * Permissions must be defined in the manifest or manually added by the user.
   */
  matches: ['*://*.google.com/*'],
  main: () => {
    console.log('hello from entrypoints/content/index.ts');

    // default settings value
    let settings = DEFAULT_SETTINGS;

    // on startup, get the current settings from storage
    browser.storage.local.get(SETTINGS_STORAGE_KEY)
      .then((data: Record<string, unknown>) => {
        try {
          settings = Schema.decodeUnknownSync(Settings)(data[SETTINGS_STORAGE_KEY]);
        }
        catch (error) {
          console.error('Error decoding settings from storage', error);
        }
      })
      .catch((err) => {
        console.error('Could not update settings from storage, using default values', err);
      });

    // On every selection change, a new overlay function is created with the *current* settings.
    // This ensures that if the `settings` object is updated, subsequent selections use the new values.
    document.addEventListener('selectionchange', () => {
      requestAnimationFrame(applyOverlayToSelection(settings));
    }, {
      passive: true,
    });

    // when the settings are updated in storage, update the settings locally
    browser.storage.local.onChanged.addListener((changes) => {
      if (changes[SETTINGS_STORAGE_KEY]) {
        try {
          settings = Schema.decodeUnknownSync(Settings)(changes[SETTINGS_STORAGE_KEY].newValue);
        }
        catch (error) {
          console.error('Error decoding settings from storage', error);
        }
      }
    });
  },
});
