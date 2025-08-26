"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { OTPVerificationRequest, ResendOtpRequest } from "@/types/user";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Confetti from "react-confetti";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { useUser } from "@/hooks/useUser";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import siteMetadata from "@/config/siteMetadata";

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be 6 digits" })
    .regex(/^\d+$/, { message: "OTP must contain only numbers" }),
});

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const checkmarkVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

export function VerifyOTPForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") as string;
  const type = searchParams.get("type") as string;
  const redirectTo = searchParams.get("redirect") || ROUTES.DASHBOARD;
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const { completeOtpVerification, isAuthenticated } = useAuth();
  const { useVerifyOtp, useResendOtp } = useUser();
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

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

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (!showConfetti && !showWelcomeDialog) {
      const timer = setTimeout(() => setShowWelcomeDialog(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti, showWelcomeDialog]);

  const handleResendOTP = async () => {
    if (!email || resendOtpMutation.isPending || countdown > 0) return;

    setError("");

    try {
      const data: ResendOtpRequest = { identifier: email };
      await resendOtpMutation.mutateAsync(data);
      setSuccess("We sent another verification code. Please check your email.");
      setCountdown(60);
    } catch (error: any) {
      console.error("Error:", error);
      setError(
        error.message ||
          "Failed to resend verification code. Please try again shortly."
      );
    }
  };

  async function onSubmit(values: z.infer<typeof otpSchema>) {
    if (!email) return;

    setError("");
    setSuccess("");

    try {
      const data: OTPVerificationRequest = {
        identifier: email,
        otp: values.otp,
      };

      const response = await verifyOtpMutation.mutateAsync(data);
      const verifiedOTP = await completeOtpVerification(response);

      if (!verifiedOTP) {
        throw new Error("Invalid OTP");
      }

      setSuccess("Email verified successfully!");

      if (type === "waitlist") {
        setShowConfetti(true);
        setShowWelcomeDialog(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
        return
      } else {
        // For login type, redirect to dashboard after successful verification
        router.replace(redirectTo);
      }
    } catch (error: any) {
      // Handle specific error messages from the API
      if (error?.data?.message === "Invalid or expired OTP") {
        setError(
          "The verification code is invalid or has expired. Please try again or request a new code."
        );
      } else if (error?.message === "Network error occurred") {
        setError(
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else {
        setError(
          error?.data?.message ||
            error?.message ||
            "An error occurred. Please try again."
        );
      }

      // Clear the OTP input field on error
      form.setValue("otp", "");
    }
  }

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
      {showConfetti && <Confetti />}
      <div className="max-w-md w-full space-y-2">
        <div className="text-center">
          <Image
            src={siteMetadata.siteLogo}
            alt="Sasasasa Logo"
            width={120}
            height={40}
            className="mx-auto mb-2 sm:mb-4"
          />
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold">
            Please Confirm Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
            Please enter the verification code sent to {email}.{" "}
            <small className="text-gray-400">
              OTP code is valid for 10 minutes.
            </small>
          </p>
        </div>

        <Form {...form}>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-500 text-sm text-center">{success}</p>
          )}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 sm:mt-8 space-y-4 sm:space-y-6"
          >
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

            <div className="space-y-2 sm:space-y-3">
              <Button
                type="submit"
                className="w-full h-12 sm:h-14 text-base sm:text-lg"
                disabled={verifyOtpMutation.isPending}
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify Email"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 sm:h-14 text-base sm:text-lg"
                onClick={handleResendOTP}
                disabled={resendOtpMutation.isPending || countdown > 0}
              >
                {resendOtpMutation.isPending
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend (${countdown}s)`
                  : "Resend Code"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="p-2 sm:p-4"
          >
            <DialogHeader className="space-y-6">
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  variants={checkmarkVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center justify-center w-16 h-16"
                >
                  <Image
                    src="/images/sasasasaLogo.png"
                    alt="Sasasasa Logo"
                    width={120}
                    height={40}
                    className="mb-4"
                  />
                </motion.div>
                <DialogTitle className="text-2xl font-bold mt-4">
                  Welcome to Sasasasa🎉
                </DialogTitle>
              </div>

              <DialogDescription className="space-y-3 text-sm sm:text-base">
                <motion.div
                  variants={fadeIn}
                  transition={{ delay: 0.2 }}
                  className="bg-red-50/50 dark:bg-red-950/10 p-4 rounded-lg border border-red-100/50 dark:border-red-900/20"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 mt-1">
                      <CheckCircle2 className="w-full h-full text-green-500" />
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 ml-3">
                      Thank you for joining our waitlist and newsletter. Your
                      early support means a lot to us!
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeIn}
                  transition={{ delay: 0.3 }}
                  className="bg-red-50/50 dark:bg-red-950/10 p-4 rounded-lg border border-red-100/50 dark:border-red-900/20"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 mt-1">
                      <CheckCircle2 className="w-full h-full text-green-500" />
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 ml-3">
                      You'll be among the first to know about our new features
                      and updates plus great offers and deals on your favourite
                      events.
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeIn}
                  transition={{ delay: 0.4 }}
                  className="bg-red-50/50 dark:bg-red-950/10 p-4 rounded-lg border border-red-100/50 dark:border-red-900/20"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 mt-1">
                      <CheckCircle2 className="w-full h-full text-green-500" />
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 ml-3">
                      Event offers and tickets will be dropping soon, check your
                      email for updates from{" "}
                      <a
                        href="mailto:info@sasasasa.co"
                        className="text-[#CC322D] hover:underline"
                      >
                        info@sasasasa.co
                      </a>
                    </div>
                  </div>
                </motion.div>
              </DialogDescription>
            </DialogHeader>

            <motion.div
              className="mt-6 flex justify-center"
              variants={fadeIn}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={() => setShowWelcomeDialog(false)}
                className="px-8 py-2 bg-gradient-to-r from-[#CC322D] to-[#a71712] hover:from-[#CC322D]/90 hover:to-[#e9322c]/90 text-white rounded-full transition-all duration-200 transform hover:scale-105"
              >
                Got it, thanks!
              </Button>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
