import Image from "next/image";
import { Metadata } from "next";
import Spinner from "@/components/ui/spiner";
import { Suspense } from "react";
import { VerifyOTPForm } from "@/components/auth/VerifyOTPForm";

export const metadata: Metadata = {
  title: "Verify OTP | Sasasasa",
  description:
    "Verify your email address with the OTP code sent to your email.",
  keywords: [
    "verify",
    "otp",
    "authentication",
    "sasasasa",
    "email verification",
  ],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Verify OTP | Sasasasa",
    description:
      "Verify your email address with the OTP code sent to your email.",
    type: "website",
  },
};

export default function VerifyOTP() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Image
              src="/images/sasasasaLogo.png"
              alt="Sasasasa Logo"
              width={150}
              height={50}
              className="mx-auto mb-4"
            />
            <h2 className="mt-6 text-3xl font-bold">Verify Your Email</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
              Enter the verification code sent to your email
            </p>
          </div>

          <Suspense fallback={<Spinner />}>
            <VerifyOTPForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
