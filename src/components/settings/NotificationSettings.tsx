"use client";

import * as z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/components/providers/auth-provider";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLogger } from "@/lib/hooks/useLogger";
import { useUpdateProfile } from "@/lib/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  securityAlerts: z.boolean(),
});

export function NotificationSettings() {
  const { user } = useAuth();
  const logger = useLogger({ context: "NotificationSettings" });
  const { mutate: updateProfileMutation, isPending } = useUpdateProfile();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      securityAlerts: true,
    },
  });

  useEffect(() => {
    if (user?.notification_settings) {
      try {
        const settings =
          typeof user.notification_settings === "string"
            ? JSON.parse(user.notification_settings)
            : user.notification_settings;

        form.reset({
          emailNotifications: settings.email ?? true,
          pushNotifications: settings.push ?? true,
          marketingEmails: settings.marketing ?? false,
          securityAlerts: settings.security ?? true,
        });
      } catch (error) {
        logger.error("Failed to parse notification settings", { error });
      }
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      logger.info("Updating notification settings", {
        userId: user?.id,
        preferences: values,
      });

      trackEvent({
        event: "notification_settings_update",
        userId: user?.id,
        preferences: values,
      });

      const formData = new FormData();
      const notificationSettings = {
        email: values.emailNotifications,
        push: values.pushNotifications,
        marketing: values.marketingEmails,
        security: values.securityAlerts,
      };

      formData.append(
        "notification_settings",
        JSON.stringify(notificationSettings)
      );

      await updateProfileMutation(formData);

      logger.info("Notification settings updated successfully", {
        userId: user?.id,
      });

      trackEvent({
        event: "notification_settings_update_success",
        userId: user?.id,
      });
    } catch (error) {
      logger.error("Failed to update notification settings", {
        userId: user?.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      trackEvent({
        event: "notification_settings_update_error",
        userId: user?.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Update your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Email Notifications</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600
             data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary
             data-[state=checked]:border-primary dark:data-[state=checked]:border-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pushNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Push Notifications</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600
             data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary
             data-[state=checked]:border-primary dark:data-[state=checked]:border-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketingEmails"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Marketing Emails</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600
             data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary
             data-[state=checked]:border-primary dark:data-[state=checked]:border-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="securityAlerts"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Security Alerts</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600
             data-[state=checked]:bg-primary dark:data-[state=checked]:bg-primary
             data-[state=checked]:border-primary dark:data-[state=checked]:border-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
