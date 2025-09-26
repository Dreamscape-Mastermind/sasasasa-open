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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 text-foreground">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Premium Header */}
        <div className="text-center space-y-2 sm:space-y-4 mb-6 sm:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 mb-2 sm:mb-4">
            <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Social Media & SEO
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect your social media accounts and optimize your event for
            search engines.
          </p>
        </div>

        {/* Premium Form Grid */}
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <Card className="group border-0 shadow-lg sm:shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
                  <Globe className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                    Social Media & SEO
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                    Connect your social media accounts and optimize your event
                    for search engines
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 sm:space-y-8"
              >
                {topError && (
                  <Alert
                    variant="destructive"
                    className="mb-4 sm:mb-8 border-red-200 bg-red-50 dark:bg-red-950/20"
                  >
                    <AlertTitle className="text-sm sm:text-base text-red-800 dark:text-red-200">
                      Could not save changes
                    </AlertTitle>
                    <AlertDescription className="text-sm text-red-700 dark:text-red-300">
                      {topError}
                    </AlertDescription>
                  </Alert>
                )}
                {/* Social Media Section */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2 sm:gap-3 text-foreground">
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
                    Social Media Links
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                        <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        Facebook
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://facebook.com/yourpage"
                        value={socialMedia.facebook_url}
                        onChange={(e) =>
                          form.setValue(
                            "social_media.facebook_url",
                            e.target.value
                          )
                        }
                        className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                        <Twitter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                        Twitter/X
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://twitter.com/yourhandle"
                        value={socialMedia.twitter_url}
                        onChange={(e) =>
                          form.setValue(
                            "social_media.twitter_url",
                            e.target.value
                          )
                        }
                        className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                        <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
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
                        className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                        <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" />
                        LinkedIn
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://linkedin.com/company/yourcompany"
                        value={socialMedia.linkedin_url}
                        onChange={(e) =>
                          form.setValue(
                            "social_media.linkedin_url",
                            e.target.value
                          )
                        }
                        className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                        <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                        YouTube
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://youtube.com/yourchannel"
                        value={socialMedia.youtube_url}
                        onChange={(e) =>
                          form.setValue(
                            "social_media.youtube_url",
                            e.target.value
                          )
                        }
                        className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                        <Music className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        Spotify
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://open.spotify.com/artist/..."
                        value={socialMedia.spotify_url}
                        onChange={(e) =>
                          form.setValue(
                            "social_media.spotify_url",
                            e.target.value
                          )
                        }
                        className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-foreground">
                        TikTok
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://tiktok.com/@yourhandle"
                        value={socialMedia.tiktok_url}
                        onChange={(e) =>
                          form.setValue(
                            "social_media.tiktok_url",
                            e.target.value
                          )
                        }
                        className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-foreground">
                        Website
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={socialMedia.website_url}
                        onChange={(e) =>
                          form.setValue(
                            "social_media.website_url",
                            e.target.value
                          )
                        }
                        className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Section */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                    Search Engine Optimization
                  </h3>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-foreground">
                        Meta Title
                      </Label>
                      <Input
                        placeholder="Your event title for search engines"
                        value={seo.meta_title}
                        onChange={(e) =>
                          form.setValue("seo.meta_title", e.target.value)
                        }
                        maxLength={60}
                        className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                      />
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {seo.meta_title?.length || 0}/60 characters
                      </p>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-foreground">
                        Meta Description
                      </Label>
                      <Textarea
                        placeholder="Brief description of your event for search engines"
                        value={seo.meta_description}
                        onChange={(e) =>
                          form.setValue("seo.meta_description", e.target.value)
                        }
                        maxLength={160}
                        rows={3}
                        className="min-h-[60px] sm:min-h-[80px] border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base resize-none"
                      />
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {seo.meta_description?.length || 0}/160 characters
                      </p>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-foreground">
                        Canonical URL
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://sasasasa.com/e/{short_url}"
                        value={seo.canonical_url}
                        onChange={(e) =>
                          form.setValue("seo.canonical_url", e.target.value)
                        }
                        disabled
                        className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                      />
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        The preferred URL for this event page (auto-generated)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onPrevious}
                    disabled={!canGoPrevious}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 h-8 sm:h-10 px-4 sm:px-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 rounded-full text-sm font-medium"
                  >
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    Previous
                  </Button>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    {canSkip && onSkip && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={onSkip}
                        disabled={!canGoNext}
                        className="w-full sm:w-auto h-8 sm:h-10 px-4 sm:px-6 text-muted-foreground hover:text-foreground transition-all duration-300 rounded-full text-sm font-medium"
                      >
                        Skip
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isLoading || !canGoNext}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 h-8 sm:h-10 px-6 sm:px-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-300 rounded-full text-sm font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save & Next"
                      )}
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
