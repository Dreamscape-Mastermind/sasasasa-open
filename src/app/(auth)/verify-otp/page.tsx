import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { VerifyOTPForm } from "@/components/auth/VerifyOTPForm";

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full space-y-8">
            <div className="space-y-6">
              <Skeleton className="h-10 w-full rounded-full" />
              <Skeleton className="h-10 w-full rounded-full" />
              <Skeleton className="h-10 w-full rounded-full" />
            </div>
          </div>
        </div>
      }
    >
      <VerifyOTPForm />
    </Suspense>
  );
}
