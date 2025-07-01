import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import addPermissionToggle from 'webext-permission-toggle';

class PermissionsToggleError extends Data.TaggedClass('PermissionsToggleError')<{
  cause: unknown
}> {}

export class PermissionsToggle extends Effect.Service<PermissionsToggle>()('PermissionsToggle', {
  effect: Effect.gen(function* () {
    const toggle = Effect.try({
      try: () => addPermissionToggle(),
      catch: (cause) => new PermissionsToggleError({ cause }),
    });

    return {
      toggle,
    } as const;
  }),
}) {}
