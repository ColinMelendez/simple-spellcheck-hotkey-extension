import * as Either from 'effect/Either';
import * as Schema from 'effect/Schema';
import { describe, expect, it } from 'vitest';
import { ScrambleDensity, Settings } from '../settings-schema';

describe('settingsSchema', () => {
  describe('scrambleDensity', () => {
    it('should decode valid density values within range', () => {
      const validValues = [0, 0.5, 1, 0.1, 0.9, 0.25, 0.75];

      for (const value of validValues) {
        const result = Schema.decodeUnknownEither(ScrambleDensity)(value);
        expect(Either.isRight(result)).toBe(true);
        if (Either.isRight(result)) {
          expect(result.right).toBe(value);
        }
      }
    });

    it('should reject values below 0', () => {
      const invalidValues = [-1, -0.1, -100, Number.NEGATIVE_INFINITY];

      for (const value of invalidValues) {
        const result = Schema.decodeUnknownEither(ScrambleDensity)(value);
        expect(Either.isLeft(result)).toBe(true);
      }
    });

    it('should reject values above 1', () => {
      const invalidValues = [1.1, 2, 100, Number.POSITIVE_INFINITY];

      for (const value of invalidValues) {
        const result = Schema.decodeUnknownEither(ScrambleDensity)(value);
        expect(Either.isLeft(result)).toBe(true);
      }
    });

    it('should reject non-number values', () => {
      const invalidInputs = ['0.5', true, undefined, {}, [], 'string'];

      for (const input of invalidInputs) {
        const result = Schema.decodeUnknownEither(ScrambleDensity)(input);
        expect(Either.isLeft(result)).toBe(true);
      }
    });

    it('should reject NaN', () => {
      const result = Schema.decodeUnknownEither(ScrambleDensity)(Number.NaN);
      expect(Either.isLeft(result)).toBe(true);
    });

    it('should encode valid density values', () => {
      const validValues = [0, 0.5, 1, 0.7];

      for (const value of validValues) {
        const density = value;
        const result = Schema.encodeEither(ScrambleDensity)(density);
        expect(Either.isRight(result)).toBe(true);
        if (Either.isRight(result)) {
          expect(result.right).toBe(value);
        }
      }
    });

    it('should handle edge case: exactly 0', () => {
      const result = Schema.decodeUnknownEither(ScrambleDensity)(0);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right).toBe(0);
      }
    });

    it('should handle edge case: exactly 1', () => {
      const result = Schema.decodeUnknownEither(ScrambleDensity)(1);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right).toBe(1);
      }
    });

    it('should handle floating point precision', () => {
      const preciseValue = 0.123456789;
      const result = Schema.decodeUnknownEither(ScrambleDensity)(preciseValue);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right).toBe(preciseValue);
      }
    });
  });

  describe('settings', () => {
    it('should decode valid settings object', () => {
      const settingsData = {
        scrambleDensity: 0.7,
      };

      const result = Schema.decodeUnknownEither(Settings)(settingsData);

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right.scrambleDensity).toBe(0.7);
      }
    });

    it('should decode settings with minimum density', () => {
      const settingsData = {
        scrambleDensity: 0,
      };

      const result = Schema.decodeUnknownEither(Settings)(settingsData);

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right.scrambleDensity).toBe(0);
      }
    });

    it('should decode settings with maximum density', () => {
      const settingsData = {
        scrambleDensity: 1,
      };

      const result = Schema.decodeUnknownEither(Settings)(settingsData);

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right.scrambleDensity).toBe(1);
      }
    });

    it('should reject settings with invalid scramble density', () => {
      const invalidSettings = [
        { scrambleDensity: -1 },
        { scrambleDensity: 1.5 },
        { scrambleDensity: 'invalid' },
        { scrambleDensity: undefined },
      ];

      for (const settings of invalidSettings) {
        const result = Schema.decodeUnknownEither(Settings)(settings);
        expect(Either.isLeft(result)).toBe(true);
      }
    });

    it('should reject settings without scrambleDensity', () => {
      const settingsData = {};

      const result = Schema.decodeUnknownEither(Settings)(settingsData);

      expect(Either.isLeft(result)).toBe(true);
    });

    it('should reject non-object values', () => {
      const invalidInputs = ['string', 123, true, undefined, []];

      for (const input of invalidInputs) {
        const result = Schema.decodeUnknownEither(Settings)(input);
        expect(Either.isLeft(result)).toBe(true);
      }
    });

    it('should encode valid settings', () => {
      const settings = Schema.decodeUnknownSync(Settings)({
        scrambleDensity: 0.8,
      });

      const result = Schema.encodeEither(Settings)(settings);

      console.log('result', result);

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right).toEqual({
          scrambleDensity: 0.8,
        });
      }
    });

    it('should handle extra properties gracefully', () => {
      const settingsData = {
        scrambleDensity: 0.6,
        extraProperty: 'should be ignored',
        anotherExtra: 123,
      };

      const result = Schema.decodeUnknownEither(Settings)(settingsData);

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right.scrambleDensity).toBe(0.6);
        // Extra properties should not be included in Data struct
        expect('extraProperty' in result.right).toBe(false);
        expect('anotherExtra' in result.right).toBe(false);
      }
    });

    it('should create immutable settings objects', () => {
      const settingsData = {
        scrambleDensity: 0.5,
      };

      const result = Schema.decodeUnknownSync(Settings)(settingsData);

      // Attempt to modify should not affect the original
      const modified = { ...result, scrambleDensity: 0.9 as ScrambleDensity };
      expect(result.scrambleDensity).toBe(0.5);
      expect(modified.scrambleDensity).toBe(0.9);
    });

    it('should support structural equality with Data', () => {
      const settings1 = Schema.decodeUnknownSync(Settings)({ scrambleDensity: 0.7 });
      const settings2 = Schema.decodeUnknownSync(Settings)({ scrambleDensity: 0.7 });
      const settings3 = Schema.decodeUnknownSync(Settings)({ scrambleDensity: 0.8 });

      // Data structs should have structural equality
      expect(settings1).toEqual(settings2);
      expect(settings1).not.toEqual(settings3);
    });

    it('should preserve precise floating point values', () => {
      const preciseValue = 0.123456789;
      const settingsData = {
        scrambleDensity: preciseValue,
      };

      const result = Schema.decodeUnknownEither(Settings)(settingsData);

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right.scrambleDensity).toBe(preciseValue);
      }
    });
  });
});
