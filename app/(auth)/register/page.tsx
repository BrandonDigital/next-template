import React from "react";
import { RegisterForm } from "@/app/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md'>
        <RegisterForm />
      </div>
    </div>
  );
}
