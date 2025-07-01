import { browser } from '#imports'; // WXT built-ins
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';

class BrowserLocalStorageError extends Data.TaggedClass('BrowserLocalStorageError')<{
  cause: unknown
}> {}

export class BrowserLocalStorage extends Effect.Service<BrowserLocalStorage>()('BrowserLocalStorage', {
  effect: Effect.gen(function* () {
    const storage = browser.storage.local;

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
