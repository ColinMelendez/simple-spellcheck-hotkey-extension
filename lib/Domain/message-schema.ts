/**
 * @file this file contains schemas that define the structure of messages that are sent between the
 * various extension contexts.
 */

import * as Schema from 'effect/Schema';
import { Settings } from './settings-schema';

/**
 * Schema for the categories of messages that can be sent between the extension and the content script.
 * Intended for routing messages to the correct handlers.
 */
export const MessageCategory = Schema.Literal(
  'SettingsRequest',
  'SettingsBroadcast',
);

export type MessageCategory = typeof MessageCategory.Type;

/**
 * Schema for the structure of messages can be sent between the various extension contexts.
 */
export const Message = Schema.Struct({
  messageCategory: MessageCategory,
  messagePayload: Settings,
});

export type Message = typeof Message.Type;
