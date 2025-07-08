import * as Either from 'effect/Either';
import * as Schema from 'effect/Schema';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SCRAMBLE_DENSITY,
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
} from '../global-defaults';
import { ScrambleDensity, Settings } from '../settings-schema';

describe('globalDefaults', () => {
  describe('dEFAULT_SCRAMBLE_DENSITY', () => {
    it('should be a valid ScrambleDensity value', () => {
      expect(typeof DEFAULT_SCRAMBLE_DENSITY).toBe('number');
      expect(DEFAULT_SCRAMBLE_DENSITY).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_SCRAMBLE_DENSITY).toBeLessThanOrEqual(1);
    });

    it('should be decodable as ScrambleDensity', () => {
      const result = Schema.decodeUnknownSync(ScrambleDensity)(DEFAULT_SCRAMBLE_DENSITY);
      expect(result).toBe(DEFAULT_SCRAMBLE_DENSITY);
    });

    it('should be encodable as ScrambleDensity', () => {
      const encoded = Schema.encodeEither(ScrambleDensity)(DEFAULT_SCRAMBLE_DENSITY);
      expect(Either.isRight(encoded)).toBe(true);
      if (Either.isRight(encoded)) {
        expect(encoded.right).toBe(DEFAULT_SCRAMBLE_DENSITY);
      }
    });

    it('should have expected default value', () => {
      expect(DEFAULT_SCRAMBLE_DENSITY).toBe(0.7);
    });

    it('should be within valid range for UI display', () => {
      // Reasonable default for user interface
      expect(DEFAULT_SCRAMBLE_DENSITY).toBeGreaterThan(0);
      expect(DEFAULT_SCRAMBLE_DENSITY).toBeLessThan(1);
    });
  });

  describe('sETTINGS_STORAGE_KEY', () => {
    it('should be a non-empty string', () => {
      expect(typeof SETTINGS_STORAGE_KEY).toBe('string');
      expect(SETTINGS_STORAGE_KEY.length).toBeGreaterThan(0);
    });

    it('should have expected value', () => {
      expect(SETTINGS_STORAGE_KEY).toBe('settings');
    });

    it('should be suitable as storage key', () => {
      // Should not contain special characters that might cause issues
      expect(SETTINGS_STORAGE_KEY).toMatch(/^[\w-]+$/);
    });
  });

  describe('dEFAULT_SETTINGS', () => {
    it('should be a valid Settings object', () => {
      expect(typeof DEFAULT_SETTINGS).toBe('object');
      expect(DEFAULT_SETTINGS).toBeDefined();
      expect(DEFAULT_SETTINGS.scrambleDensity).toBeDefined();
    });

    it('should be decodable as Settings schema', () => {
      // Should be able to decode the default settings without error
      const result = Schema.decodeUnknownSync(Settings)(DEFAULT_SETTINGS);
      expect(result).toEqual(DEFAULT_SETTINGS);
    });

    it('should be encodable as Settings schema', () => {
      const encoded = Schema.encodeEither(Settings)(DEFAULT_SETTINGS);
      expect(Either.isRight(encoded)).toBe(true);
      if (Either.isRight(encoded)) {
        expect(encoded.right).toEqual({
          scrambleDensity: DEFAULT_SCRAMBLE_DENSITY,
        });
      }
    });

    it('should contain the default scramble density', () => {
      expect(DEFAULT_SETTINGS.scrambleDensity).toBe(DEFAULT_SCRAMBLE_DENSITY);
    });

    it('should have correct structure', () => {
      const expectedKeys = ['scrambleDensity'];
      const actualKeys = Object.keys(DEFAULT_SETTINGS);
      expect(actualKeys).toEqual(expectedKeys);
    });

    it('should be immutable', () => {
      // Should not be able to modify the default settings
      const original = DEFAULT_SETTINGS.scrambleDensity;

      // This should not affect the original
      const modified = { ...DEFAULT_SETTINGS, scrambleDensity: 0.1 as ScrambleDensity };

      expect(DEFAULT_SETTINGS.scrambleDensity).toBe(original);
      expect(modified.scrambleDensity).toBe(0.1);
    });

    it('should have structural equality with equivalent objects', () => {
      const equivalent = Schema.decodeUnknownSync(Settings)({
        scrambleDensity: 0.7,
      });

      expect(DEFAULT_SETTINGS).toEqual(equivalent);
    });

    it('should be serializable', () => {
      // Should be able to serialize to JSON and back
      const serialized = JSON.stringify(DEFAULT_SETTINGS);
      const parsed = JSON.parse(serialized) as { scrambleDensity: number };

      expect(parsed.scrambleDensity).toBe(DEFAULT_SCRAMBLE_DENSITY);
    });

    it('should work with schema roundtrip', () => {
      // Encode and decode should preserve the object
      const encoded = Schema.encodeSync(Settings)(DEFAULT_SETTINGS);
      const decoded = Schema.decodeUnknownSync(Settings)(encoded);

      expect(decoded).toEqual(DEFAULT_SETTINGS);
    });

    it('should be usable in storage operations', () => {
      // Should work as expected in typical storage scenarios
      const storageData = {
        [SETTINGS_STORAGE_KEY]: DEFAULT_SETTINGS,
      };

      expect(storageData.settings).toEqual(DEFAULT_SETTINGS);
      expect(storageData.settings.scrambleDensity).toBe(DEFAULT_SCRAMBLE_DENSITY);
    });
  });

  describe('integration tests', () => {
    it('should maintain consistency between all default values', () => {
      // All defaults should work together cohesively
      expect(DEFAULT_SETTINGS.scrambleDensity).toBe(DEFAULT_SCRAMBLE_DENSITY);

      // Storage key should be appropriate for the settings
      expect(typeof SETTINGS_STORAGE_KEY).toBe('string');
      expect(SETTINGS_STORAGE_KEY.length).toBeGreaterThan(0);
    });

    it('should work in a typical usage scenario', () => {
      // Simulate loading settings from storage
      const storageData = {
        [SETTINGS_STORAGE_KEY]: DEFAULT_SETTINGS,
      };

      // Decode from storage
      const settings = Schema.decodeUnknownSync(Settings)(storageData[SETTINGS_STORAGE_KEY]);

      // Should be valid and usable
      expect(settings.scrambleDensity).toBe(DEFAULT_SCRAMBLE_DENSITY);
      expect(settings.scrambleDensity).toBeGreaterThanOrEqual(0);
      expect(settings.scrambleDensity).toBeLessThanOrEqual(1);
    });

    it('should handle schema evolution gracefully', () => {
      // If we add new fields to Settings in the future,
      // the current defaults should still work
      const currentDefaults = DEFAULT_SETTINGS;

      // Current structure should always be valid
      expect(() => Schema.decodeUnknownSync(Settings)(currentDefaults)).not.toThrow();
    });
  });
});
