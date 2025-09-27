"use client";
import React, { useState, useRef, useCallback } from "react";
import DarkToggle from "../ui/dark-toggle";
import { BsSun, BsMoon } from "react-icons/bs";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Container } from "../ui/container";
import { config } from "@/config/config";
import Image from "next/image";
import { UserButton } from "../auth/UserButton";

// Type definitions
interface NavigationItem {
  href: string;
  label: string;
  description?: string;
  icon?: string;
}

interface NavigationLink {
  href?: string;
  label: string;
  submenu?: boolean;
  type?: "description" | "simple" | "icon";
  items?: NavigationItem[];
}

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks: NavigationLink[] = [
  { href: "#", label: "Home" },
  { href: "#", label: "Home" },
  {
    label: "Features",
    submenu: true,
    type: "description",
    items: [
      {
        href: "#",
        label: "Components",
        description: "Browse all components in the library.",
      },
      {
        href: "#",
        label: "Documentation",
        description: "Learn how to use the library.",
      },
      {
        href: "#",
        label: "Templates",
        description: "Pre-built layouts for common use cases.",
      },
    ],
  },
  {
    label: "Pricing",
    submenu: true,
    type: "simple",
    items: [
      { href: "#", label: "Product A" },
      { href: "#", label: "Product B" },
      { href: "#", label: "Product C" },
      { href: "#", label: "Product D" },
    ],
  },
  {
    label: "About",
    submenu: true,
    type: "icon",
    items: [
      { href: "#", label: "Getting Started", icon: "BookOpenIcon" },
      { href: "#", label: "Tutorials", icon: "LifeBuoyIcon" },
      { href: "#", label: "About Us", icon: "InfoIcon" },
    ],
  },
];

// Custom hook for managing dropdown state
function useDropdown() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback((itemId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredDropdown(itemId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredDropdown(null);
    }, 150);
  }, []);

  const handleClick = useCallback(
    (itemId: string) => {
      setActiveDropdown(activeDropdown === itemId ? null : itemId);
    },
    [activeDropdown]
  );

  return {
    activeDropdown,
    hoveredDropdown,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
  };
}

export default function Navbar() {
  const {
    activeDropdown,
    hoveredDropdown,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
  } = useDropdown();

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "BookOpenIcon":
        return (
          <svg
            width={16}
            height={16}
            className='text-foreground opacity-60'
            aria-hidden='true'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20' />
          </svg>
        );
      case "LifeBuoyIcon":
        return (
          <svg
            width={16}
            height={16}
            className='text-foreground opacity-60'
            aria-hidden='true'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <circle cx='12' cy='12' r='10' />
            <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
            <path d='M12 17h.01' />
          </svg>
        );
      case "InfoIcon":
        return (
          <svg
            width={16}
            height={16}
            className='text-foreground opacity-60'
            aria-hidden='true'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <circle cx='12' cy='12' r='10' />
            <path d='M12 16v-4' />
            <path d='M12 8h.01' />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderNavItem = (item: NavigationItem, itemIndex: number) => (
    <Link
      key={itemIndex}
      href={item.href}
      className='block py-2 px-3 rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors'
    >
      {item.icon && (
        <div className='flex items-center gap-2'>
          {renderIcon(item.icon)}
          <span>{item.label}</span>
        </div>
      )}
      {item.description ? (
        <div className='space-y-1'>
          <div className='font-medium'>{item.label}</div>
          <p className='text-muted-foreground line-clamp-2 text-xs'>
            {item.description}
          </p>
        </div>
      ) : (
        !item.icon && <span>{item.label}</span>
      )}
    </Link>
  );

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-sm'>
      <Container className='flex h-16 items-center justify-between gap-4'>
        {/* Left side */}
        <div className='flex items-center gap-2 h-full'>
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger className='group size-8 md:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none'>
              <svg
                className='pointer-events-none'
                width={16}
                height={16}
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M4 12L20 12'
                  className='origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]'
                />
                <path
                  d='M4 12H20'
                  className='origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45'
                />
                <path
                  d='M4 12H20'
                  className='origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]'
                />
              </svg>
            </PopoverTrigger>
            <PopoverContent
              align='start'
              className='w-64 p-1 md:hidden bg-background border border-border'
            >
              <nav className='flex flex-col gap-0'>
                {navigationLinks.map((link, index) => (
                  <div key={index} className='w-full'>
                    {link.submenu ? (
                      <>
                        <div className='text-muted-foreground px-2 py-1.5 text-xs font-medium'>
                          {link.label}
                        </div>
                        <div className='space-y-0'>
                          {link.items?.map((item, itemIndex) =>
                            renderNavItem(item, itemIndex)
                          )}
                        </div>
                      </>
                    ) : (
                      <Link
                        href={link.href || "#"}
                        className='block py-1.5 px-2 hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm'
                      >
                        {link.label}
                      </Link>
                    )}
                    {/* Add separator between different types of items */}
                    {index < navigationLinks.length - 1 &&
                      ((!link.submenu && navigationLinks[index + 1].submenu) ||
                        (link.submenu && !navigationLinks[index + 1].submenu) ||
                        (link.submenu &&
                          navigationLinks[index + 1].submenu &&
                          link.type !== navigationLinks[index + 1].type)) && (
                        <div
                          role='separator'
                          aria-orientation='horizontal'
                          className='bg-border -mx-1 my-1 h-px w-full'
                        />
                      )}
                  </div>
                ))}
              </nav>
            </PopoverContent>
          </Popover>

          {/* Main nav */}
          <div className='flex items-center gap-6 h-full'>
            <Link
              href='/'
              className='text-primary hover:text-primary/90 flex items-center gap-4'
            >
              <Image
                src='/logo.png'
                alt={config.app.name}
                width={32}
                height={32}
                className='h-8 w-8'
                priority
              />
              <div className='text-xl font-bold'>{config.app.shortName}</div>
            </Link>

            {/* Desktop Navigation menu */}
            <nav className='hidden md:flex gap-2 h-full'>
              {navigationLinks.map((link, index) => {
                const itemId = `nav-${index}`;
                const isHovered = hoveredDropdown === itemId;
                const isActive = activeDropdown === itemId;
                const showDropdown = isHovered || isActive;

                return (
                  <div
                    key={index}
                    className='relative h-full'
                    onMouseEnter={() =>
                      link.submenu && handleMouseEnter(itemId)
                    }
                    onMouseLeave={handleMouseLeave}
                  >
                    {link.submenu ? (
                      <>
                        <button
                          className='text-muted-foreground h-full hover:text-primary bg-transparent px-2 py-1.5 font-medium relative group inline-flex items-center gap-1'
                          onClick={() => handleClick(itemId)}
                          aria-expanded={showDropdown}
                        >
                          <span className='relative hover:after:content-[""] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-0.5 hover:after:bg-primary hover:after:transition-all'>
                            {link.label}
                          </span>
                          <svg
                            className={cn(
                              "size-3 transition-transform duration-300",
                              showDropdown && "rotate-180"
                            )}
                            aria-hidden='true'
                            viewBox='0 0 15 15'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z'
                              fill='currentColor'
                              fillRule='evenodd'
                              clipRule='evenodd'
                            />
                          </svg>
                        </button>

                        {showDropdown && (
                          <div
                            className={cn(
                              "absolute top-full left-0 z-50 p-4 rounded-md shadow-lg bg-background border border-border",
                              link.type === "description"
                                ? "min-w-64"
                                : "min-w-48"
                            )}
                            onMouseEnter={() => handleMouseEnter(itemId)}
                            onMouseLeave={handleMouseLeave}
                          >
                            <div className='space-y-1'>
                              {link.items?.map((item, itemIndex) =>
                                renderNavItem(item, itemIndex)
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={link.href || "#"}
                        className='text-muted-foreground hover:border-b rounded-none h-full hover:text-primary py-1.5 font-medium relative group inline-flex items-center'
                      >
                        <span className='relative hover:after:content-[""] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-0.5 hover:after:bg-primary hover:after:transition-all'>
                          {link.label}
                        </span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right side */}
        <div className='flex items-center gap-2'>
          <UserButton />
          <DarkToggle
            size='md'
            leftIcon={<BsMoon />}
            rightIcon={<BsSun />}
            thumbColors={{
              checked: "bg-white",
              unchecked: "bg-black",
            }}
            borderColors={{
              checked: "border-white",
              unchecked: "border-gray-400",
            }}
            trackColors={{
              checked: "bg-black",
              unchecked: "bg-white",
            }}
          />
        </div>
      </Container>
    </header>
  );
}
