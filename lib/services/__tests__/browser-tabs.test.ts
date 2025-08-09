// explanation: the types for the fake browser implementation in extensions are not propagating for some reason. this is safe.
/* eslint-disable ts/no-unsafe-call */
/* eslint-disable ts/no-unsafe-member-access */
import { expect, it } from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Exit from 'effect/Exit'
import { beforeEach, describe, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { BrowserTabs, BrowserTabsError, GetCurrentTabUrlError } from '../browser-tabs'

describe('browserTabs', () => {
  beforeEach(() => {
    fakeBrowser.reset()
  })

  it.effect('should provide service interface', () =>
    Effect.gen(function* () {
      const service = yield* BrowserTabs

      expect(service.use).toBeDefined()
      expect(service.currentTabUrl).toBeDefined()
      expect(typeof service.use).toBe('function')
    }).pipe(
      Effect.provide(BrowserTabs.Default),
    ))

  it.effect('should query tabs through use method', () =>
    Effect.gen(function* () {
      const service = yield* BrowserTabs

      const mockTabs = [
        { id: 1, url: 'https://example.com', active: true },
        { id: 2, url: 'https://test.com', active: false },
      ]

      // Mock query to filter by active tab
      Object.defineProperty(fakeBrowser.tabs, 'query', {
        value: vi.fn().mockImplementation(async (queryInfo: { active: boolean }) =>
          Promise.resolve(mockTabs.filter((tab) => !queryInfo.active || tab.active)),
        ),
        writable: true,
      })

      const result = yield* service.use(async (tabs) => tabs.query({ active: true }))

      expect(result).toEqual([mockTabs[0]])
    }).pipe(
      Effect.provide(BrowserTabs.Default),
    ))

  it.effect('should fail with BrowserTabsError when an error is thrown in use', () =>
    Effect.gen(function* () {
      const service = yield* BrowserTabs

      Object.defineProperty(fakeBrowser.tabs, 'query', {
        value: vi.fn().mockRejectedValue(new Error('Query failed')),
        writable: true,
      })

      const result = yield* Effect.exit(
        service.use(async (tabs) => tabs.query({ active: true })),
      )

      const expected = new BrowserTabsError({ cause: new Error('Query failed') })
      expect(result).toStrictEqual(Exit.fail(expected))
    }).pipe(
      Effect.provide(BrowserTabs.Default),
    ))

  it.effect('should get current tab URL successfully', () =>
    Effect.gen(function* () {
      const service = yield* BrowserTabs

      const mockTab = {
        id: 1,
        url: 'https://example.com/page',
        active: true,
      }
      Object.defineProperty(fakeBrowser.tabs, 'query', {
        value: vi.fn().mockResolvedValue([mockTab]),
        writable: true,
      })

      const result = yield* service.currentTabUrl

      expect(result).toBe('https://example.com/page')
      expect(fakeBrowser.tabs.query).toHaveBeenCalledWith({
        active: true,
        currentWindow: true,
      })
    }).pipe(
      Effect.provide(BrowserTabs.Default),
    ))

  it.effect('should fail when no tab is found', () =>
    Effect.gen(function* () {
      const service = yield* BrowserTabs

      Object.defineProperty(fakeBrowser.tabs, 'query', {
        value: vi.fn().mockResolvedValue([]),
        writable: true,
      })

      const result = yield* Effect.exit(service.currentTabUrl)

      const expected = new GetCurrentTabUrlError({ cause: 'Tab is undefined' })
      expect(result).toStrictEqual(Exit.fail(expected))
    }).pipe(
      Effect.provide(BrowserTabs.Default),
    ))

  it.effect('should fail when tab has no URL', () =>
    Effect.gen(function* () {
      const service = yield* BrowserTabs

      const mockTab = {
        id: 1,
        url: undefined,
        active: true,
      }
      Object.defineProperty(fakeBrowser.tabs, 'query', {
        value: vi.fn().mockResolvedValue([mockTab]),
        writable: true,
      })

      const result = yield* Effect.exit(service.currentTabUrl)

      const expected = new GetCurrentTabUrlError({ cause: 'Tab has no URL' })
      expect(result).toStrictEqual(Exit.fail(expected))
    }).pipe(
      Effect.provide(BrowserTabs.Default),
    ))
})
