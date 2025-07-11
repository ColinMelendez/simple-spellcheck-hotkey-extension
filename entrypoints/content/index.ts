import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/utils/define-content-script';
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
} from '@/lib/domain/global-defaults';
import { Message } from '@/lib/domain/message-schema';
import { Settings } from '@/lib/domain/settings-schema';
import { applyOverlayToSelection, clearOverlays } from '@/lib/utils/active-selection-scramble';

export default defineContentScript({
  /**
   * NOTE:
   * `matches` defines the URLs that the content script will *try* to run on,
   * but it does not reflect the permissions required to actually run.
   * Permissions must be defined in the manifest or manually added by the user.
   * Note that these matches can be modified programmatically after the extension has been installed,
   * as is the case with the web-ext-permissions-toggle utility .
   */
  matches: ['null/*'],
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

    // when the settings are updated in storage, update the settings locally
    browser.storage.local.onChanged.addListener((changes) => {
      if (changes[SETTINGS_STORAGE_KEY]) {
        try {
          settings = Schema.decodeUnknownSync(Settings)(changes[SETTINGS_STORAGE_KEY].newValue);
          // reset the overlay with the updated settings
          applyOverlayToSelection(settings)();
        }
        catch (error) {
          console.error('Error decoding settings from storage', error);
        }
      }
    });

    const controller = new AbortController();

    // On every selection change, a new overlay function is created with the *current* settings.
    // This ensures that if the `settings` object is updated, subsequent selections use the new values.
    document.addEventListener('selectionchange', () => {
      requestAnimationFrame(applyOverlayToSelection(settings));
    }, {
      passive: true,
      signal: controller.signal,
    });

    // attach a listener to the abort signal itself to clean up the overlays if the scramble effect is disabled.
    controller.signal.addEventListener('abort', () => {
      clearOverlays();
    });

    browser.runtime.onMessage.addListener((message) => {
      const decodedMessage = Schema.decodeUnknownOption(Message)(message);
      if (Option.isSome(decodedMessage) && decodedMessage.value.messageCategory === 'disable-scramble') {
        controller.abort();
      }
    })
  },
});
