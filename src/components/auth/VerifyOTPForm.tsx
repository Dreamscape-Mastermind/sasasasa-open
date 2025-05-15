"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be 6 digits" })
    .regex(/^\d+$/, { message: "OTP must contain only numbers" }),
});

export function VerifyOTPForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyOTP, resendOTP, isLoading, isAuthenticated, error } = useAuth();
  const email = searchParams?.get("email");
  const redirectTo = searchParams?.get("redirect") || ROUTES.DASHBOARD;

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(values: z.infer<typeof otpSchema>) {
    if (!email) return;
    await verifyOTP(email, values.otp);
  }

  const handleResendOTP = async () => {
    if (!email) return;
    await resendOTP(email);
    form.setValue("otp", "");
  };

  // Show loading spinner when checking authentication or email
  if (!email || isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Enter 6-digit code"
                  className="text-center text-lg tracking-widest rounded-full"
                  maxLength={6}
                  minLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label="Enter verification code"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="text-sm text-red-500 text-center">{error}</div>
        )}

        <div className="space-y-3">
          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isLoading || !form.formState.isValid}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base"
            onClick={handleResendOTP}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Resend Code"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
