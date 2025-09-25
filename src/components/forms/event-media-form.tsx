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
    <div className="space-y-6">
      {topError && (
        <Alert variant="destructive">
          <AlertTitle>Could not upload</AlertTitle>
          <AlertDescription>{topError}</AlertDescription>
        </Alert>
      )}
      {/* Cover Image Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Image</CardTitle>
          <CardDescription>
            Upload a high-quality cover image for your event (recommended:
            1200x630px)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {coverImagePreview ? (
                <div className="relative">
                  <Image
                    src={coverImagePreview}
                    alt="Cover preview"
                    width={400}
                    height={200}
                    className="object-cover rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImagePreview(null);
                      form.setValue("cover_image", null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="mt-4 flex justify-center">
                    <Button
                      type="button"
                      onClick={uploadCoverImageHandler}
                      disabled={isLoading || uploadCoverImage.isPending}
                      className="flex items-center gap-2"
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
                <div className="space-y-4">
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-lg font-medium">Upload cover image</p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, or WebP up to 5MB
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="max-w-xs mx-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Images Section */}
      <Card>
        <CardHeader>
          <CardTitle>Event Gallery</CardTitle>
          <CardDescription>
            Add up to 5 images to showcase your event (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center space-y-4">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium">Upload gallery images</p>
                  <p className="text-sm text-gray-500">
                    Select multiple images (PNG, JPG, or WebP up to 5MB each)
                  </p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="max-w-xs mx-auto"
                />
              </div>
            </div>

            {/* Gallery preview */}
            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden border">
                      <Image
                        src={preview}
                        alt={`Gallery image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          form.setValue("featured_image", index.toString())
                        }
                        className={`absolute bottom-2 right-2 p-1 rounded-full transition-all ${
                          form.watch("featured_image") === index.toString()
                            ? "bg-yellow-500 text-white"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                        aria-label="Set as featured image"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Image description */}
                    <div className="mt-2">
                      <Input
                        placeholder="Add description (optional)"
                        value={form.watch("image_descriptions")[index] || ""}
                        onChange={(e) =>
                          handleImageDescriptionChange(index, e.target.value)
                        }
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {galleryPreviews.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No gallery images uploaded yet
              </p>
            )}

            {/* Gallery Upload Button */}
            {galleryPreviews.length > 0 && (
              <div className="flex justify-center mt-4">
                <Button
                  type="button"
                  onClick={uploadGalleryHandler}
                  disabled={isLoading || uploadGalleryMedia.isPending}
                  className="flex items-center gap-2"
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
          </div>
        </CardContent>
      </Card>

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

        {/* Skip and Next Buttons - Far Right */}
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
            type="button"
            onClick={handleNext}
            disabled={!canGoNext}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
