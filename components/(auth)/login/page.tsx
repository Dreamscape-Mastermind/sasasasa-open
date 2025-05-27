"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs2";

import { AppKit } from "@/contexts/AppKit";
import { Button } from "../../ui/button";
import Image from "next/image";
import { Input } from "../../ui/input";
import { WalletAddress } from "@/components/ui/wallet-address";
import { useAppKitAccount } from "@reown/appkit/react";
import { useAuth } from "@/oldContexts/oldAuthContext";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"email" | "wallet">("email");
  const { loginWithWallet } = useAuth();
  const { isConnected, address } = useAppKitAccount();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/accounts/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: values.email,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        router.push(
          `/verify-otp?email=${encodeURIComponent(values.email)}&type=login`
        );
      } else {
        setError(data.error || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleStandardLogin = async () => {
    if (!address || !isConnected) return;

    setLoading(true);
    try {
      await loginWithWallet(address);
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to login with wallet");
    } finally {
      setLoading(false);
    }
  };

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

        <Tabs
          defaultValue="email"
          className="mt-6"
          onValueChange={(value) => setActiveTab(value as "email" | "wallet")}
        >
          <TabsList className="grid w-full grid-cols-2 rounded-3xl">
            <TabsTrigger
              value="email"
              className="text-sm font-medium rounded-3xl"
            >
              Email Login
            </TabsTrigger>
            <TabsTrigger
              value="wallet"
              className="text-sm font-medium rounded-3xl"
            >
              Wallet Login
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-4">
            <Form {...form}>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="rounded-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending Code..." : "Continue with Email"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="wallet" className="mt-4">
            {!isConnected ? (
              <div className="flex justify-center">
                <AppKit />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="mt-4">
                  <WalletAddress
                    address={address || ""}
                    showChainId={false}
                    showIcon={true}
                    size="md"
                  />
                </div>

                <Button
                  className="w-full transition-colors"
                  onClick={handleStandardLogin}
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In with Wallet"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
