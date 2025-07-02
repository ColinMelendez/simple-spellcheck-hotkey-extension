import type { Browser } from '#imports';
import { browser } from '#imports';
import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '@/lib/domain/global-defaults';
import { Settings } from '@/lib/domain/settings-schema';
import { popupRuntime } from '@/lib/runtimes/react-runtimes';
import { BrowserLocalStorage } from '@/lib/services/browser-local-storage';

/**
 * Update the settings state in storage with a new value
 * @internal
 * @param updatedSettings - The new settings value to store
 */
const updateSettingsStorage = (updatedSettings: Settings) => {
  void Effect.gen(function* () {
    const localStorage = yield* BrowserLocalStorage;
    const value = yield* Schema.decodeUnknown(Settings)(updatedSettings)
    yield* localStorage.use(async (storage) => {
      void storage.set({
        [SETTINGS_STORAGE_KEY]: value,
      });
    });
  }).pipe(
    Effect.catchTags({
      BrowserLocalStorageError: (error) => Effect.logError(error),
      ParseError: (error) => Effect.logError(error),
    }),
    popupRuntime.runPromise,
  );
}

/**
 * A hook to subscribe to and update the state of the extension's stored settings
 * @returns A tuple containing the current settings state and a function to update the settings state in storage
 * The settings value is reactive to changes made to the stored settings anywhere in the extension.
 */
export const useSettingsStorage = () => {
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
      popupRuntime.runPromise,
    );
  }, []);

  // On initial load, get the latest settings from storage and listen for changes
  useEffect(() => {
    void Effect.gen(function* () {
      const localStorage = yield* BrowserLocalStorage;
      const value = yield* localStorage.use(async (storage) => storage.get(SETTINGS_STORAGE_KEY))
      const decoded = yield* Schema.decodeUnknown(Settings)(value[SETTINGS_STORAGE_KEY])
      setSettings(decoded)
    }).pipe(
      Effect.catchTags({
        ParseError: (error) => Effect.logError(error),
        BrowserLocalStorageError: (error) => Effect.logError(error),
      }),
      popupRuntime.runPromise,
    );

    browser.storage.local.onChanged.addListener(onLocalStorageSettingsChange);

    return () => {
      browser.storage.local.onChanged.removeListener(onLocalStorageSettingsChange);
    };
  }, [onLocalStorageSettingsChange]);

  return [
    settings,
    updateSettingsStorage,
  ] as const;
}
