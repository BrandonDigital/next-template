"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RegisterSchema, type RegisterFormData } from "@/lib/validation/auth";
import { ZodError } from "zod";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

interface RegisterFormProps {
  callbackUrl?: string;
}

export function RegisterForm({
  callbackUrl = "/dashboard",
}: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setAuthError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      // Validate form data
      const validatedData = RegisterSchema.parse(formData);

      // Create user account
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: validatedData.email,
          password: validatedData.password,
          confirmPassword: validatedData.confirmPassword,
          firstName: validatedData.firstName || null,
          lastName: validatedData.lastName || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "User already exists") {
          setAuthError(
            "An account with this email already exists. Please sign in instead."
          );
        } else {
          setAuthError(
            result.error || "Failed to create account. Please try again."
          );
        }
        return;
      }

      // Auto sign in after successful registration
      const signInResult = await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setAuthError(
          "Account created successfully, but automatic sign-in failed. Please sign in manually."
        );
      } else if (signInResult?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        const fieldErrors: Partial<RegisterFormData> = {};

        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof RegisterFormData] = err.message;
          }
        });

        setErrors(fieldErrors);
      } else {
        setAuthError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center'>
          Create Account
        </CardTitle>
        <CardDescription className='text-center'>
          Enter your information to create a new account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className='space-y-4'>
          {authError && (
            <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm'>
              {authError}
            </div>
          )}

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='firstName'>First Name</Label>
              <Input
                id='firstName'
                name='firstName'
                type='text'
                placeholder='First name'
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className='text-sm text-red-600'>{errors.firstName}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='lastName'>Last Name</Label>
              <Input
                id='lastName'
                name='lastName'
                type='text'
                placeholder='Last name'
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className='text-sm text-red-600'>{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              name='email'
              type='email'
              placeholder='Enter your email'
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "border-red-500" : ""}
              disabled={isLoading}
              required
            />
            {errors.email && (
              <p className='text-sm text-red-600'>{errors.email}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              name='password'
              type='password'
              placeholder='Create a password'
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? "border-red-500" : ""}
              disabled={isLoading}
              required
            />
            {errors.password && (
              <p className='text-sm text-red-600'>{errors.password}</p>
            )}
            <p className='text-xs text-gray-500'>
              Must be at least 8 characters with uppercase, lowercase, and
              number
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <Input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              placeholder='Confirm your password'
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={errors.confirmPassword ? "border-red-500" : ""}
              disabled={isLoading}
              required
            />
            {errors.confirmPassword && (
              <p className='text-sm text-red-600'>{errors.confirmPassword}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className='flex flex-col space-y-4'>
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className='text-center text-sm'>
            <span className='text-gray-600'>Already have an account? </span>
            <Link
              href='/login'
              className='text-blue-600 hover:text-blue-500 hover:underline'
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
