import { Moon, Sun } from 'lucide-react';

import { useTheme } from 'next-themes';

const useIsDark = () => {
  const { theme, systemTheme } = useTheme();
  return theme === 'system' ? systemTheme === 'dark' : theme === 'dark';
};

function PrefersColorSchemeSelector() {
  const { setTheme, theme, systemTheme } = useTheme();
  const isDark = useIsDark();

  return (
    <button
      onClick={() => {
        setTheme(
          theme === 'system'
            ? systemTheme === 'dark'
              ? 'light'
              : 'dark'
            : theme === 'dark'
              ? systemTheme === 'light'
                ? 'system'
                : 'light'
              : systemTheme === 'dark'
                ? 'system'
                : 'dark',
        );
      }}
      className="
        flex items-center justify-center w-6 h-6 rounded-md
        bg-gray-100 dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-colors duration-200
      "
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Moon className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
      ) : (
        <Sun className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );
}

export default PrefersColorSchemeSelector;
