"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useResendOTP, useUser, useVerifyOTP } from "@/lib/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLogger } from "@/lib/hooks/useLogger";
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
  const logger = useLogger({ context: "VerifyOTPForm" });
  const email = searchParams?.get("email");
  const redirectTo = searchParams?.get("redirect") || "/dashboard";
  const { mutate: verifyOTP, isPending: isVerifying } = useVerifyOTP();
  const { mutate: resendOTP, isPending: isResending } = useResendOTP();
  const { data: user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(values: z.infer<typeof otpSchema>) {
    if (!email) return;

    logger.info("OTP verification attempt", { email });
    trackEvent({
      event: "otp_verification_attempt",
      email,
    });

    try {
      await verifyOTP({ identifier: email, otp: values.otp });
      logger.info("OTP verified successfully", { email });
      trackEvent({
        event: "otp_verified",
        email,
      });
      toast.success("Welcome back! We're glad to see you again.");
      router.push(redirectTo);
    } catch (error) {
      logger.error("OTP verification failed", {
        email,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      trackEvent({
        event: "otp_verification_failed",
        email,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  const handleResendOTP = () => {
    if (!email || isResending) return;

    logger.info("Resending OTP", { email });
    trackEvent({
      event: "otp_resend_attempt",
      email,
    });

    resendOTP(
      { identifier: email },
      {
        onSuccess: () => {
          logger.info("OTP resent successfully", { email });
          trackEvent({
            event: "otp_resent",
            email,
          });
        },
        onError: (error) => {
          logger.error("OTP resend failed", {
            email,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          trackEvent({
            event: "otp_resend_failed",
            email,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        },
      }
    );
  };

  if (!email) return null;

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
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify Email"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base"
            onClick={handleResendOTP}
            disabled={isResending}
          >
            {isResending ? "Sending..." : "Resend Code"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
