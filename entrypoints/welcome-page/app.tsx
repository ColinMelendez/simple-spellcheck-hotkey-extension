export const App = () => {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 self-center py-8 text-center">
      <h1 className="text-2xl font-bold">Simple Autocorrect Extension</h1>
      <p className="text-lg">
        You've installed the Simple Autocorrect extension! To get started, you'll need to pin this extension to your browser's toolbar for easy access.
      </p>
      <p className="text-lg">
        <strong>To pin the extension:</strong>
        {' '}
        Click the puzzle piece icon in your browser's toolbar, then click the pin icon next to "Text Scrambler" to keep it visible. From there, you can adjust the intensity of the scramble effect and enable/disable the effect on specific websites (the extension is not granted permission to run anywhere by default).
      </p>
      <p className="text-lg">
        Once pinned, you can click the extension icon to open the settings menu and enable/disable the extension, and manage the words you have added to the extension's suggestions dictionary.
      </p>
    </div>
  )
}
