/**
 * @file this file contains statically-defined default values and constants that are globally relevant
 */

import * as Schema from 'effect/Schema';
import {
  ScrambleDensity,
  Settings,
} from './settings-schema';

/**
 * Default value for the density of the text scrambling.
 */
export const DEFAULT_SCRAMBLE_DENSITY = ScrambleDensity.make(0.7);

/**
 * The key used to store the settings in all storage areas.
 */
export const SETTINGS_STORAGE_KEY = 'settings';

/**
 * The default settings object.
 */
export const DEFAULT_SETTINGS = Schema.decodeSync(Settings)({
  scrambleDensity: DEFAULT_SCRAMBLE_DENSITY,
});
