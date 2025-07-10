import { useEffect, useRef } from 'react';
import { ModeToggle } from '@/components/popup/dark-mode-toggle';
import { ScrambleSetting } from '@/components/popup/scramble-setting';
import { ScrambleDemo } from '@/components/scramble-demo';

export const App = () => {
  const toggleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (toggleRef.current) {
        const contextMenuEvent = new MouseEvent('contextmenu', {
          bubbles: true, // The event will bubble up the DOM tree
          cancelable: true, // The event can be canceled (e.g., prevent default behavior)
          view: window, // The window object where the event occurred
          buttons: 2, // Represents the secondary (right) mouse button
        });

        toggleRef.current.dispatchEvent(contextMenuEvent);
        console.log('contextMenuEvent dispatched');
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 self-center py-8 text-center">
      <h1 className="text-2xl font-bold">Text Scrambler</h1>
      <p className="text-lg">
        Welcome to Text Scrambler! To get started, you'll need to pin this extension to your browser's toolbar for easy access.
      </p>
      <p className="text-lg">
        <strong>To pin the extension:</strong>
        {' '}
        Click the puzzle piece icon in your browser's toolbar, then click the pin icon next to "Text Scrambler" to keep it visible. From there, you can adjust the intensity of the scramble effect and enable/disable the effect on specific websites (the extension is not granted permission to run anywhere by default).
      </p>
      <p className="text-lg">
        Once pinned, you can click the extension icon on any website to control the scramble density and customize your reading experience across different sites.
      </p>
      <p className="text-lg">
        Try it out below!
      </p>
      <hr className="my-4 w-full border-border" />
      <div className="mx-auto flex max-w-xs flex-col border-2 border-accent p-4 pb-8 text-center">
        <div ref={toggleRef} className="-mt-2 -mr-2 flex justify-end">
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
