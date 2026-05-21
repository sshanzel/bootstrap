import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ThemeName } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface ThemeOption {
  Icon: LucideIcon;
  label: string;
  theme: ThemeName;
}

const themeOptions: ThemeOption[] = [
  { Icon: Sun, label: 'Light', theme: 'light' },
  { Icon: Moon, label: 'Dark', theme: 'dark' },
  { Icon: Monitor, label: 'System', theme: 'system' },
];

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const selectedThemeOption = findThemeOption(theme);

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      {themeOptions.map(({ Icon, label, theme: optionTheme }) => (
        <Button
          aria-label={`Use ${label.toLowerCase()} theme`}
          key={optionTheme}
          onClick={() => setTheme(optionTheme)}
          size="icon"
          title={label}
          type="button"
          variant={theme === optionTheme ? 'default' : 'ghost'}
        >
          <Icon />
        </Button>
      ))}
      <span className="hidden pr-2 text-xs font-medium text-muted-foreground sm:inline">
        Theme: {selectedThemeOption.label}
      </span>
    </div>
  );
}

function findThemeOption(theme: ThemeName): ThemeOption {
  const themeOption = themeOptions.find((option) => option.theme === theme);
  if (!themeOption) {
    throw new Error(`Missing theme option for ${theme}`);
  }

  return themeOption;
}
