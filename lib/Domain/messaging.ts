/**
 * @file this file contains schemas that define the structure of messages that are sent between the
 * various extension contexts.
 */

import type { Browser } from 'wxt/browser';
import * as Console from 'effect/Console';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Match from 'effect/Match';
import * as Request from 'effect/Request';
import * as RequestResolver from 'effect/RequestResolver';
import * as Schema from 'effect/Schema';
import { BrowserRuntime } from '@/lib/services/browser-runtime';

// ------------------------------
// Data Schemas
// ------------------------------

export class Suggestions extends Schema.Class<Suggestions>('Suggestions')({
  suggestions: Schema.Array(Schema.String),
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
      Effect.flatMap((runtime) => runtime.sendMessage(request)),
      Effect.andThen(Schema.decodeUnknown(Suggestions)),
    )
  }, Effect.catchAll((cause) => new GetSuggestionsError({ cause }))),
).pipe(
  RequestResolver.contextFromServices(BrowserRuntime),
)

// ------------------------------
// Handlers
// ------------------------------

export const requestSuggestionsHandler = Effect.fn('RequestSuggestionsHandler')(
  function* (
    request: RequestSuggestionsMessage,
    _: Browser.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ) {
    yield* Console.log(sendResponse)
    return yield* Console.log(request)
  },
)

export const messageHandler = Effect.fn('MessageHandler')(function* (
  request: unknown,
  sender: Browser.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
) {
  const message = yield* Schema.decodeUnknown(Message)(request)
  const routeMessageByPayload = Match.type<typeof message.payload>().pipe(
    Match.tag('RequestSuggestionsMessage', (payload) => requestSuggestionsHandler(payload, sender, sendResponse)),
    Match.exhaustive,
  )
  return yield* routeMessageByPayload(message.payload)
})
