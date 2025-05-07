"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useLogin, useUser } from "@/lib/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLogger } from "@/lib/hooks/useLogger";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const logger = useLogger({ context: "LoginForm" });
  const { mutate: login, isPending } = useLogin();
  const redirectTo = searchParams?.get("redirect") || "/dashboard";
  const { data: user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    logger.info("Login attempt", { email: values.email });
    trackEvent({
      event: "login_attempt",
      email: values.email,
    });

    try {
      await login({ identifier: values.email });
      logger.info("Login initiated successfully", { email: values.email });
      trackEvent({
        event: "login_initiated",
        email: values.email,
      });
      router.push(
        `/verify-otp?email=${encodeURIComponent(
          values.email
        )}&redirect=${encodeURIComponent(redirectTo)}`
      );
    } catch (error) {
      logger.error("Login failed", {
        email: values.email,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      trackEvent({
        event: "login_failed",
        email: values.email,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
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

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Code...
            </>
          ) : (
            "Continue with Email"
          )}
        </Button>
      </form>
    </Form>
  );
}
