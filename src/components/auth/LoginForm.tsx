"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs2";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppKit } from "@/contexts/AppKit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { WalletAddress } from "@/components/ui/wallet-address";
import { useAppKitAccount } from "@reown/appkit/react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { useUser } from "@/hooks/useUser";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"email" | "wallet">("email");
  const { loginWithWallet, isAuthenticated } = useAuth();
  const { isConnected, address } = useAppKitAccount();
  const { useLogin } = useUser();
  const loginMutation = useLogin();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || ROUTES.DASHBOARD;

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

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
      const response = await loginMutation.mutateAsync({
        identifier: values.email,
      });

      if (response) {
        router.push(
          `/verify-otp?email=${encodeURIComponent(values.email)}&type=login`
        );
      }
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleStandardLogin = async () => {
    if (!address || !isConnected) return;

    setLoading(true);
    try {
      await loginWithWallet(address as `0x${string}`);
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to login with wallet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
  );
}
