/**
 * @file This file contains the `BrowserRuntime` service, which provides a way to use the apis of
 * the extension browser runtime namespace effectfully.
 */

import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import { browser } from 'wxt/browser';

export class BrowserRuntimeError<T = unknown> extends Data.TaggedClass('BrowserRuntimeError')<{
  cause: T
}> {}

export class SendMessageError<T = unknown> extends Data.TaggedClass('SendMessageError')<{
  cause: T
}> {}

export class BrowserRuntime extends Effect.Service<BrowserRuntime>() ('BrowserRuntime', {
  effect: Effect.gen(function* () {
    const runtime = browser.runtime;

    /**
     * Use the wrapped browser runtime instance for any of it's synchronous internal methods, safely wrapped in an effect.
     * @param f - The function that accepts and uses the runtime instance.
     * @returns - An effect that succeeds with whatever the function returns, or fails with a
     * `BrowserRuntimeError` if any errors are thrown while using the runtime.
     */
    const use = <A>(f: (runtime: typeof browser.runtime) => A) =>
      Effect.try({
        try: () => f(runtime),
        catch: (cause) => new BrowserRuntimeError({ cause }),
      });

    /**
     * Send a message with the browser runtime and return the response in an effect.
     * @param message - The message to send with the browser runtime.
     * @returns - An effect that succeeds with the response, or fails with an error if
     * any errors are thrown while sending the message.
     */
    const sendMessage = <T>(message: T) =>
      Effect.tryPromise({
        try: async <Response = unknown>(): Promise<Response> => runtime.sendMessage(message),
        catch: (cause) => new SendMessageError({ cause }),
      });

    return {
      use,
      sendMessage,
    } as const;
  }),
}) {}
