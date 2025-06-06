import type { Settings } from '@/lib/settings';
import { Effect } from 'effect';
import {
  MessagingSettingsServiceLive,
  MessagingSettingsServiceTag,
} from '@/lib/MessagingSettingsService';

const getSettings = Effect.flatMap(MessagingSettingsServiceTag, s => s.get);
export const getSettingsEffect = Effect.provide(getSettings, MessagingSettingsServiceLive);

function setSettings(settings: Settings) {
  return Effect.flatMap(MessagingSettingsServiceTag, s => s.set(settings))
}
export function setSettingsEffect(settings: Settings) {
  return Effect.provide(setSettings(settings), MessagingSettingsServiceLive)
}
