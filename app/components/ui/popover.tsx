"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Types for positioning and alignment
type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const PopoverContext = React.createContext<PopoverContextType | null>(null);

const usePopover = () => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("usePopover must be used within a Popover");
  }
  return context;
};

// Hook for positioning calculations
const usePopoverPosition = (
  triggerRef: React.RefObject<HTMLElement | null>,
  contentRef: React.RefObject<HTMLDivElement | null>,
  side: Side = "bottom",
  align: Align = "center",
  sideOffset: number = 4
) => {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let top = 0;
    let left = 0;

    // Calculate position based on side
    switch (side) {
      case "top":
        top = triggerRect.top - contentRect.height - sideOffset;
        break;
      case "bottom":
        top = triggerRect.bottom + sideOffset;
        break;
      case "left":
        top = triggerRect.top;
        left = triggerRect.left - contentRect.width - sideOffset;
        break;
      case "right":
        top = triggerRect.top;
        left = triggerRect.right + sideOffset;
        break;
    }

    // Calculate alignment
    switch (align) {
      case "start":
        if (side === "top" || side === "bottom") {
          left = triggerRect.left;
        } else {
          if (side === "left") {
            top = triggerRect.top;
          } else {
            top = triggerRect.top;
          }
        }
        break;
      case "center":
        if (side === "top" || side === "bottom") {
          left =
            triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
        } else {
          if (side === "left") {
            top =
              triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          } else {
            top =
              triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          }
        }
        break;
      case "end":
        if (side === "top" || side === "bottom") {
          left = triggerRect.right - contentRect.width;
        } else {
          if (side === "left") {
            top = triggerRect.bottom - contentRect.height;
          } else {
            top = triggerRect.bottom - contentRect.height;
          }
        }
        break;
    }

    // Keep within viewport bounds
    left = Math.max(8, Math.min(left, viewport.width - contentRect.width - 8));
    top = Math.max(8, Math.min(top, viewport.height - contentRect.height - 8));

    setPosition({ top, left });
  }, [triggerRef, contentRef, side, align, sideOffset]);

  return position;
};

// Hook for click outside detection
const useClickOutside = (
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void
) => {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};

// Hook for escape key detection
const useEscapeKey = (callback: () => void) => {
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        callback();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [callback]);
};

// Main Popover component
interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  ({ open: controlledOpen, onOpenChange, children, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLElement | null>(null);
    const contentRef = React.useRef<HTMLDivElement | null>(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;

    const setOpen = React.useCallback(
      (newOpen: boolean) => {
        if (isControlled) {
          onOpenChange?.(newOpen);
        } else {
          setInternalOpen(newOpen);
        }
      },
      [isControlled, onOpenChange]
    );

    // Close on click outside
    useClickOutside(contentRef, () => setOpen(false));

    // Close on escape key
    useEscapeKey(() => setOpen(false));

    const contextValue = React.useMemo(
      () => ({
        open,
        setOpen,
        triggerRef,
        contentRef,
      }),
      [open, setOpen]
    );

    return (
      <PopoverContext.Provider value={contextValue}>
        <div ref={ref} {...props}>
          {children}
        </div>
      </PopoverContext.Provider>
    );
  }
);
Popover.displayName = "Popover";

// PopoverTrigger component
interface PopoverTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, onClick, asChild = false, ...props }, ref) => {
    const { open, setOpen, triggerRef } = usePopover();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(!open);
      onClick?.(event);
    };

    const composedRef = (node: HTMLElement | null) => {
      if (typeof ref === "function") {
        ref(node as HTMLButtonElement);
      } else if (ref) {
        ref.current = node as HTMLButtonElement;
      }
      if (node) {
        (triggerRef as React.MutableRefObject<HTMLElement>).current = node;
      }
    };

    if (asChild) {
      if (React.isValidElement(children)) {
        return React.cloneElement(
          children as React.ReactElement<Record<string, unknown>>,
          {
            ref: composedRef,
            onClick: handleClick,
            "aria-expanded": open,
            "aria-haspopup": "dialog",
            ...props,
          }
        );
      }
      return null;
    }

    return (
      <button
        ref={composedRef}
        onClick={handleClick}
        aria-expanded={open}
        aria-haspopup='dialog'
        {...props}
      >
        {children}
      </button>
    );
  }
);
PopoverTrigger.displayName = "PopoverTrigger";

// PopoverContent component
interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: Side;
  align?: Align;
  sideOffset?: number;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      className,
      side = "bottom",
      align = "center",
      sideOffset = 4,
      children,
      ...props
    },
    ref
  ) => {
    const { open, triggerRef, contentRef } = usePopover();
    const [mounted, setMounted] = React.useState(false);

    const position = usePopoverPosition(
      triggerRef,
      contentRef,
      side,
      align,
      sideOffset
    );

    React.useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted || !open) return null;

    return (
      <div
        ref={(node) => {
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          if (node) {
            (contentRef as React.MutableRefObject<HTMLDivElement>).current =
              node;
          }
        }}
        className={cn(
          "bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-hidden",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        style={{
          position: "fixed",
          top: position.top,
          left: position.left,
        }}
        role='dialog'
        aria-modal='true'
        {...props}
      >
        {children}
      </div>
    );
  }
);
PopoverContent.displayName = "PopoverContent";

// PopoverAnchor component (simplified version)
interface PopoverAnchorProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const PopoverAnchor = React.forwardRef<HTMLDivElement, PopoverAnchorProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
);
PopoverAnchor.displayName = "PopoverAnchor";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
