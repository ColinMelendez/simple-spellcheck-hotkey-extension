import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import { browser } from 'wxt/browser';

export class BrowserLocalStorageError extends Data.TaggedClass('BrowserLocalStorageError')<{
  cause: unknown
}> {}

export class BrowserLocalStorage extends Effect.Service<BrowserLocalStorage>()('BrowserLocalStorage', {
  effect: Effect.gen(function* () {
    const storage = browser.storage.local;

    /**
     * Use the wrapped browser storage instance for any of it's internal methods, safely wrapped in an effect.
     * @param f - The function that accepts and uses the storage instance.
     * @returns - An effect that succeeds with whatever the function returns, or fails with a
     * `BrowserLocalStorageError` if any errors are thrown while using the storage.
     */
    const use = <A>(f: (storage: typeof browser.storage.local) => Promise<A>) =>
      Effect.tryPromise({
        try: async () => f(storage),
        catch: (cause) => new BrowserLocalStorageError({ cause }),
      });

    return {
      use,
    } as const;
  }),
}) {}
