import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { BrowserRuntime } from '../services/browser-runtime';
import { PermissionsToggle } from '../services/permissions-toggle';

export const backgroundRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    PermissionsToggle.Default,
    BrowserRuntime.Default,
  ),
)
