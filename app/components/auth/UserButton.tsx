"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import {
  BsPerson,
  BsGear,
  BsBoxArrowRight,
  BsShield,
  BsCreditCard,
  BsQuestionCircle,
} from "react-icons/bs";

interface UserButtonProps {
  className?: string;
}

export function UserButton({ className }: UserButtonProps) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    // Preserve theme preference before signing out
    const currentTheme = localStorage.getItem("theme");
    await signOut({ callbackUrl: "/" });
    // Restore theme preference after redirect (this won't execute due to page reload,
    // but the inline script in layout.tsx will handle it)
    if (currentTheme) {
      localStorage.setItem("theme", currentTheme);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show loading state
  if (status === "loading") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className='h-8 w-8 rounded-full bg-gray-200 animate-pulse' />
        <div className='h-4 w-16 bg-gray-200 animate-pulse rounded' />
      </div>
    );
  }

  // Show sign in/register buttons if not authenticated
  if (!session) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          asChild
          variant='ghost'
          size='sm'
          className='text-sm hover:border-b rounded-none'
        >
          <Link href='/login'>Sign In</Link>
        </Button>
        <Button
          asChild
          size='sm'
          className='text-sm hover:border-b rounded-none'
        >
          <Link href='/register'>Get Started</Link>
        </Button>
      </div>
    );
  }

  // Show user menu if authenticated
  const user = session.user;
  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() || "U";

  return (
    <div
      className={`flex items-center gap-2 relative ${className}`}
      ref={dropdownRef}
    >
      <Button
        variant='ghost'
        className='flex items-center gap-2 h-8 px-2 hover:bg-accent'
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar size='md'>
          {user.image && <AvatarImage src={user.image} alt={user.name || ""} />}
          <AvatarFallback className='text-xs'>{userInitials}</AvatarFallback>
        </Avatar>
      </Button>

      {isOpen && (
        <div className='absolute top-full right-0 mt-2 w-56 bg-white dark:bg-black shadow-lg rounded-md z-50 border'>
          <div className='space-y-1 p-1'>
            {/* User info */}
            <div className='px-3 py-2 border-b border-gray-200 dark:border-gray-700'>
              <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                {user.name || "User"}
              </p>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                {user.email}
              </p>
            </div>

            {/* Menu items */}
            <div className='space-y-1'>
              <Button
                variant='ghost'
                className='w-full justify-start h-8 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                asChild
              >
                <Link href='/dashboard' className='flex items-center gap-2'>
                  <BsPerson className='h-4 w-4' />
                  Dashboard
                </Link>
              </Button>

              <Button
                variant='ghost'
                className='w-full justify-start h-8 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                asChild
              >
                <Link
                  href='/dashboard/settings'
                  className='flex items-center gap-2'
                >
                  <BsGear className='h-4 w-4' />
                  Settings
                </Link>
              </Button>

              <Button
                variant='ghost'
                className='w-full justify-start h-8 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                asChild
              >
                <Link
                  href='/dashboard/billing'
                  className='flex items-center gap-2'
                >
                  <BsCreditCard className='h-4 w-4' />
                  Billing
                </Link>
              </Button>

              <Button
                variant='ghost'
                className='w-full justify-start h-8 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                asChild
              >
                <Link
                  href='/dashboard/security'
                  className='flex items-center gap-2'
                >
                  <BsShield className='h-4 w-4' />
                  Security
                </Link>
              </Button>

              <Button
                variant='ghost'
                className='w-full justify-start h-8 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                asChild
              >
                <Link href='/help' className='flex items-center gap-2'>
                  <BsQuestionCircle className='h-4 w-4' />
                  Help
                </Link>
              </Button>

              {/* Separator */}
              <div className='border-t border-gray-200 dark:border-gray-700 my-1' />

              <Button
                variant='ghost'
                className='w-full justify-start h-8 px-3 text-red-600 hover:text-white hover:bg-red-500'
                onClick={handleSignOut}
              >
                <BsBoxArrowRight className='h-4 w-4 mr-2' />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
