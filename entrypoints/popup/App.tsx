import { useCallback } from 'react';
import { useSettingsStorage } from '@/hooks/use-settings-storage';
import { ScrambleDensity } from '@/lib/domain/settings-schema';

function App() {
  const [settings, updateSettingsStorage] = useSettingsStorage();

  const updateSettings = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettingsStorage({
      ...settings,
      scrambleDensity: ScrambleDensity.make(Number.parseFloat(e.target.value)),
    });
  }, [settings, updateSettingsStorage]);

  return (
    <div className="mx-auto max-w-screen-md p-4 text-center">
      <h1 className="text-xl leading-tight">Text Scrambler Settings</h1>
      <div className="p-4">
        <label htmlFor="scramble-density" className="mb-2 block text-sm font-medium">
          Scramble Density:
          <span className="ml-2 font-mono">{settings.scrambleDensity.toFixed(2)}</span>
        </label>
        <input
          id="scramble-density"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={settings.scrambleDensity}
          onChange={updateSettings}
          className={`
            h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200
            dark:bg-gray-700
          `}
        />
        <p className={`
          mt-2 text-xs text-gray-500
          dark:text-gray-400
        `}
        >
          Controls the percentage of characters that are scrambled.
        </p>
      </div>
      <p className={`
        text-xs text-gray-500
        dark:text-gray-400
      `}
      >
        Changes are saved automatically and applied to all tabs.
      </p>
    </div>
  );
}

export default App;
