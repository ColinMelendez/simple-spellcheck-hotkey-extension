/**
 * @file this file contains schemas that define the structure of messages that are sent between the
 * various extension contexts.
 */

import type { Browser } from 'wxt/browser';
import * as Data from 'effect/Data';
import * as Duration from 'effect/Duration';
import * as Effect from 'effect/Effect';
import * as Match from 'effect/Match';
import * as Request from 'effect/Request';
import * as RequestResolver from 'effect/RequestResolver';
import * as Schedule from 'effect/Schedule';
import * as Schema from 'effect/Schema';
import { BrowserRuntime } from '@/lib/services/browser-runtime';
import { Spellcheck, SpellcheckError } from '@/lib/services/spellcheck';

// ------------------------------
// Data Schemas
// ------------------------------

export class Suggestions extends Schema.Class<Suggestions>('Suggestions')({
  words: Schema.Array(Schema.String),
}) {}

export class GetSuggestionsError<T = unknown> extends Data.TaggedError('GetSuggestionsError')<{
  cause: T
}> {}

// ------------------------------
// Message Schemas
// ------------------------------

// using a Tagged class because we want to match on these message types
export class RequestSuggestionsMessage extends Schema.TaggedClass<RequestSuggestionsMessage>()('RequestSuggestionsMessage', {
  word: Schema.String,
}) {}

export class Message extends Schema.Class<Message>('Message')({
  payload: Schema.Union(
    RequestSuggestionsMessage,
  ),
}) {}

// ------------------------------
// Requests
// ------------------------------

export class GetSuggestions extends Request.TaggedClass('GetSuggestions')<
  Suggestions,
  GetSuggestionsError,
  { readonly word: string }
> {}

// ------------------------------
// Resolvers
// ------------------------------

export const GetSuggestionsResolver = RequestResolver.fromEffect(
  Effect.fn('GetSuggestionsResolver')(function* (request: GetSuggestions) {
    return yield* BrowserRuntime.pipe(
      Effect.flatMap((runtime) => runtime.sendMessage(Message.make({
        payload: RequestSuggestionsMessage.make({ word: request.word }),
      }))),
      Effect.andThen(Schema.decodeUnknown(Suggestions)),
      Effect.tap((suggestions) => Effect.log(`suggestions: ${suggestions.words.join(', ')}`)),
    )
  }, Effect.catchAll((cause) => new GetSuggestionsError({ cause }))),
).pipe(
  RequestResolver.contextFromServices(BrowserRuntime),
)

// ------------------------------
// Handlers
// ------------------------------

const requestSuggestionsHandler = Effect.fn('RequestSuggestionsHandler')(
  function* (
    request: RequestSuggestionsMessage,
    _: Browser.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ) {
    yield* Spellcheck.pipe(
      Effect.flatMap((spellcheck) =>
        spellcheck.use((checker) => checker.suggest(request.word)),
      ),
      Effect.andThen((words) => Suggestions.make({ words })),
      Effect.tap(sendResponse),
    )
  },
  Effect.retry({
    while: (error) => error instanceof SpellcheckError,
    times: 3,
    schedule: Schedule.exponential(Duration.seconds(0.5), 2),
  }),
)

export const messageRouter = Effect.fn('MessageRouter')(function* (
  request: unknown,
  sender: Browser.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
) {
  const message = yield* Schema.decodeUnknown(Message)(request)

  const routeMessageByPayload = Match.type<typeof message.payload>().pipe(
    Match.tag('RequestSuggestionsMessage', (payload) => requestSuggestionsHandler(payload, sender, sendResponse),
    ),
    Match.exhaustive,
  )

  return yield* routeMessageByPayload(message.payload)
})
