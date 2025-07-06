import { useCallback, useMemo } from 'react';
import { Slider } from '@/components/ui/primitives/slider';
import { SlidingNumberInput } from '@/components/ui/sliding-number-input';
import { useSettingsStorage } from '@/hooks/use-settings-storage';
import { ScrambleDensity } from '@/lib/domain/settings-schema';

export const ScrambleSetting = () => {
  const [settings, updateSettingsStorage] = useSettingsStorage();

  const updateSettings = useCallback((scrambleDensity: number) => {
    updateSettingsStorage({
      ...settings,
      scrambleDensity: ScrambleDensity.make(scrambleDensity),
    });
  }, [settings, updateSettingsStorage]);

  const updateSettingsFromSlider = useCallback((value: number[]) => {
    const [scrambleDensity = 0] = value;
    updateSettings(scrambleDensity);
  }, [updateSettings]);

  const sliderValueProp = useMemo(() => [settings.scrambleDensity], [settings.scrambleDensity]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-center justify-items-center">
        <label htmlFor="scramble-density" className="block text-sm font-medium">
          Scramble Density:
        </label>
        <SlidingNumberInput
          value={settings.scrambleDensity}
          defaultValue={settings.scrambleDensity}
          decimalPlaces={2}
          onChange={updateSettings}
          className="ml-2 text-sm font-medium"
        />
      </div>
      <Slider
        id="scramble-density"
        value={sliderValueProp}
        min={0}
        max={1}
        step={0.01}
        onValueChange={updateSettingsFromSlider}
      />
      <p className="text-xs text-muted-foreground">
        Controls the percentage of characters that are scrambled.
      </p>
    </div>
  )
}
