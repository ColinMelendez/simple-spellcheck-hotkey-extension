'use client';

import { type HTMLMotionProps, motion } from 'motion/react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils/cn';

const whileTapStyle = { scale: 0.95 } as const;
const whileHoverStyle = { scale: 1.05 } as const;
const checkmarkStrokeAnimationVariants = {
  checked: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  unchecked: {
    pathLength: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
} as const;

type CheckedState = CheckboxPrimitive.CheckedState;

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>
  & HTMLMotionProps<'button'>;

const Checkbox = ({
  className,
  onCheckedChange,
  ...props
}: CheckboxProps,
) => {
  const [isChecked_InternallyControlled, setIsChecked_InternallyControlled] = React.useState<CheckedState>(
    props?.defaultChecked ?? false,
  );

  const externallyControlled = props?.checked !== undefined;
  const isChecked = externallyControlled ? props?.checked : isChecked_InternallyControlled;

  const handleCheckedChange = React.useCallback(
    (nextIsChecked: CheckedState) => {
      if (!externallyControlled) {
        setIsChecked_InternallyControlled(nextIsChecked);
      }
      else if (onCheckedChange !== undefined) {
        onCheckedChange(nextIsChecked);
      }
    },
    [externallyControlled, onCheckedChange],
  );

  return (
    <CheckboxPrimitive.Root
      {...props}
      onCheckedChange={handleCheckedChange}
      asChild
    >
      <motion.button
        data-slot="checkbox"
        className={cn(
          `
            peer flex size-5 shrink-0 items-center justify-center rounded-sm bg-input transition-colors duration-300
            focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none
            disabled:cursor-not-allowed disabled:opacity-50
            data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground
          `,
          className,
        )}
        whileTap={whileTapStyle}
        whileHover={whileHoverStyle}
        {...props}
      >
        <CheckboxPrimitive.Indicator forceMount asChild>
          <motion.svg
            data-slot="checkbox-indicator"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3.5"
            stroke="currentColor"
            className="size-3.5"
            initial="unchecked"
            animate={isChecked === true ? 'checked' : 'unchecked'}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
              variants={checkmarkStrokeAnimationVariants}
            />
          </motion.svg>
        </CheckboxPrimitive.Indicator>
      </motion.button>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, type CheckboxProps, type CheckedState };
