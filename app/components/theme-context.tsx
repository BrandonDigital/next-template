"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  isLight: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light"); // Default to light to match server render
  const [mounted, setMounted] = useState(false);
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("light");

  // Calculate if we're in dark mode
  const isDark = React.useMemo(() => {
    // During SSR or before mounting, always return false to prevent hydration mismatch
    if (!mounted) return false;

    if (theme === "dark") return true;
    if (theme === "light") return false;

    // System theme
    return systemTheme === "dark";
  }, [theme, mounted, systemTheme]);

  // Apply initial theme immediately to prevent flash
  useEffect(() => {
    // Get saved theme or default to system
    const savedTheme = localStorage.getItem("theme") as Theme;
    const initialTheme =
      savedTheme && ["dark", "light", "system"].includes(savedTheme)
        ? savedTheme
        : "system";

    // Set initial system theme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const initialSystemTheme = mediaQuery.matches ? "dark" : "light";

    // Apply theme immediately to prevent flash
    const root = document.documentElement;
    root.classList.remove("dark", "light");

    if (initialTheme === "system") {
      root.classList.add(initialSystemTheme);
    } else {
      root.classList.add(initialTheme);
    }

    // Now set state
    setTheme(initialTheme);
    setSystemTheme(initialSystemTheme);
    setMounted(true);

    // Listen for system theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove("dark", "light");

    if (theme === "system") {
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme, mounted, systemTheme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    isLight: !isDark,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
