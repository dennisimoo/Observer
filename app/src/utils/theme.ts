type Theme = 'light' | 'dark';

class ThemeManager {
  private static instance: ThemeManager;
  private theme: Theme = 'light';
  private listeners: Set<(theme: Theme) => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('observer-theme');
      if (stored === 'dark' || stored === 'light') {
        this.theme = stored;
      } else {
        this.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      this.applyTheme();
    }
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  public getTheme(): Theme {
    return this.theme;
  }

  public setTheme(theme: Theme): void {
    this.theme = theme;
    this.applyTheme();
    this.notifyListeners();
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('observer-theme', theme);
    }
  }

  public toggleTheme(): void {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  }

  public subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private applyTheme(): void {
    if (typeof document !== 'undefined') {
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.theme));
  }
}

export const themeManager = ThemeManager.getInstance();
export type { Theme };