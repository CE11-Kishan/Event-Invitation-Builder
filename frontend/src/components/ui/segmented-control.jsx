import { useId } from 'react';
import { cn } from '../../lib/utils';

export function SegmentedControl({
  options,
  value,
  onChange,
  size = 'sm',
  className,
  name,
  disabled
}) {
  const groupName = name || useId();
  return (
    <div className={cn(
      'inline-flex rounded-md border border-gray-300 bg-white p-0.5 text-xs shadow-sm',
      disabled && 'opacity-60 pointer-events-none',
      className
    )}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => !disabled && onChange(opt.value)}
            className={cn(
              'relative px-3 py-1 rounded-sm transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
              active
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
            aria-pressed={active}
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            data-value={opt.value}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
