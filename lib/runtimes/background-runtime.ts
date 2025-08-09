import * as Layer from 'effect/Layer'
import * as ManagedRuntime from 'effect/ManagedRuntime'
import { BrowserRuntime } from '../services/browser-runtime'
import { PermissionsMenuOption } from '../services/permissions-menu-option'
import { Spellcheck } from '../services/spellcheck'

export const backgroundRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    PermissionsMenuOption.Default,
    BrowserRuntime.Default,
    Spellcheck.Default,
  ),
)
