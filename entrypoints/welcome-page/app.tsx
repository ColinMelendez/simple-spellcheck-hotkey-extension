export const App = () => {
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
        <p>
          testing
        </p>
      </div>
    </div>
  );
}
