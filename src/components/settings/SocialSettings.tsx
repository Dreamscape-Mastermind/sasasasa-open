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
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/components/providers/auth-provider";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLogger } from "@/lib/hooks/useLogger";
import { useUpdateProfile } from "@/lib/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  instagram_handle: z.string().nullable().optional(),
  twitter_handle: z.string().nullable().optional(),
  linkedin_handle: z.string().nullable().optional(),
  tiktok_handle: z.string().nullable().optional(),
  youtube_handle: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
});

export function SocialSettings() {
  const { user } = useAuth();
  const logger = useLogger({ context: "SocialSettings" });
  const { mutate: updateProfileMutation, isPending } = useUpdateProfile();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instagram_handle: "",
      twitter_handle: "",
      linkedin_handle: "",
      tiktok_handle: "",
      youtube_handle: "",
      website: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        instagram_handle: user.instagram_handle || "",
        twitter_handle: user.twitter_handle || "",
        linkedin_handle: user.linkedin_handle || "",
        tiktok_handle: user.tiktok_handle || "",
        youtube_handle: user.youtube_handle || "",
        website: user.website || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      logger.info("Updating general settings", {
        userId: user?.id,
        fields: Object.keys(values),
      });

      trackEvent({
        event: "profile_update",
        userId: user?.id,
        fields: Object.keys(values),
      });

      const formData = new FormData();
      if (values.instagram_handle)
        formData.append("instagram_handle", values.instagram_handle);
      if (values.twitter_handle)
        formData.append("twitter_handle", values.twitter_handle);
      if (values.linkedin_handle)
        formData.append("linkedin_handle", values.linkedin_handle);
      if (values.tiktok_handle)
        formData.append("tiktok_handle", values.tiktok_handle);
      if (values.youtube_handle)
        formData.append("youtube_handle", values.youtube_handle);
      if (values.website) formData.append("website", values.website);

      await updateProfileMutation(formData);

      logger.info("General settings updated successfully", {
        userId: user?.id,
      });

      trackEvent({
        event: "profile_update_success",
        userId: user?.id,
      });
    } catch (error) {
      logger.error("Failed to update general settings", {
        userId: user?.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      trackEvent({
        event: "profile_update_error",
        userId: user?.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>Update your social media links</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="instagram_handle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Handle</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@yourinstagram"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitter_handle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter Handle</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@yourtwitter"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin_handle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Handle</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your-linkedin"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiktok_handle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TikTok Handle</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@yourtiktok"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="youtube_handle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube Handle</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your-youtube"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://yourwebsite.com"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
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
