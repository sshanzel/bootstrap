import type * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-12 w-full min-w-0 rounded-2xl border bg-background/70 px-4 py-3 text-base shadow-xs outline-none transition-[color,box-shadow,border-color] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px] aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
