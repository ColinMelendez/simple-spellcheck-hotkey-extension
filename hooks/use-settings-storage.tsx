import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';
import { useCallback, useEffect, useState } from 'react';
import { browser, type Browser } from 'wxt/browser';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '@/lib/domain/global-defaults';
import { Settings } from '@/lib/domain/settings-schema';
import { useSettingsStorageRuntime } from '@/lib/runtimes/react-runtimes';
import { BrowserLocalStorage } from '@/lib/services/browser-local-storage';

// See useSettingsStore exports
const updateSettingsStorage = (updatedSettings: Settings) => {
  void Effect.gen(function* () {
    const value = yield* Schema.decodeUnknown(Settings)(updatedSettings)
    yield* Effect.flatMap(
      BrowserLocalStorage,
      (self) => self.use(async (storage) =>
        void storage.set({
          [SETTINGS_STORAGE_KEY]: value,
        })),
    );
  }).pipe(
    Effect.catchTags({
      BrowserLocalStorageError: (error) => Effect.logError(error),
      ParseError: (error) => Effect.logError(error),
    }),
    useSettingsStorageRuntime.runPromise,
  );
}

/**
 * A hook to subscribe to and update the state of the extension's stored settings
 * The settings value is reactive to changes made to the stored settings anywhere in the extension.
 */
export const useSettingsStorage = (): {
  /**
   * The current settings state
   */
  settings: Settings
  /**
   * Update the settings state in storage with a new value
   * @param updatedSettings - The new settings value to store
   */
  updateSettingsStorage: (updatedSettings: Settings) => void
} => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const onLocalStorageSettingsChange = useCallback((changes: Record<string, Browser.storage.StorageChange>) => {
    void Effect.gen(function* () {
      if (changes[SETTINGS_STORAGE_KEY]) {
        const value = yield* Schema.decodeUnknown(Settings)(changes[SETTINGS_STORAGE_KEY].newValue)
        setSettings(value);
      }
    }).pipe(
      Effect.catchTags({
        ParseError: (error) => Effect.logError(error),
      }),
      useSettingsStorageRuntime.runPromise,
    );
  }, []);

  // On initial load, get the latest settings from storage and listen for changes
  useEffect(() => {
    void Effect.asVoid(BrowserLocalStorage.pipe(
      Effect.flatMap((self) => self.use(async (storage) => storage.get(SETTINGS_STORAGE_KEY))),
      Effect.flatMap((value) => Schema.decodeUnknown(Settings)(value[SETTINGS_STORAGE_KEY])),
      Effect.tap((decoded) => setSettings(decoded)),
      (_) => _,
    )).pipe(
      Effect.catchTags({
        ParseError: (error) => Effect.logError(error),
        BrowserLocalStorageError: (error) => Effect.logError(error),
      }),
      useSettingsStorageRuntime.runPromise,
    );

    browser.storage.local.onChanged.addListener(onLocalStorageSettingsChange);

    return () => {
      browser.storage.local.onChanged.removeListener(onLocalStorageSettingsChange);
    };
  }, [onLocalStorageSettingsChange]);

  return {
    settings,
    updateSettingsStorage,
  } as const;
}
