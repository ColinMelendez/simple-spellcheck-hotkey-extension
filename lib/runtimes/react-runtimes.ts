import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { BrowserLocalStorage } from '@/lib/services/browser-local-storage';

const memoMap = Effect.runSync(Layer.makeMemoMap);

export const popupRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    BrowserLocalStorage.Default,
  ),
  memoMap,
);
