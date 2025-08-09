// explanation: the types for the fake browser implementation in extensions are not propagating for some reason. this is safe.
/* eslint-disable ts/no-unsafe-call */
/* eslint-disable ts/no-unsafe-member-access */
import { expect, it } from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Exit from 'effect/Exit'
import { beforeEach, describe } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { BrowserLocalStorage, BrowserLocalStorageError } from '../browser-local-storage'

describe('browser-local-storage', () => {
  beforeEach(() => {
    fakeBrowser.reset()
  })

  it.effect('should provide service interface', () =>
    Effect.gen(function* () {
      const service = yield* BrowserLocalStorage

      expect(service.use).toBeDefined()
      expect(typeof service.use).toBe('function')
    }).pipe(
      Effect.provide(BrowserLocalStorage.Default),
    ))

  it.effect('should successfully get data from storage', () =>
    Effect.gen(function* () {
      const service = yield* BrowserLocalStorage

      const result = yield* Effect.exit(
        service.use(async (storage) => storage.get('test-key')),
      )

      expect(Exit.isSuccess(result)).toBe(true)
      if (Exit.isSuccess(result)) {
        expect(result.value).toEqual({})
      }
    }).pipe(
      Effect.provide(BrowserLocalStorage.Default),
    ))

  it.effect('should successfully set and get data', () =>
    Effect.gen(function* () {
      const service = yield* BrowserLocalStorage
      const testData = { 'test-key': 'test-value' }

      // Set data
      yield* service.use(async (storage) => storage.set(testData))

      // Get data back
      const result = yield* service.use(async (storage) => storage.get('test-key'))

      expect(result).toEqual(testData)
    }).pipe(
      Effect.provide(BrowserLocalStorage.Default),
    ))

  it.effect('should fail with BrowserLocalStorageError when an error is thrown in use', () =>
    Effect.gen(function* () {
      const service = yield* BrowserLocalStorage

      const result = yield* Effect.exit(
        service.use(async () => {
          throw new Error('Storage error')
        }),
      )

      const expected = new BrowserLocalStorageError({ cause: new Error('Storage error') })
      expect(result).toStrictEqual(Exit.fail(expected))
    }).pipe(
      Effect.provide(BrowserLocalStorage.Default),
    ))
})
