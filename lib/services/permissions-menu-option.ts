import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import addPermissionToggle from 'webext-permission-toggle';

class PermissionsMenuOptionError extends Data.TaggedClass('PermissionsMenuOptionError')<{
  cause: unknown
}> {}

export class PermissionsMenuOption extends Effect.Service<PermissionsMenuOption>()('PermissionsMenuOption', {
  effect: Effect.gen(function* () {
    /**
     * Deploys a toggle option that is added to the options dropdown of the extension, allowing the use
     * to toggle on and off the extension's permissions for the current tab when they select it.
     * @returns - An effect that deploys the permissions toggle option as a side effect, or fails with a `PermissionsToggleError`
     */
    const toggle = Effect.try({
      try: () => addPermissionToggle(),
      catch: (cause) => new PermissionsMenuOptionError({ cause }),
    });

    return {
      toggle,
    } as const;
  }),
}) {}
