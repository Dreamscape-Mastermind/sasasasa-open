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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/components/providers/auth-provider";
import { useLogger } from "@/lib/hooks/useLogger";
import { useUpdateProfile } from "@/lib/hooks/useAuth";

const formSchema = z.object({
  timezone: z.string(),
  currency: z.string(),
});

export function PreferencesSettings() {
  const { user } = useAuth();
  const logger = useLogger({ context: "PreferencesSettings" });
  const { mutate: updateProfileMutation, isPending } = useUpdateProfile();
  const [preferences, setPreferences] = useState({
    timezone: "eat",
    currency: "kes",
  });

  useEffect(() => {
    if (user?.preferences) {
      try {
        const userPrefs =
          typeof user.preferences === "string"
            ? JSON.parse(user.preferences)
            : user.preferences;
        setPreferences({
          timezone: userPrefs.timezone || "eat",
          currency: userPrefs.currency || "kes",
        });
      } catch (error) {
        logger.error("Failed to parse user preferences", { error });
      }
    }
  }, [user]);

  const handlePreferenceChange = async (field: string, value: string) => {
    try {
      const newPreferences = { ...preferences, [field]: value };
      setPreferences(newPreferences);

      logger.info("Updating preferences", {
        userId: user?.id,
        field,
        value,
      });

      trackEvent({
        event: "preferences_update",
        userId: user?.id,
        field,
        value,
      });

      const formData = new FormData();
      formData.append("preferences", JSON.stringify(newPreferences));

      await updateProfileMutation(formData);

      logger.info("Preferences updated successfully", {
        userId: user?.id,
      });

      trackEvent({
        event: "preferences_update_success",
        userId: user?.id,
      });
    } catch (error) {
      logger.error("Failed to update preferences", {
        userId: user?.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      trackEvent({
        event: "preferences_update_error",
        userId: user?.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize your event management experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Time Zone</Label>
              <span className="text-sm text-muted-foreground">
                Set your preferred time zone
              </span>
            </div>
            <Select
              value={preferences.timezone}
              onValueChange={(value) =>
                handlePreferenceChange("timezone", value)
              }
              disabled={isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eat">East Africa Time (EAT)</SelectItem>
                <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                <SelectItem value="cst">Central Time (CST)</SelectItem>
                <SelectItem value="est">Eastern Time (EST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Currency</Label>
              <span className="text-sm text-muted-foreground">
                Set your preferred currency for transactions
              </span>
            </div>
            <Select
              value={preferences.currency}
              onValueChange={(value) =>
                handlePreferenceChange("currency", value)
              }
              disabled={isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kes">KES (KSH)</SelectItem>
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="eur">EUR (€)</SelectItem>
                <SelectItem value="gbp">GBP (£)</SelectItem>
                <SelectItem value="cad">CAD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
