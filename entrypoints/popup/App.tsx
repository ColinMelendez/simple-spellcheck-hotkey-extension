import { ModeToggle } from '@/components/popup/dark-mode-toggle';

export const App = () => {
  return (
    <div className="mx-auto flex max-w-screen-md flex-col p-4 pb-8 text-center">
      <div className="-mt-2 -mr-2 flex justify-end">
        <ModeToggle />
      </div>
      <div className="flex flex-col gap-10">
        <h1 className="text-xl leading-tight">Text Scrambler Settings</h1>
      </div>
    </div>
  );
}
