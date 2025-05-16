import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";
import Spinner from "@/components/ui/spiner";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login | Sasasasa",
  description:
    "Login to your Sasasasa account to access your events, tickets, and more.",
  keywords: ["login", "authentication", "sasasasa", "events", "tickets"],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Login | Sasasasa",
    description:
      "Login to your Sasasasa account to access your events, tickets, and more.",
    type: "website",
  },
};

export default function Page() {
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
            <h2 className="mt-6 text-3xl font-bold">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
              Enter your email to receive a verification code
            </p>
          </div>
          <Suspense fallback={<Spinner />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
