import { browser } from '#imports';
import { Context, Effect, Layer, Schema } from 'effect';

// Define the schema for our settings
export const SettingsSchema = Schema.Struct({
  scramble_density: Schema.Number.pipe(Schema.clamp(0, 1)),
});
export interface Settings extends Schema.Schema.Type<typeof SettingsSchema> {}

// Define the interface for our settings service
export interface SettingsService {
  readonly get: Effect.Effect<Settings, Error>
  readonly set: (settings: Settings) => Effect.Effect<void, Error>
}

// Create a context tag for the settings service
export const SettingsServiceTag = Context.GenericTag<SettingsService>('SettingsService');

// Create a live implementation of the SettingsService
export const SettingsServiceLive = Layer.succeed(
  SettingsServiceTag,
  {
    get: Effect.tryPromise({
      try: async () => {
        const data = await browser.storage.sync.get('settings');
        // Provide default settings if none are stored
        return data.settings || { scramble_density: 0.7 };
      },
      catch: error => new Error(`Failed to get settings from storage: ${error}`),
    }).pipe(
      Effect.flatMap(Schema.decodeUnknown(SettingsSchema)),
      Effect.mapError(e => new Error(`Failed to decode settings: ${e}`)),
    ),

    set: (settings: Settings) =>
      Effect.tryPromise({
        try: () => browser.storage.sync.set({ settings: Schema.encodeSync(SettingsSchema)(settings) }),
        catch: error => new Error(`Failed to set settings in storage: ${error}`),
      }),
  },
);
