import * as Either from 'effect/Either';
import * as Schema from 'effect/Schema';
import { describe, expect, it } from 'vitest';
import { Message, MessageCategory } from '../message-schema';

describe('messageSchema', () => {
  describe('messageCategory', () => {
    it('should decode valid message category', () => {
      const result = Schema.decodeUnknownEither(MessageCategory)('disable-scramble');

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right).toBe('disable-scramble');
      }
    });

    it('should reject invalid message category', () => {
      const result = Schema.decodeUnknownEither(MessageCategory)('invalid-category');

      expect(Either.isLeft(result)).toBe(true);
    });

    it('should reject non-string values', () => {
      const invalidInputs = [123, true, undefined, undefined, {}, []];

      for (const input of invalidInputs) {
        const result = Schema.decodeUnknownEither(MessageCategory)(input);
        expect(Either.isLeft(result)).toBe(true);
      }
    });

    it('should encode valid message category', () => {
      const category: MessageCategory = 'disable-scramble';
      const result = Schema.encodeEither(MessageCategory)(category);

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right).toBe('disable-scramble');
      }
    });
  });

  describe('message', () => {
    it('should decode valid message with payload', () => {
      const messageData = {
        messageCategory: 'disable-scramble',
        payload: { key: 'value', number: 42 },
      };

      const result = Schema.decodeUnknownEither(Message)(messageData);

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right.messageCategory).toBe('disable-scramble');
        expect(result.right.payload).toEqual({ key: 'value', number: 42 });
      }
    });

    it('should decode valid message without payload', () => {
      const messageData = {
        messageCategory: 'disable-scramble',
      };

      const result = Schema.decodeUnknownEither(Message)(messageData);

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right.messageCategory).toBe('disable-scramble');
        expect(result.right.payload).toBeUndefined();
      }
    });

    it('should decode message with undefined payload', () => {
      const messageData = {
        messageCategory: 'disable-scramble',
        payload: undefined,
      };

      const result = Schema.decodeUnknownEither(Message)(messageData);

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right.messageCategory).toBe('disable-scramble');
        expect(result.right.payload).toBeUndefined();
      }
    });

    it('should accept any type of payload', () => {
      const payloads = [
        'string payload',
        42,
        true,
        { complex: { nested: 'object' } },
        [1, 2, 3],
        undefined,
      ];

      for (const payload of payloads) {
        const messageData = {
          messageCategory: 'disable-scramble',
          payload,
        };

        const result = Schema.decodeUnknownEither(Message)(messageData);
        expect(Either.isRight(result)).toBe(true);
        if (Either.isRight(result)) {
          expect(result.right.payload).toEqual(payload);
        }
      }
    });

    it('should reject message with invalid category', () => {
      const messageData = {
        messageCategory: 'invalid-category',
        payload: { test: 'data' },
      };

      const result = Schema.decodeUnknownEither(Message)(messageData);

      expect(Either.isLeft(result)).toBe(true);
    });

    it('should reject message without messageCategory', () => {
      const messageData = {
        payload: { test: 'data' },
      };

      const result = Schema.decodeUnknownEither(Message)(messageData);

      expect(Either.isLeft(result)).toBe(true);
    });

    it('should reject non-object values', () => {
      const invalidInputs = ['string', 123, true, undefined, undefined, []];

      for (const input of invalidInputs) {
        const result = Schema.decodeUnknownEither(Message)(input);
        expect(Either.isLeft(result)).toBe(true);
      }
    });

    it('should encode valid message', () => {
      const message: Message = {
        messageCategory: 'disable-scramble',
        payload: { test: 'data' },
      };

      const result = Schema.encodeEither(Message)(message);

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right).toEqual({
          messageCategory: 'disable-scramble',
          payload: { test: 'data' },
        });
      }
    });

    it('should encode message without payload', () => {
      const message: Message = {
        messageCategory: 'disable-scramble',
      };

      const result = Schema.encodeEither(Message)(message);

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right).toEqual({
          messageCategory: 'disable-scramble',
        });
      }
    });

    it('should handle extra properties gracefully', () => {
      const messageData = {
        messageCategory: 'disable-scramble',
        payload: { test: 'data' },
        extraProperty: 'should be ignored',
      };

      const result = Schema.decodeUnknownEither(Message)(messageData);

      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right.messageCategory).toBe('disable-scramble');
        expect(result.right.payload).toEqual({ test: 'data' });
        // Extra property should not be included
        expect('extraProperty' in result.right).toBe(false);
      }
    });
  });
});
