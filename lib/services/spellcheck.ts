import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import Typo from 'typo-js';

export class SpellcheckError<T = unknown> extends Data.TaggedClass('SpellcheckError')<{
  cause: T
}> {}

// implement a spell-checker service that wraps a singleton typo object and provides access to it via the use pattern
export class Spellcheck extends Effect.Service<Spellcheck>()('Spellcheck', {
  effect: Effect.gen(function* () {
    // singleton instance of the typo-js spellchecker
    const checker = new Typo('en_US');

    /**
     * Use the wrapped spellchecker instance for any of it's internal methods, safely wrapped in an effect.
     * @param f - The function that accepts and uses the checker instance.
     * @returns - An effect that succeeds with whatever the function returns, or fails with a
     * `SpellcheckError` if any errors are thrown while using the checker.
     */
    const use = <A>(f: (checker: Typo) => A) =>
      Effect.try({
        try: () => f(checker),
        catch: (cause) => new SpellcheckError({ cause }),
      });

    return {
      use,
    } as const;
  }),
}) {}
