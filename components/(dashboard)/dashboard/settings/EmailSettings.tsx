"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Loader2, Mail } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "@/oldContexts/oldAuthContext";
import { useCreateQueryString } from "@/lib/utils";

export default function EmailSettings() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailSettingsContent />
    </Suspense>
  );
}

function EmailSettingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const createQueryString = useCreateQueryString();

  const { user, getAccessToken } = useAuth();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Pre-fill email if user has one
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  // Show OTP input if we're in verify-email mode
  useEffect(() => {
    if (action === "verify-email" && !showOtpInput) {
      setShowOtpInput(true);
    }
  }, [action]);

  const handleLinkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLinking(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/web3/add_email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAccessToken()}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        toast.success("OTP sent to your email");
        setShowOtpInput(true);
        const newQueryString = createQueryString("action", "verify-email");
        router.push(`${pathname}?${newQueryString}`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Email linking error:", error);
      toast.error("Failed to send OTP");
    } finally {
      setIsLinking(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/web3/verify_email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAccessToken()}`,
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      if (response.ok) {
        toast.success("Email verified successfully");
        // Refresh the page or update user state
        router.push("/dashboard/settings");
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to verify email");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      toast.error("Failed to verify email");
    } finally {
      setIsVerifying(false);
    }
  };

  // Render verified email state
  if (user?.is_verified && action !== "verify-email") {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Settings
            </CardTitle>
            <CardDescription>Your email has been verified</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{user.email}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Render email verification UI
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Settings
          </CardTitle>
          <CardDescription>
            Link and verify your email address to enable additional features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showOtpInput ? (
            <motion.form
              onSubmit={handleLinkEmail}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <Button type="submit" disabled={isLinking} className="w-full">
                {isLinking ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending OTP...
                  </span>
                ) : (
                  "Link Email"
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.form
              onSubmit={handleVerifyEmail}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <Button type="submit" disabled={isVerifying} className="w-full">
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Verify Email
                  </span>
                )}
              </Button>
            </motion.form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
