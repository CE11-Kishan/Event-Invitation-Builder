import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white',
  {
    variants: {
      variant: {
        default: 'bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-400',
        outline: 'border border-gray-300 bg-white hover:bg-gray-100 text-gray-900',
        ghost: 'hover:bg-gray-100 text-gray-900',
        destructive: 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-400',
        subtle: 'bg-gray-100 text-gray-900 hover:bg-gray-200'
      },
      size: {
        sm: 'h-8 px-3 rounded-md',
        md: 'h-9 px-4 rounded-md',
        lg: 'h-10 px-6 rounded-md',
        icon: 'h-9 w-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

export const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
});
Button.displayName = 'Button';

export { buttonVariants };
