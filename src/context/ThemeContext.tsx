import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = (localStorage.getItem('platform_theme') || localStorage.getItem('khushi_theme')) as Theme | null;
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      // Or check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    // Clean up any residual multi-theme attributes or inline styles from previous experiments
    root.removeAttribute('data-theme');
    const legacyProps = [
      '--theme-bg',
      '--theme-card',
      '--theme-card-elevated',
      '--theme-text-title',
      '--theme-text-muted',
      '--theme-text-accent',
      '--theme-border',
      '--theme-border-glow',
      '--theme-glow-1',
      '--theme-glow-2',
      '--theme-bokeh',
      '--theme-veil',
      '--color-primary',
      '--color-primary-hover',
      '--color-secondary',
      '--color-secondary-container',
      '--color-antique-gold',
      '--color-gold-light',
    ];
    legacyProps.forEach((prop) => root.style.removeProperty(prop));
    localStorage.removeItem('khushi_luxury_theme');
    localStorage.removeItem('khushi_theme');
    localStorage.setItem('platform_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
