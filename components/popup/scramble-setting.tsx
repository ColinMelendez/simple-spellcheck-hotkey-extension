import { useCallback, useMemo } from 'react';
import { Slider } from '@/components/ui/primitives/slider';
import { SlidingNumber } from '@/components/ui/sliding-number';
import { useSettingsStorage } from '@/hooks/use-settings-storage';
import { ScrambleDensity } from '@/lib/domain/settings-schema';

export const ScrambleSetting = () => {
  const [settings, updateSettingsStorage] = useSettingsStorage();

  const updateSettings = useCallback((value: number[]) => {
    const [scrambleDensity = 0] = value;
    updateSettingsStorage({
      ...settings,
      scrambleDensity: ScrambleDensity.make(scrambleDensity),
    });
  }, [settings, updateSettingsStorage]);

  const sliderValueProp = useMemo(() => [settings.scrambleDensity], [settings.scrambleDensity]);
  return (
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
      <Slider
        id="scramble-density"
        value={sliderValueProp}
        min={0}
        max={1}
        step={0.01}
        onValueChange={updateSettings}
      />
      <p className={`
        mt-2 text-xs text-gray-500
        dark:text-gray-400
      `}
      >
        Controls the percentage of characters that are scrambled.
      </p>
    </div>
  )
}
