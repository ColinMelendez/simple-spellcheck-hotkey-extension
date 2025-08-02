import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { BrowserRuntime } from '../services/browser-runtime';

export const ScriptRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    BrowserRuntime.Default,
  ),
);
