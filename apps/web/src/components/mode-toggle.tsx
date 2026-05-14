import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/theme/use-theme';

export function ModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const nextTheme = readNextTheme(theme, resolvedTheme);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/85 p-1 shadow-sm backdrop-blur">
      <Button
        aria-label="Use light theme"
        onClick={() => setTheme('light')}
        size="icon"
        type="button"
        variant={theme === 'light' ? 'default' : 'ghost'}
      >
        <Sun />
      </Button>
      <Button
        aria-label="Use dark theme"
        onClick={() => setTheme('dark')}
        size="icon"
        type="button"
        variant={theme === 'dark' ? 'default' : 'ghost'}
      >
        <Moon />
      </Button>
      <Button
        aria-label="Use system theme"
        onClick={() => setTheme('system')}
        size="icon"
        type="button"
        variant={theme === 'system' ? 'default' : 'ghost'}
      >
        <Monitor />
      </Button>
      <span className="pr-3 text-xs font-medium text-muted-foreground">
        Next: {nextTheme}
      </span>
    </div>
  );
}

function readNextTheme(
  theme: 'light' | 'dark' | 'system',
  resolvedTheme: 'light' | 'dark',
): 'light' | 'dark' | 'system' {
  if (theme === 'system') {
    return 'light';
  }

  if (resolvedTheme === 'light') {
    return 'dark';
  }

  return 'system';
}
