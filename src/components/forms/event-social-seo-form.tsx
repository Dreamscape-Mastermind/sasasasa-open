"use client";

import * as z from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  Music,
  Twitter,
  Youtube,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard";
import { useEffect, useState } from "react";

import { ApiError } from "@/services/api.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const socialSEOSchema = z.object({
  social_media: z.object({
    facebook_url: z
      .string()
      .url("Invalid Facebook URL")
      .optional()
      .or(z.literal("")),
    twitter_url: z
      .string()
      .url("Invalid Twitter URL")
      .optional()
      .or(z.literal("")),
    instagram_url: z
      .string()
      .url("Invalid Instagram URL")
      .optional()
      .or(z.literal("")),
    linkedin_url: z
      .string()
      .url("Invalid LinkedIn URL")
      .optional()
      .or(z.literal("")),
    youtube_url: z
      .string()
      .url("Invalid YouTube URL")
      .optional()
      .or(z.literal("")),
    tiktok_url: z
      .string()
      .url("Invalid TikTok URL")
      .optional()
      .or(z.literal("")),
    discord_url: z
      .string()
      .url("Invalid Discord URL")
      .optional()
      .or(z.literal("")),
    telegram_url: z
      .string()
      .url("Invalid Telegram URL")
      .optional()
      .or(z.literal("")),
    spotify_url: z
      .string()
      .url("Invalid Spotify URL")
      .optional()
      .or(z.literal("")),
    website_url: z
      .string()
      .url("Invalid Website URL")
      .optional()
      .or(z.literal("")),
  }),
  seo: z.object({
    meta_title: z
      .string()
      .max(60, "Meta title should be 60 characters or less")
      .optional(),
    meta_description: z
      .string()
      .max(160, "Meta description should be 160 characters or less")
      .optional(),
    canonical_url: z
      .string()
      .url("Invalid canonical URL")
      .optional()
      .or(z.literal("")),
  }),
});

type SocialSEOFormData = z.infer<typeof socialSEOSchema>;

interface EventSocialSEOFormProps {
  onFormSubmitSuccess: () => void;
  eventId?: string;
  onStepComplete: () => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
  onNext?: () => void;
  canGoNext?: boolean;
  onSkip?: () => void;
  canSkip?: boolean;
}

export default function EventSocialSEOForm({
  onFormSubmitSuccess,
  eventId,
  onStepComplete,
  onPrevious,
  canGoPrevious,
  onNext,
  canGoNext,
  onSkip,
  canSkip = false,
}: EventSocialSEOFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  const { useEvent: useEventQuery, useUpdateEvent } = useEvent();
  const { data: eventData, error: eventError } = useEventQuery(eventId || "");
  const updateEvent = useUpdateEvent(eventId || "");

  const form = useForm<SocialSEOFormData>({
    resolver: zodResolver(socialSEOSchema),
    defaultValues: {
      social_media: {
        facebook_url: "",
        twitter_url: "",
        instagram_url: "",
        linkedin_url: "",
        youtube_url: "",
        tiktok_url: "",
        discord_url: "",
        telegram_url: "",
        spotify_url: "",
        website_url: "",
      },
      seo: {
        meta_title: "",
        meta_description: "",
        canonical_url: "",
      },
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (eventData?.result) {
      form.reset({
        social_media: {
          facebook_url: eventData.result.facebook_url || "",
          twitter_url: eventData.result.twitter_url || "",
          instagram_url: eventData.result.instagram_url || "",
          linkedin_url: eventData.result.linkedin_url || "",
          youtube_url: eventData.result.youtube_url || "",
          tiktok_url: eventData.result.tiktok_url || "",
          discord_url: eventData.result.discord_url || "",
          telegram_url: eventData.result.telegram_url || "",
          spotify_url: eventData.result.spotify_url || "",
          website_url: eventData.result.website_url || "",
        },
        seo: {
          meta_title: eventData.result.meta_title || "",
          meta_description: eventData.result.meta_description || "",
          canonical_url:
            eventData.result.canonical_url ||
            `https://sasasasa.co/e/${eventData.result.short_url}`,
        },
      });
    }
  }, [eventData, form]);

  const onSubmit = async (data: SocialSEOFormData) => {
    if (!eventId) {
      toast.error("Event ID is required");
      return;
    }

    setIsLoading(true);
    setTopError(null);
    try {
      // Clean up empty URLs
      const cleanedSocialMedia = Object.fromEntries(
        Object.entries(data.social_media).filter(
          ([_, value]) => value && value.trim() !== ""
        )
      );

      const cleanedSEO = Object.fromEntries(
        Object.entries(data.seo).filter(
          ([_, value]) => value && value.trim() !== ""
        )
      );

      await updateEvent.mutateAsync({
        ...cleanedSocialMedia,
        ...cleanedSEO,
      });

      toast.success("Social media and SEO updated successfully");
      onStepComplete();
      onFormSubmitSuccess();
    } catch (error) {
      let fallbackMessage = "Failed to update social media and SEO";
      if (error instanceof ApiError) {
        const apiMessage = error.data?.message || error.message;
        const possibleFieldErrors =
          error.data?.result?.errors?.errors || error.data?.errors;
        const errorDetails =
          error.data?.result?.errors?.error_details || error.data?.errors;
        const detail: string | undefined =
          typeof errorDetails?.detail === "string"
            ? errorDetails.detail
            : undefined;

        if (possibleFieldErrors && typeof possibleFieldErrors === "object") {
          Object.entries(possibleFieldErrors as Record<string, any>).forEach(
            ([key, value]) => {
              const message = Array.isArray(value)
                ? String(value[0])
                : typeof value === "string"
                ? value
                : undefined;
              if (!message) return;

              // Support nested keys for our structure social_media.* or seo.*
              if (key in (form.getValues().social_media as any)) {
                form.setError(`social_media.${key}` as any, {
                  type: "server",
                  message,
                });
              } else if (key in (form.getValues().seo as any)) {
                form.setError(`seo.${key}` as any, { type: "server", message });
              }
            }
          );
        }

        setTopError(detail || apiMessage || fallbackMessage);
      } else {
        setTopError(fallbackMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (eventError) {
    return (
      <div className="text-red-500">
        Error loading event data. Please try again.
      </div>
    );
  }

  const socialMedia = form.watch("social_media");
  const seo = form.watch("seo");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Media & SEO</CardTitle>
          <CardDescription>
            Connect your social media accounts and optimize your event for
            search engines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {topError && (
              <Alert variant="destructive">
                <AlertTitle>Could not save changes</AlertTitle>
                <AlertDescription>{topError}</AlertDescription>
              </Alert>
            )}
            {/* Social Media Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media Links
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://facebook.com/yourpage"
                    value={socialMedia.facebook_url}
                    onChange={(e) =>
                      form.setValue("social_media.facebook_url", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-blue-400" />
                    Twitter/X
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://twitter.com/yourhandle"
                    value={socialMedia.twitter_url}
                    onChange={(e) =>
                      form.setValue("social_media.twitter_url", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-600" />
                    Instagram
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://instagram.com/yourhandle"
                    value={socialMedia.instagram_url}
                    onChange={(e) =>
                      form.setValue(
                        "social_media.instagram_url",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    LinkedIn
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://linkedin.com/company/yourcompany"
                    value={socialMedia.linkedin_url}
                    onChange={(e) =>
                      form.setValue("social_media.linkedin_url", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-600" />
                    YouTube
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://youtube.com/yourchannel"
                    value={socialMedia.youtube_url}
                    onChange={(e) =>
                      form.setValue("social_media.youtube_url", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-green-600" />
                    Spotify
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://open.spotify.com/artist/..."
                    value={socialMedia.spotify_url}
                    onChange={(e) =>
                      form.setValue("social_media.spotify_url", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>TikTok</Label>
                  <Input
                    type="url"
                    placeholder="https://tiktok.com/@yourhandle"
                    value={socialMedia.tiktok_url}
                    onChange={(e) =>
                      form.setValue("social_media.tiktok_url", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={socialMedia.website_url}
                    onChange={(e) =>
                      form.setValue("social_media.website_url", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Search Engine Optimization
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input
                    placeholder="Your event title for search engines"
                    value={seo.meta_title}
                    onChange={(e) =>
                      form.setValue("seo.meta_title", e.target.value)
                    }
                    maxLength={60}
                  />
                  <p className="text-sm text-gray-500">
                    {seo.meta_title?.length || 0}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    placeholder="Brief description of your event for search engines"
                    value={seo.meta_description}
                    onChange={(e) =>
                      form.setValue("seo.meta_description", e.target.value)
                    }
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-sm text-gray-500">
                    {seo.meta_description?.length || 0}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Canonical URL</Label>
                  <Input
                    type="url"
                    placeholder="https://sasasasa.com/e/{short_url}"
                    value={seo.canonical_url}
                    onChange={(e) =>
                      form.setValue("seo.canonical_url", e.target.value)
                    }
                    disabled
                  />
                  <p className="text-sm text-gray-500">
                    The preferred URL for this event page (auto-generated)
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between items-center">
              {/* Previous Button - Far Left */}
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              {/* Skip and Next/Submit Buttons - Far Right */}
              <div className="flex gap-2">
                {canSkip && onSkip && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onSkip}
                    disabled={!canGoNext}
                  >
                    Skip
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading || !canGoNext}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save & Next"
                  )}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
