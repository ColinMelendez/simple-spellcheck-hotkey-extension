import { ModeToggle } from '@/components/popup/dark-mode-toggle';
import { PermissionsToggle } from '@/components/popup/permissions-toggle';
import { ScrambleSetting } from '@/components/popup/scramble-setting';

export const App = () => {
  return (
    <div className="mx-auto flex max-w-screen-md flex-col gap-4 p-4 text-center">
      <div className="-mx-4 -mt-4 flex justify-end">
        <ModeToggle
          variant="ghost"
        />
      </div>
      <h1 className="text-xl leading-tight">Text Scrambler Settings</h1>
      <ScrambleSetting />
      <PermissionsToggle />
    </div>
  );
}
