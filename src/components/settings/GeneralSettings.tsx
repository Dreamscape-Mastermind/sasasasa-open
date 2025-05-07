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
import ImageCropper, {
  FileWithPreview,
  ImageType,
} from "@/components/ui/ImageCropper";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/components/providers/auth-provider";
import { useForm } from "react-hook-form";
import { useLogger } from "@/lib/hooks/useLogger";
import { useUpdateProfile } from "@/lib/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  avatar: z.any().optional(),
  bio: z.string().nullable().optional(),
});

export function GeneralSettings() {
  const { user } = useAuth();
  const logger = useLogger({ context: "GeneralSettings" });
  const { mutate: updateProfileMutation, isPending } = useUpdateProfile();

  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(
    null
  );
  const [showCropper, setShowCropper] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      avatar: null,
      bio: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || null,
        bio: user.bio || "",
      });

      // Set selectedFile from user avatar if it exists
      if (user.avatar) {
        fetch(user.avatar)
          .then((response) => response.blob())
          .then((blob) => {
            const file = new File([blob], "avatar.jpg", { type: blob.type });
            const fileWithPreview = Object.assign(file, {
              preview: user.avatar || "",
            });
            setSelectedFile(fileWithPreview);
          })
          .catch((error) => {
            logger.error("Failed to load user avatar", { error });
          });
      } else {
        setSelectedFile(null);
      }
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
      if (values.first_name) formData.append("first_name", values.first_name);
      if (values.last_name) formData.append("last_name", values.last_name);
      if (values.email) formData.append("email", values.email);
      if (values.phone) formData.append("phone", values.phone);
      if (values.avatar) formData.append("avatar", values.avatar);
      if (values.bio) formData.append("bio", values.bio);

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
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile information and how it appears to others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-2 mb-6">
            <ImageCropper
              dialogOpen={showCropper}
              setDialogOpen={setShowCropper}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              onImageEdited={(blob) => {
                form.setValue("avatar", blob);
                setShowCropper(false);
              }}
              imageType={ImageType.AVATAR}
            />
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Avatar</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const fileWithPreview = Object.assign(file, {
                            preview: URL.createObjectURL(file),
                          });
                          setSelectedFile(fileWithPreview);
                          setShowCropper(true);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-6 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your first name"
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
                  name="last_name"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your last name"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
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
