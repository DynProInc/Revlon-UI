import React, { createContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}

// Create ThemeContext with default values
export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  useEffect(() => {
    // Check for saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      // Check for system preference
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
      }
    }
  }, []);
  
  useEffect(() => {
    // Apply class to document for dark mode styling
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);
  
  // Toggle theme function - memoized to prevent recreating on each render
  const toggleTheme = useCallback(() => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  }, []);
  
  // Memoize context value to prevent unnecessary re-renders of consuming components
  const contextValue = useMemo(() => ({ 
    darkMode, 
    toggleTheme 
  }), [darkMode, toggleTheme]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
