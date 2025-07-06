import { ModeToggle } from '@/components/popup/dark-mode-toggle';
import { ScrambleSetting } from '@/components/popup/scramble-setting';
import { ScrambleDemo } from '@/components/scramble-demo';

export const App = () => {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 self-center py-8 text-center">
      <h1 className="text-2xl font-bold">Text Scrambler</h1>
      <p>
        Welcome to Text Scrambler! To get started, you'll need to pin this extension to your browser's toolbar for easy access.
      </p>
      <p>
        <strong>To pin the extension:</strong>
        {' '}
        Click the puzzle piece icon in your browser's toolbar, then click the pin icon next to "Text Scrambler" to keep it visible.
      </p>
      <p>
        Once pinned, you can click the extension icon on any website to control the scramble density and customize your reading experience across different sites.
      </p>
      <p>
        below is a demo of the extension in action.
      </p>
      <div className="mx-auto flex max-w-xs flex-col border-2 border-accent p-4 pb-8 text-center">
        <div className="-mt-2 -mr-2 flex justify-end">
          <ModeToggle />
        </div>
        <div className="flex flex-col gap-10">
          <h1 className="text-xl leading-tight">Text Scrambler Settings</h1>
          <ScrambleSetting />
        </div>
      </div>
      <ScrambleDemo />
    </div>
  );
}
