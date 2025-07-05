import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { BrowserLocalStorage } from '@/lib/services/browser-local-storage';
import { BrowserTabPermissions } from '../services/browser-tab-permissions';
import { BrowserTabs } from '../services/browser-tabs';

const memoMap = Effect.runSync(Layer.makeMemoMap);

export const useSettingsStorageRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    BrowserLocalStorage.Default,
  ),
  memoMap,
);

export const usePermissionsRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    BrowserTabs.Default,
    BrowserTabPermissions.Default,
  ),
  memoMap,
);

export const permissionsToggleRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    BrowserTabs.Default,
  ),
  memoMap,
);
