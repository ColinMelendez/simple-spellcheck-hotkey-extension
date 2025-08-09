// explanation: the types for the fake browser implementation in extensions are not propagating for some reason. this is safe.
/* eslint-disable ts/no-unsafe-call */
/* eslint-disable ts/no-unsafe-member-access */
import { expect, it } from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Exit from 'effect/Exit'
import { beforeEach, describe, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { BrowserRuntime, BrowserRuntimeError, SendMessageError } from '../browser-runtime'

describe('browserRuntime', () => {
  beforeEach(() => {
    fakeBrowser.reset()
  })

  it.effect('should provide service interface', () =>
    Effect.gen(function* () {
      const service = yield* BrowserRuntime

      expect(service.use).toBeDefined()
      expect(service.sendMessage).toBeDefined()
      expect(typeof service.use).toBe('function')
      expect(typeof service.sendMessage).toBe('function')
    }).pipe(
      Effect.provide(BrowserRuntime.Default),
    ))

  it.effect('should access runtime properties through use method', () =>
    Effect.gen(function* () {
      const service = yield* BrowserRuntime

      const result = yield* Effect.exit(
        service.use((runtime) => runtime.id),
      )

      expect(Exit.isSuccess(result)).toBe(true)
      if (Exit.isSuccess(result)) {
        expect(typeof result.value).toBe('string')
      }
    }).pipe(
      Effect.provide(BrowserRuntime.Default),
    ))

  it.effect('should fail with BrowserRuntimeError when an error is thrown in use', () =>
    Effect.gen(function* () {
      const service = yield* BrowserRuntime

      const result = yield* Effect.exit(
        service.use(() => {
          throw new Error('Runtime error')
        }),
      )

      const expected = new BrowserRuntimeError({ cause: new Error('Runtime error') })
      expect(result).toStrictEqual(Exit.fail(expected))
    }).pipe(
      Effect.provide(BrowserRuntime.Default),
    ))

  it.effect('should send messages successfully', () =>
    Effect.gen(function* () {
      const service = yield* BrowserRuntime

      const message = {
        payload: { test: 'data' },
      }

      // Set up the mock directly on the fake browser
      Object.defineProperty(fakeBrowser.runtime, 'sendMessage', {
        value: vi.fn().mockResolvedValue({ success: true }),
        writable: true,
      })

      const result = yield* service.sendMessage(message)

      expect(result).toEqual({ success: true })
    }).pipe(
      Effect.provide(BrowserRuntime.Default),
    ))

  it.effect('should fail with SendMessageError when an error is thrown in sendMessage', () =>
    Effect.gen(function* () {
      const service = yield* BrowserRuntime

      const message = {
        payload: { test: 'data' },
      }

      Object.defineProperty(fakeBrowser.runtime, 'sendMessage', {
        value: vi.fn().mockRejectedValue(new Error('Send failed')),
        writable: true,
      })

      const result = yield* Effect.exit(service.sendMessage(message))

      const expected = new SendMessageError({ cause: new Error('Send failed') })
      expect(result).toStrictEqual(Exit.fail(expected))
    }).pipe(
      Effect.provide(BrowserRuntime.Default),
    ))
})
