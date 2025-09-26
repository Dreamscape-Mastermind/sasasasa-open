"use client";

import * as z from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Loader2,
  Star,
  Upload,
  X,
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
import Image from "next/image";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const mediaSchema = z.object({
  cover_image: z
    .union([z.instanceof(File), z.string(), z.null(), z.undefined()])
    .optional(),
  gallery_images: z.array(z.instanceof(File)).default([]),
  featured_image: z.string().optional(),
  image_descriptions: z.array(z.string()).default([]),
});

type MediaFormData = z.infer<typeof mediaSchema>;

interface EventMediaFormProps {
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

export default function EventMediaForm({
  onFormSubmitSuccess,
  eventId,
  onStepComplete,
  onPrevious,
  canGoPrevious,
  onNext,
  canGoNext,
  onSkip,
  canSkip = false,
}: EventMediaFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>(
    []
  );
  const [topError, setTopError] = useState<string | null>(null);

  const {
    useEvent: useEventQuery,
    useUploadCoverImage,
    useUploadGalleryMedia,
  } = useEvent();
  const { data: eventData, error: eventError } = useEventQuery(eventId || "");
  const uploadCoverImage = useUploadCoverImage(eventId || "");
  const uploadGalleryMedia = useUploadGalleryMedia(eventId || "");

  const form = useForm<MediaFormData>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      cover_image: null,
      gallery_images: [],
      featured_image: "",
      image_descriptions: [],
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (eventData?.result) {
      if (eventData.result.cover_image) {
        setCoverImagePreview(eventData.result.cover_image);
        form.setValue("cover_image", eventData.result.cover_image);
      }
    }
  }, [eventData, form]);

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Cover image must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
        form.setValue("cover_image", file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 5) {
      toast.error("You can upload a maximum of 5 gallery images");
      return;
    }

    // Validate all files
    for (const file of files) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload valid image files (JPEG, PNG, or WebP)");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Each gallery image must be less than 5MB");
        return;
      }
    }

    // Create previews and update form
    const newPreviews = files.map((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
      });
    });

    Promise.all(newPreviews).then((previews) => {
      setGalleryPreviews((prev) => [...prev, ...previews]);
      form.setValue("gallery_images", [
        ...form.getValues("gallery_images"),
        ...files,
      ]);

      // Add empty descriptions for new images
      const currentDescriptions = form.getValues("image_descriptions");
      form.setValue("image_descriptions", [
        ...currentDescriptions,
        ...files.map(() => ""),
      ]);
    });
  };

  const handleRemoveGalleryImage = (index: number) => {
    const currentImages = form.getValues("gallery_images");
    const currentDescriptions = form.getValues("image_descriptions");

    // Remove from previews
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));

    // Remove from form values
    form.setValue(
      "gallery_images",
      currentImages.filter((_, i) => i !== index)
    );
    form.setValue(
      "image_descriptions",
      currentDescriptions.filter((_, i) => i !== index)
    );
  };

  const handleImageDescriptionChange = (index: number, description: string) => {
    const currentDescriptions = form.getValues("image_descriptions");
    const newDescriptions = [...currentDescriptions];
    newDescriptions[index] = description;
    form.setValue("image_descriptions", newDescriptions);
  };

  const uploadCoverImageHandler = async () => {
    if (!eventId) {
      toast.error("Event ID is required");
      return;
    }

    const coverImage = form.getValues("cover_image");
    if (!(coverImage instanceof File)) {
      toast.error("Please select a cover image to upload");
      return;
    }

    setIsLoading(true);
    setTopError(null);
    try {
      await uploadCoverImage.mutateAsync({
        cover_image: coverImage,
      });
      toast.success("Cover image uploaded successfully");
    } catch (error) {
      let fallbackMessage = "Failed to upload cover image";
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
          const coverErr = (possibleFieldErrors as any).cover_image;
          if (coverErr) {
            form.setError("cover_image", {
              type: "server",
              message: Array.isArray(coverErr)
                ? String(coverErr[0])
                : String(coverErr),
            });
          }
        }

        setTopError(detail || apiMessage || fallbackMessage);
      } else {
        setTopError(fallbackMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const uploadGalleryHandler = async () => {
    if (!eventId) {
      toast.error("Event ID is required");
      return;
    }

    const galleryImages = form.getValues("gallery_images");
    if (galleryImages.length === 0) {
      toast.error("Please select gallery images to upload");
      return;
    }

    setIsLoading(true);
    setTopError(null);
    try {
      await uploadGalleryMedia.mutateAsync({
        files: galleryImages,
        title: "Event Gallery",
        description: "Event gallery images",
        is_public: true,
      });
      toast.success("Gallery images uploaded successfully");
    } catch (error) {
      let fallbackMessage = "Failed to upload gallery images";
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
          const filesErr = (possibleFieldErrors as any).files;
          if (filesErr) {
            form.setError("gallery_images", {
              type: "server",
              message: Array.isArray(filesErr)
                ? String(filesErr[0])
                : String(filesErr),
            });
          }
        }

        setTopError(detail || apiMessage || fallbackMessage);
      } else {
        setTopError(fallbackMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    onStepComplete();
    onFormSubmitSuccess();
  };

  if (eventError) {
    return (
      <div className="text-red-500">
        Error loading event data. Please try again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 text-foreground">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Premium Header */}
        <div className="text-center space-y-2 sm:space-y-4 mb-6 sm:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 mb-2 sm:mb-4">
            <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Event Media
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Bring your event to life with stunning visuals. Every image tells a
            story.
          </p>
        </div>

        {/* Premium Form Grid */}
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {topError && (
            <Alert
              variant="destructive"
              className="mb-4 sm:mb-8 border-red-200 bg-red-50 dark:bg-red-950/20"
            >
              <AlertTitle className="text-sm sm:text-base text-red-800 dark:text-red-200">
                Could not upload media
              </AlertTitle>
              <AlertDescription className="text-sm text-red-700 dark:text-red-300">
                {topError}
              </AlertDescription>
            </Alert>
          )}

          {/* Section 1: Cover Image */}
          <div className="relative">
            <Card className="group border-0 shadow-lg sm:shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500">
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
                    <ImageIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                      Cover Image
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                      Upload a high-quality cover image (recommended:
                      1200x630px)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50">
                  {coverImagePreview ? (
                    <div className="relative">
                      <Image
                        src={coverImagePreview}
                        alt="Cover preview"
                        width={400}
                        height={200}
                        className="object-cover rounded-lg sm:rounded-xl mx-auto shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImagePreview(null);
                          form.setValue("cover_image", null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 sm:p-2 hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <div className="mt-4 sm:mt-6 flex justify-center">
                        <Button
                          type="button"
                          onClick={uploadCoverImageHandler}
                          disabled={isLoading || uploadCoverImage.isPending}
                          className="flex items-center gap-2 h-8 sm:h-10 px-4 sm:px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 rounded-lg sm:rounded-xl"
                        >
                          {isLoading || uploadCoverImage.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Upload Cover Image
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400" />
                      <div>
                        <p className="text-lg sm:text-xl font-medium text-foreground">
                          Upload cover image
                        </p>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          PNG, JPG, or WebP up to 5MB
                        </p>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="max-w-xs mx-auto h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Gallery Images */}
          <div className="relative">
            <Card className="group border-0 shadow-lg sm:shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500">
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
                    <Upload className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                      Event Gallery
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                      Add up to 5 images to showcase your event (optional)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Upload area */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl p-6 sm:p-8 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50">
                  <div className="text-center space-y-4 sm:space-y-6">
                    <Upload className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg sm:text-xl font-medium text-foreground">
                        Upload gallery images
                      </p>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Select multiple images (PNG, JPG, or WebP up to 5MB
                        each)
                      </p>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      className="max-w-xs mx-auto h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl"
                    />
                  </div>
                </div>

                {/* Gallery preview */}
                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square relative rounded-lg sm:rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                          <Image
                            src={preview}
                            alt={`Gallery image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                          >
                            <X className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              form.setValue("featured_image", index.toString())
                            }
                            className={`absolute bottom-2 right-2 p-1 sm:p-2 rounded-full transition-all shadow-lg ${
                              form.watch("featured_image") === index.toString()
                                ? "bg-yellow-500 text-white"
                                : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                            aria-label="Set as featured image"
                          >
                            <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>

                        {/* Image description */}
                        <div className="mt-2 sm:mt-3">
                          <Input
                            placeholder="Add description (optional)"
                            value={
                              form.watch("image_descriptions")[index] || ""
                            }
                            onChange={(e) =>
                              handleImageDescriptionChange(
                                index,
                                e.target.value
                              )
                            }
                            className="text-sm sm:text-base h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {galleryPreviews.length === 0 && (
                  <p className="text-center text-muted-foreground py-4 sm:py-6 text-sm sm:text-base">
                    No gallery images uploaded yet
                  </p>
                )}

                {/* Gallery Upload Button */}
                {galleryPreviews.length > 0 && (
                  <div className="flex justify-center mt-4 sm:mt-6">
                    <Button
                      type="button"
                      onClick={uploadGalleryHandler}
                      disabled={isLoading || uploadGalleryMedia.isPending}
                      className="flex items-center gap-2 h-8 sm:h-10 px-4 sm:px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 rounded-lg sm:rounded-xl"
                    >
                      {isLoading || uploadGalleryMedia.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload Gallery Images
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-8 sm:h-10 px-6 sm:px-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-300 rounded-full text-sm font-semibold"
            >
              Next
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
