import type { Settings } from '@/lib/settings';
import { browser } from '#imports';
import { Context, Effect, Layer, Schema } from 'effect';
import { SettingsSchema } from '@/lib/settings';

export interface MessagingSettingsService {
  readonly get: Effect.Effect<Settings, Error>
  readonly set: (settings: Settings) => Effect.Effect<void, Error>
}

export const MessagingSettingsServiceTag = Context.GenericTag<MessagingSettingsService>(
  'MessagingSettingsService',
);

export const MessagingSettingsServiceLive = Layer.succeed(
  MessagingSettingsServiceTag,
  {
    get: Effect.tryPromise({
      try: () => browser.runtime.sendMessage({ type: 'getSettings' }),
      catch: e => new Error(`Failed to send 'getSettings' message: ${e}`),
    }).pipe(
      Effect.flatMap(response =>
        response?.settings
          ? Schema.decodeUnknown(SettingsSchema)(response.settings)
          : Effect.fail(new Error('No settings in response')),
      ),
      Effect.mapError(e => (e instanceof Error ? e : new Error(String(e)))),
    ),
    set: (settings: Settings) =>
      Effect.tryPromise({
        try: () =>
          browser.runtime.sendMessage({
            type: 'setSettings',
            settings: Schema.encodeSync(SettingsSchema)(settings),
          }),
        catch: e => new Error(`Failed to send 'setSettings' message: ${e}`),
      }).pipe(Effect.asVoid),
  },
);
