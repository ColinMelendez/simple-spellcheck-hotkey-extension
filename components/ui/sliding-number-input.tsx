'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { SlidingNumber, type SlidingNumberProps } from './sliding-number';

interface SlidingNumberInputProps extends Omit<SlidingNumberProps, 'number' | 'onChange'> {
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  min?: number
  max?: number
  step?: number
}

const SlidingNumberInput = ({
  ref,
  value,
  defaultValue = 0,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  disabled = false,
  min,
  max,
  step,
  className,
  ...slidingNumberProps
}: SlidingNumberInputProps & { ref?: React.RefObject<HTMLInputElement | null> }) => {
  const [internallyControlledValue, setInternallyControlledValue] = React.useState(defaultValue);
  const [isFocused, setIsFocused] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => inputRef.current!);

  const externallyControlled = value !== undefined;
  const currentValue = externallyControlled ? value : internallyControlledValue;

  const handleFocus = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setInputValue(String(currentValue));
    // Select all text when focused
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
    onFocus?.(event);
  }, [currentValue, onFocus]);

  const handleBlur = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const numericValue = Number(inputValue);
    if (!Number.isNaN(numericValue)) {
      let clampedValue = numericValue;
      if (min !== undefined)
        clampedValue = Math.max(min, clampedValue);
      if (max !== undefined)
        clampedValue = Math.min(max, clampedValue);

      if (!externallyControlled) {
        setInternallyControlledValue(clampedValue);
      }
      setInputValue(String(clampedValue));
      onChange?.(clampedValue);
    }
    else {
      // Reset to previous valid value if input is invalid
      setInputValue(String(currentValue));
    }
    onBlur?.(event);
  }, [inputValue, currentValue, onChange, onBlur, min, max, externallyControlled]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      inputRef.current?.blur();
    }
    if (event.key === 'Escape') {
      setInputValue(String(currentValue));
      inputRef.current?.blur();
    }
  }, [currentValue]);

  const handleWrapperClick = React.useCallback(() => {
    if (!disabled && !isFocused) {
      inputRef.current?.focus();
    }
  }, [disabled, isFocused]);

  return (
    <div
      className={cn(
        'relative inline-block cursor-text',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      onClick={handleWrapperClick}
      onKeyDown={handleWrapperClick}
    >
      {/* Show SlidingNumber when not focused */}
      <SlidingNumber
        {...slidingNumberProps}
        number={currentValue}
        className={cn(
          'select-none',
          isFocused && 'pointer-events-none opacity-0',
        )}
      />

      {/* Input field overlay */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={cn(
          `
            absolute inset-0 border-none bg-transparent text-center leading-none tabular-nums outline-none
            focus:opacity-100
          `,
          !isFocused && 'text-transparent caret-transparent opacity-0',
          disabled && 'cursor-not-allowed',
        )}
      />
    </div>
  );
};

SlidingNumberInput.displayName = 'SlidingNumberInput';

export { SlidingNumberInput, type SlidingNumberInputProps };
