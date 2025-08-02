import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import Typo from 'typo-js';
import { affData } from '@/lib/domain/spellcheck-affixes-en-us';
import { dicData } from '@/lib/domain/spellcheck-dict-en-us';

export class SpellcheckError<T = unknown> extends Data.TaggedClass('SpellcheckError')<{
  cause: T
}> {}

// implement a spell-checker service that wraps a singleton typo object and provides access to it via the use pattern
export class Spellcheck extends Effect.Service<Spellcheck>()('Spellcheck', {
  effect: Effect.gen(function* () {
    // Create typo instance with manually loaded data
    const checker = new Typo('en_US', affData, dicData);

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
