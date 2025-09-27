"use client";

import React, { useEffect, useState } from "react";
import Switch from "./switch";
import { useTheme } from "../theme-context";

interface DarkToggleProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  trackColors?: {
    checked: string;
    unchecked: string;
  };
  borderColors?: {
    checked: string;
    unchecked: string;
  };
  thumbColors?: {
    checked: string;
    unchecked: string;
  };
}

const DarkToggle: React.FC<DarkToggleProps> = ({
  size = "md",
  className = "",
  showLabel = false,
  leftIcon,
  rightIcon,
  trackColors,
  borderColors,
  thumbColors,
}) => {
  const { isDark, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  // Show a placeholder during SSR/hydration to prevent mismatch
  if (!mounted) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showLabel && (
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            Theme
          </span>
        )}
        <div className='w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse' />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
          {isDark ? "Dark" : "Light"}
        </span>
      )}
      <Switch
        checked={isDark}
        onCheckedChange={toggleDarkMode}
        size={size}
        aria-label='Toggle dark mode'
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        trackColors={trackColors}
        borderColors={borderColors}
        thumbColors={thumbColors}
      />
    </div>
  );
};

export default DarkToggle;
