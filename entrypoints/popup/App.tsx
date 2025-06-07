import { browser } from '#imports'; // WXT built-ins
import { useEffect, useRef, useState } from 'react';

// Default settings, which will be updated from storage
const initialSettings = {
  scramble_density: 0.7,
};

function simpleDebounce(fn: (...args: unknown[]) => void, delay: number) {
  let timeoutId: NodeJS.Timeout | undefined;
  return (...args: unknown[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const sendSettings = simpleDebounce((settings) => {
  browser.runtime.sendMessage({ type: 'setSettings', settings });
}, 500);

function App() {
  const [settings, setSettings] = useState(initialSettings);
  const scrambleDensity = settings.scramble_density;
  const isInitialMount = useRef(true);

  // On popup open, ask the background script for the latest settings
  useEffect(() => {
    browser.runtime.sendMessage({ type: 'getSettings' }).then((response) => {
      if (response?.settings) {
        console.log('settings', response.settings);
        setSettings(response.settings);
      }
    }).catch(err => console.error('Could not get settings from background script', err));
  }, []);

  // Debounce sending settings to the background script
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    sendSettings();
  }, [settings]);

  return (
    <div className="mx-auto max-w-screen-md p-4 text-center">
      <h1 className="text-xl leading-tight">Text Scrambler Settings</h1>
      <div className="p-4">
        <label htmlFor="scramble-density" className="mb-2 block text-sm font-medium">
          Scramble Density:
          <span className="ml-2 font-mono">{scrambleDensity.toFixed(2)}</span>
        </label>
        <input
          id="scramble-density"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={scrambleDensity}
          onChange={(e) => {
            setSettings({ ...settings, scramble_density: Number.parseFloat(e.target.value) });
          }}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Controls the percentage of characters that are scrambled.
        </p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Changes are saved automatically and applied to all tabs.
      </p>
    </div>
  );
}

export default App;
