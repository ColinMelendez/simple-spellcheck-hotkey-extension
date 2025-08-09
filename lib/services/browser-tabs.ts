import * as Data from 'effect/Data'
import * as Effect from 'effect/Effect'
import { browser } from 'wxt/browser'

export class BrowserTabsError<T = unknown> extends Data.TaggedClass('BrowserTabsError')<{
  cause: T
}> {}

export class GetCurrentTabUrlError<T = unknown> extends Data.TaggedClass('GetCurrentTabUrlError')<{
  cause: T
}> {}

export class BrowserTabs extends Effect.Service<BrowserTabs>()('BrowserTabs', {
  effect: Effect.gen(function* () {
    const browserTabs = browser.tabs

    /**
     * Use the wrapped browser tabs instance for any of it's synchronous internal methods, safely wrapped in an effect.
     * @param f - The function that accepts and uses the browser tabs instance.
     * @returns - An effect that succeeds with whatever the function returns, or fails with a
     * `BrowserTabsError` if any errors are thrown while using the browser tabs.
     */
    const use = <A>(f: (browserTabs: typeof browser.tabs) => Promise<A>) =>
      Effect.tryPromise({
        try: async () => f(browserTabs),
        catch: (cause) => new BrowserTabsError({ cause }),
      })

    /**
     * Gets the current tab url
     * @returns - The current tab url, or a `GetCurrentTabUrlError` if the tab is undefined or has no URL.
     */
    const currentTabUrl = Effect.gen(function* () {
      const [tab] = yield* use(async (browserTabs) => browserTabs.query({ active: true, currentWindow: true }))
      if (tab === undefined) {
        return yield* Effect.fail(new GetCurrentTabUrlError({ cause: 'Tab is undefined' }))
      }
      if (tab.url === undefined) {
        return yield* Effect.fail(new GetCurrentTabUrlError({ cause: 'Tab has no URL' }))
      }
      return tab.url
    })

    return {
      use,
      currentTabUrl,
    } as const
  }),
}) {}
