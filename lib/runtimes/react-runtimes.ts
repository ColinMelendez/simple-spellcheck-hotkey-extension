import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { BrowserLocalStorage } from '@/lib/services/browser-local-storage';
import { BrowserTabPermissions } from '../services/browser-tab-permissions';
import { BrowserTabs } from '../services/browser-tabs';

export const useSettingsStorageRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    BrowserLocalStorage.Default,
  ),
);

export const usePermissionsRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    BrowserTabs.Default,
    BrowserTabPermissions.Default,
  ),
);
