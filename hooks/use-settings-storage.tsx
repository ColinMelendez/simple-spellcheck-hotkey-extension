import type { Browser } from '#imports';
import { browser } from '#imports';
import * as Schema from 'effect/Schema';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '@/lib/domain/global-defaults';
import { Settings } from '@/lib/domain/settings-schema';

/**
 * A hook to subscribe-to and update the state of the extension's stored settings
 * @returns A tuple containing the current settings state and a function to update the settings state in storage
 */
export const useSettingsStorage = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const onLocalStorageSettingsChange = useCallback((changes: Record<string, Browser.storage.StorageChange>) => {
    if (changes[SETTINGS_STORAGE_KEY]) {
      try {
        setSettings(Schema.decodeUnknownSync(Settings)(changes[SETTINGS_STORAGE_KEY].newValue));
      }
      catch (error) {
        console.error('Error decoding settings from storage', error);
      }
    }
  }, []);

  // On initial load, get the latest settings from storage and listen for changes
  useEffect(() => {
    browser.storage.local.get(SETTINGS_STORAGE_KEY)
      .then((data: Record<string, unknown>) => {
        console.log('data', data);
        try {
          setSettings(Schema.decodeUnknownSync(Settings)(data[SETTINGS_STORAGE_KEY]));
        }
        catch (error) {
          console.error('Error decoding settings from storage', error);
        }
      })
      .catch((err) => {
        console.error('Could not update settings from storage, using default values', err);
      });

    browser.storage.local.onChanged.addListener(onLocalStorageSettingsChange);

    return () => {
      browser.storage.local.onChanged.removeListener(onLocalStorageSettingsChange);
    };
  }, [onLocalStorageSettingsChange]);

  /**
   * Update the settings state in storage with a new value
   * @param updatedSettings - The new settings value to store
   */
  const updateSettingsStorage = useCallback((updatedSettings: Settings) => {
    browser.storage.local.set({
      [SETTINGS_STORAGE_KEY]: Schema.decodeSync(Settings)(updatedSettings),
    }).catch((err) => {
      console.error('Error updating settings', err);
    });
  }, []);

  return [
    settings,
    updateSettingsStorage,
  ] as const;
}
