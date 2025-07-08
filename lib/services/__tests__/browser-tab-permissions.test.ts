// explanation: the types for the fake browser implementation in extensions are not propagating for some reason. this is safe.
/* eslint-disable ts/no-unsafe-call */
/* eslint-disable ts/no-unsafe-member-access */
import { expect, it } from '@effect/vitest';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import { beforeEach, describe, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { BrowserPermissionsError, BrowserTabPermissions } from '../browser-tab-permissions';
import { BrowserTabs } from '../browser-tabs';

describe('browserTabPermissions', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  describe('isScriptableByUrl', () => {
    it.effect('should return true for scriptable URLs', () =>
      Effect.gen(function* () {
        const service = yield* BrowserTabPermissions;

        expect(service.isScriptableByUrl('https://example.com')).toBe(true);
        expect(service.isScriptableByUrl('http://example.com')).toBe(true);
        expect(service.isScriptableByUrl('https://subdomain.example.com/path')).toBe(true);
      }).pipe(
        Effect.provide([BrowserTabPermissions.Default, BrowserTabs.Default]),
      ));

    it.effect('should return false for empty URLs', () =>
      Effect.gen(function* () {
        const service = yield* BrowserTabPermissions;

        expect(service.isScriptableByUrl('')).toBe(false);
      }).pipe(
        Effect.provide([BrowserTabPermissions.Default, BrowserTabs.Default]),
      ));

    it.effect('should return false for unscriptable origins', () =>
      Effect.gen(function* () {
        const service = yield* BrowserTabPermissions;

        expect(service.isScriptableByUrl('https://chrome.google.com')).toBe(false);
        expect(service.isScriptableByUrl('https://chromewebstore.google.com')).toBe(false);
        expect(service.isScriptableByUrl('https://addons.mozilla.org')).toBe(false);
        expect(service.isScriptableByUrl('https://accounts.firefox.com')).toBe(false);
      }).pipe(
        Effect.provide([BrowserTabPermissions.Default, BrowserTabs.Default]),
      ));

    it.effect('should return false for non-HTTP protocols', () =>
      Effect.gen(function* () {
        const service = yield* BrowserTabPermissions;

        expect(service.isScriptableByUrl('chrome://extensions')).toBe(false);
        expect(service.isScriptableByUrl('file:///path/to/file.html')).toBe(false);
        expect(service.isScriptableByUrl('moz-extension://uuid/page.html')).toBe(false);
      }).pipe(
        Effect.provide([BrowserTabPermissions.Default, BrowserTabs.Default]),
      ));
  });

  it.effect('should provide service interface', () =>
    Effect.gen(function* () {
      const service = yield* BrowserTabPermissions;

      expect(service.use).toBeDefined();
      expect(service.isScriptableByUrl).toBeDefined();
      expect(service.requestPermissionsByUrl).toBeDefined();
      expect(service.requestRemovePermissionsByUrl).toBeDefined();
      expect(service.checkTabPermissionByUrl).toBeDefined();
      expect(service.toggleTabPermission).toBeDefined();
    }).pipe(
      Effect.provide([BrowserTabPermissions.Default, BrowserTabs.Default]),
    ));

  it.effect('should request permissions for scriptable URL', () =>
    Effect.gen(function* () {
      const service = yield* BrowserTabPermissions;

      Object.defineProperty(fakeBrowser.permissions, 'request', {
        value: vi.fn().mockResolvedValue(true),
        writable: true,
      });

      const result = yield* service.requestPermissionsByUrl('https://example.com/page');

      expect(result).toBe(true);
    }).pipe(
      Effect.provide([BrowserTabPermissions.Default, BrowserTabs.Default]),
    ));

  it.effect('should return false for unscriptable URL request', () =>
    Effect.gen(function* () {
      const service = yield* BrowserTabPermissions;

      const result = yield* service.requestPermissionsByUrl('https://chrome.google.com');

      expect(result).toBe(false);
      // For unscriptable URLs, no request should be made
    }).pipe(
      Effect.provide([BrowserTabPermissions.Default, BrowserTabs.Default]),
    ));

  it.effect('should check permissions for URL', () =>
    Effect.gen(function* () {
      const service = yield* BrowserTabPermissions;

      Object.defineProperty(fakeBrowser.permissions, 'contains', {
        value: vi.fn().mockResolvedValue(true),
        writable: true,
      });

      const result = yield* service.checkTabPermissionByUrl('https://example.com/page');

      expect(result).toBe(true);
    }).pipe(
      Effect.provide([BrowserTabPermissions.Default, BrowserTabs.Default]),
    ));

  it.effect('should fail with RequestPermissionsError when an error is thrown in requestPermissionsByUrl', () =>
    Effect.gen(function* () {
      const service = yield* BrowserTabPermissions;

      Object.defineProperty(fakeBrowser.permissions, 'request', {
        value: vi.fn().mockRejectedValue(new Error('Permission error')),
        writable: true,
      });

      const result = yield* Effect.exit(
        service.requestPermissionsByUrl('https://example.com'),
      );

      const expected = new BrowserPermissionsError({ cause: new Error('Permission error') });
      expect(result).toStrictEqual(Exit.fail(expected));
    }).pipe(
      Effect.provide([BrowserTabPermissions.Default, BrowserTabs.Default]),
    ));

  it.effect('should toggle permissions on', () =>
    Effect.gen(function* () {
      const service = yield* BrowserTabPermissions;

      Object.defineProperty(fakeBrowser.permissions, 'request', {
        value: vi.fn().mockResolvedValue(true),
        writable: true,
      });
      Object.defineProperty(fakeBrowser.permissions, 'contains', {
        value: vi.fn().mockResolvedValue(true),
        writable: true,
      });

      const result = yield* service.toggleTabPermission('https://example.com', true);

      expect(result).toBe(true);
    }).pipe(
      Effect.provide([BrowserTabPermissions.Default, BrowserTabs.Default]),
    ));

  it.effect('should toggle permissions off', () =>
    Effect.gen(function* () {
      const service = yield* BrowserTabPermissions;

      Object.defineProperty(fakeBrowser.permissions, 'getAll', {
        value: vi.fn().mockResolvedValue({
          origins: ['https://example.com/*'],
          permissions: [],
        }),
        writable: true,
      });
      Object.defineProperty(fakeBrowser.permissions, 'remove', {
        value: vi.fn().mockResolvedValue(true),
        writable: true,
      });
      Object.defineProperty(fakeBrowser.permissions, 'contains', {
        value: vi.fn().mockResolvedValue(false),
        writable: true,
      });

      const result = yield* service.toggleTabPermission('https://example.com', false);

      expect(result).toBe(false);
    }).pipe(
      Effect.provide([BrowserTabPermissions.Default, BrowserTabs.Default]),
    ));
});
