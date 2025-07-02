import { useCallback } from 'react';
import { SlidingNumber } from '@/components/sliding-number';
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
    <div className="mx-auto flex max-w-screen-md flex-col gap-4 p-4 text-center">
      <h1 className="text-xl leading-tight">Text Scrambler Settings</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-center justify-items-center">
          <label htmlFor="scramble-density" className="block text-sm font-medium">
            Scramble Density:
          </label>
          <SlidingNumber
            number={settings.scrambleDensity}
            decimalPlaces={2}
            className="ml-2 text-sm font-medium"
          />
        </div>
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
    </div>
  );
}

export default App;
