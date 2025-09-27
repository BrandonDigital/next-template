"use client";

import React from "react";
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
  "aria-label"?: string;
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

const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  size = "md",
  className = "",
  id,
  "aria-label": ariaLabel,
  leftIcon,
  rightIcon,
  trackColors,
  borderColors,
  thumbColors,
}) => {
  const sizeClasses = {
    sm: {
      track: "w-12 h-6",
      thumb: "w-5 h-5",
      translate: "translate-x-6",
      icon: "w-3 h-3",
    },
    md: {
      track: "w-16 h-8",
      thumb: "w-7 h-7",
      translate: "translate-x-8",
      icon: "w-4 h-4",
    },
    lg: {
      track: "w-20 h-10",
      thumb: "w-9 h-9",
      translate: "translate-x-10",
      icon: "w-5 h-5",
    },
  };

  const currentSize = sizeClasses[size];

  // Default colors
  const defaultTrackColors = {
    checked: "bg-white dark:bg-black",
    unchecked: "bg-gray-200 dark:bg-gray-700",
  };

  const defaultBorderColors = {
    checked: "border-gray-400 dark:border-white",
    unchecked: "border-gray-400 dark:border-white",
  };

  const defaultThumbColors = {
    checked: "bg-black dark:bg-white",
    unchecked: "bg-black dark:bg-white",
  };

  // Use custom colors if provided, otherwise use defaults
  const trackColorClass = trackColors
    ? checked
      ? trackColors.checked
      : trackColors.unchecked
    : checked
    ? defaultTrackColors.checked
    : defaultTrackColors.unchecked;

  const borderColorClass = borderColors
    ? checked
      ? borderColors.checked
      : borderColors.unchecked
    : checked
    ? defaultBorderColors.checked
    : defaultBorderColors.unchecked;

  const thumbColorClass = thumbColors
    ? checked
      ? thumbColors.checked
      : thumbColors.unchecked
    : checked
    ? defaultThumbColors.checked
    : defaultThumbColors.unchecked;

  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      aria-label={ariaLabel}
      id={id}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out border-2
        focus:outline-none
        ${currentSize.track}
        ${trackColorClass}
        ${borderColorClass}
        ${
          !trackColors && !borderColors
            ? checked
              ? "hover:bg-gray-50 hover:border-gray-500 dark:hover:bg-gray-900 dark:hover:border-gray-200"
              : "hover:bg-gray-300 hover:border-gray-500 dark:hover:bg-gray-600 dark:hover:border-gray-200"
            : ""
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {/* Background Icons */}
      {(leftIcon || rightIcon) && (
        <>
          {/* Left icon */}
          {leftIcon && (
            <div
              className={`
                absolute left-1.5 top-1/2 transform -translate-y-1/2 transition-opacity duration-200
                ${currentSize.icon}
                ${checked ? "opacity-100" : "opacity-30"}
              `}
            >
              {leftIcon}
            </div>
          )}
          {/* Right icon */}
          {rightIcon && (
            <div
              className={`
                absolute right-1.5 top-1/2 transform -translate-y-1/2 transition-opacity duration-200
                ${currentSize.icon}
                ${checked ? "opacity-30" : "opacity-100"}
              `}
            >
              {rightIcon}
            </div>
          )}
        </>
      )}

      {/* Thumb - no icons inside */}
      <span
        className={`
          inline-block rounded-full shadow-sm transition-all duration-200 ease-in-out
          ${thumbColorClass}
          ${currentSize.thumb}
          ${checked ? currentSize.translate : "translate-x-0"}
          ${disabled ? "" : "hover:shadow-md"}
        `}
      />
    </button>
  );
};

export default Switch;
