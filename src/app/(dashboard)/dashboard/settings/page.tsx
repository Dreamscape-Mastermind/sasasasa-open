"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs2";

import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { SocialSettings } from "@/components/settings/SocialSettings";
import { useAuth } from "@/components/providers/auth-provider";
import { useEffect } from "react";
import { useLogger } from "@/lib/hooks/useLogger";

export default function SettingsPage() {
  const logger = useLogger({ context: "SettingsPage" });
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (user) {
      logger.info("User accessed settings page", {
        userId: user.id,
        email: user.email,
      });
    }
  }, [user, logger]);

  const handleTabChange = (value: string) => {
    logger.info("Settings tab changed", {
      tab: value,
      userId: user?.id,
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs
        defaultValue="general"
        className="space-y-6"
        onValueChange={handleTabChange}
      >
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="social">
          <SocialSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
