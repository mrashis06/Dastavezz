'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

interface ThemeContextType extends ThemeState {
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = 'dastavezz-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(t: Theme): 'light' | 'dark' {
  return t === 'system' ? getSystemTheme() : t;
}

function applyThemeToDOM(resolved: 'light' | 'dark') {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  root.setAttribute('data-theme', resolved);
}

// Reducer — all state changes go through here.
// Using a reducer avoids multiple sequential setState calls that cause cascades.
type Action =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SYSTEM_CHANGE' };

function themeReducer(state: ThemeState, action: Action): ThemeState {
  switch (action.type) {
    case 'SET_THEME': {
      const resolved = resolveTheme(action.payload);
      applyThemeToDOM(resolved); // Side-effect inside reducer (intentional, DOM-only)
      return { theme: action.payload, resolvedTheme: resolved };
    }
    case 'SYSTEM_CHANGE': {
      if (state.theme !== 'system') return state;
      const resolved = getSystemTheme();
      applyThemeToDOM(resolved);
      return { ...state, resolvedTheme: resolved };
    }
  }
}

// Build initial state from localStorage (lazy, runs once)
function buildInitialState(): ThemeState {
  const stored: Theme =
    typeof window !== 'undefined'
      ? ((localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system')
      : 'system';
  const resolved = resolveTheme(stored);
  applyThemeToDOM(resolved); // Apply immediately on init (no flash)
  return { theme: stored, resolvedTheme: resolved };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, undefined, buildInitialState);

  // Subscribe to OS preference changes — callback-only setState via dispatch
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => dispatch({ type: 'SYSTEM_CHANGE' });
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setTheme = (t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    dispatch({ type: 'SET_THEME', payload: t });
  };

  return (
    <ThemeContext.Provider value={{ ...state, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
