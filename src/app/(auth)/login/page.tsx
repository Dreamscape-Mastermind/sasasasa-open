import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/images/sasasasaLogo.png"
            alt="Sasasasa Logo"
            width={150}
            height={50}
            className="mx-auto mb-4"
          />
          <h2 className="mt-6 text-3xl font-bold">Welcome to Sasasasa</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
            Sign in to get started
          </p>
        </div>

        <Suspense
          fallback={
            <div className="max-w-md w-full space-y-8">
              <div className="space-y-6">
                <Skeleton className="h-10 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
