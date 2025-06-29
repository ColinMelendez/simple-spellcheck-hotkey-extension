/**
 * @file this file contains schemas that define the structure of the extension's settings.
 */

import * as Schema from 'effect/Schema';

/**
 * Schema for the value controlling the density of the text scrambling effect.
 */
export const ScrambleDensity = Schema.Number.pipe(
  Schema.between(0, 1),
);

export type ScrambleDensity = typeof ScrambleDensity.Type;

/**
 * Schema for the extension's settings, both stored, in-memory, and as a message.
 */
export const Settings = Schema.Data(
  Schema.Struct({
    scrambleDensity: ScrambleDensity,
  }),
);

export type Settings = typeof Settings.Type;
