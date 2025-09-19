"use client";

import * as z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormProvider, useForm } from "react-hook-form";
import { ImagePlus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { EventDateTimeForm } from "./event-form-parts/EventDateTimeForm";
import { EventDetailsForm } from "./event-form-parts/EventDetailsForm";
import { EventSocialLinksForm } from "./event-form-parts/EventSocialLinksForm";
import { EventVenueCapacityForm } from "./event-form-parts/EventVenueCapacityForm";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z
  .object({
    title: z.string().min(2, {
      message: "Title must be at least 2 characters.",
    }),
    description: z.string().min(10, {
      message: "Description must be at least 10 characters.",
    }),
    start_date: z.date(),
    start_time: z.string().min(1, { message: "Start time is required" }),
    end_date: z.date(),
    end_time: z.string().min(1, { message: "End time is required" }),
    timezone: z.any(),
    venue: z.string().min(2, {
      message: "Venue must be at least 2 characters",
    }),
    capacity: z.coerce.number().nonnegative("Capacity is required."),
    cover_image: z
      .union([z.instanceof(File), z.string(), z.null(), z.undefined()])
      .optional(),
    facebook_url: z.string().optional(),
    website_url: z.string().optional(),
    linkedin_url: z.string().optional(),
    instagram_url: z.string().optional(),
    twitter_url: z.string().optional(),
  })
  .refine(
    (data) => {
      const startDateTime = new Date(data.start_date);
      const [startHours, startMinutes] = data.start_time.split(":").map(Number);
      startDateTime.setHours(startHours, startMinutes);

      const endDateTime = new Date(data.end_date);
      const [endHours, endMinutes] = data.end_time.split(":").map(Number);
      endDateTime.setHours(endHours, endMinutes);

      return endDateTime > startDateTime;
    },
    {
      message: "End date and time must be after start date and time",
      path: ["end_time"],
    }
  );

export default function EventForm({
  onFormSubmitSuccess,
  eventId,
}: {
  onFormSubmitSuccess?: () => void;
  eventId?: string;
}) {
  const router = useRouter();
  // State to track image handling
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [imageAction, setImageAction] = useState<"keep" | "upload" | "remove">(
    "keep"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [preservedFormData, setPreservedFormData] = useState<any>(null);

  // Get the event hooks
  const {
    useEvent: useEventQuery,
    useCreateEvent,
    useUpdateEvent,
  } = useEvent();

  // Fetch event details if eventId is present
  const {
    data: eventData,
    error: eventError,
    isLoading: loading,
  } = useEventQuery(eventId || "");

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent(eventId || "");
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      venue: "",
      cover_image: "",
      capacity: 0,
      facebook_url: "",
      website_url: "",
      linkedin_url: "",
      instagram_url: "",
      twitter_url: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  useEffect(() => {
    if (createEvent.isSuccess && createEvent.data?.result?.id) {
      const newEventId = createEvent.data.result.id;
      setIsEditing(true);

      // Store current form data in React state and sessionStorage
      const currentFormData = form.getValues();
      setPreservedFormData(currentFormData);
      sessionStorage.setItem("eventFormData", JSON.stringify(currentFormData));

      // Use Next.js router for navigation instead of window.history
      router.replace(ROUTES.DASHBOARD_EVENT_EDIT(newEventId));

      // Call success callback after navigation
      setTimeout(() => {
        onFormSubmitSuccess?.();
      }, 100);
    }
  }, [
    createEvent.isSuccess,
    createEvent.data,
    router,
    onFormSubmitSuccess,
    form,
  ]);

  // Cleanup sessionStorage on unmount
  useEffect(() => {
    return () => {
      // Clear React state
      setPreservedFormData(null);

      // Only clear sessionStorage if we're not in the middle of a navigation
      if (!createEvent.isSuccess) {
        sessionStorage.removeItem("eventFormData");
      }
    };
  }, [createEvent.isSuccess]);

  // Populate the form with event data if available
  useEffect(() => {
    if (eventData?.result) {
      setIsLoading(true);

      // Check if we have preserved form data from create mode
      if (preservedFormData && !isEditing) {
        // Use React state first
        form.reset(preservedFormData);
        setPreservedFormData(null); // Clear after use
        sessionStorage.removeItem("eventFormData"); // Clean up
      } else {
        // Check sessionStorage as fallback
        const storedData = sessionStorage.getItem("eventFormData");
        if (storedData && !isEditing) {
          try {
            const parsedData = JSON.parse(storedData);
            form.reset(parsedData);
            sessionStorage.removeItem("eventFormData"); // Clean up
          } catch (error) {
            console.warn("Failed to restore preserved form data:", error);
          }
        } else {
          // Use server data for edit mode
          form.reset({
            title: eventData.result.title,
            description: eventData.result.description,
            start_date: new Date(eventData.result.start_date),
            start_time: new Date(
              eventData.result.start_date
            ).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            end_date: new Date(eventData.result.end_date),
            end_time: new Date(eventData.result.end_date).toLocaleTimeString(
              "en-US",
              { hour: "2-digit", minute: "2-digit", hour12: false }
            ),
            timezone: eventData.result.timezone,
            venue: eventData.result.venue,
            capacity: eventData.result.capacity,
            facebook_url: eventData.result.facebook_url || "",
            website_url: eventData.result.website_url || "",
            linkedin_url: eventData.result.linkedin_url || "",
            instagram_url: eventData.result.instagram_url || "",
            twitter_url: eventData.result.twitter_url || "",
          });
        }
      }

      const existingImageUrl = eventData.result.cover_image;
      if (existingImageUrl) {
        setOriginalImageUrl(existingImageUrl);
        setImagePreview(existingImageUrl);
        form.setValue("cover_image", existingImageUrl);
        setImageAction("keep");
      } else {
        setOriginalImageUrl(null);
        setImagePreview(null);
        form.setValue("cover_image", null);
        setImageAction("keep");
      }

      setIsEditing(true);
      setIsLoading(false);
    }

    if (eventError) {
      const errorMessage = eventError?.message.includes("401")
        ? "Session expired, please login again"
        : "An error occurred while fetching event details.";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  }, [eventData, eventError, form, isEditing, preservedFormData]);

  const onSubmit = async (data) => {
    // Create processed data with proper date formatting
    let processedData = {
      ...data,
      start_date: data.start_date.toISOString(),
      end_date: data.end_date.toISOString(),
    };

    // Handle image based on action
    switch (imageAction) {
      case "keep":
        // Don't modify cover_image - keep existing URL or undefined
        if (isEditing && originalImageUrl) {
          processedData.cover_image = originalImageUrl;
        }
        break;
      case "upload":
        // File object is already in data.cover_image
        break;
      case "remove":
        processedData.cover_image = null;
        break;
    }

    // Remove empty social media URLs to avoid sending empty strings
    const socialFields = [
      "facebook_url",
      "website_url",
      "linkedin_url",
      "instagram_url",
      "twitter_url",
    ];
    socialFields.forEach((field) => {
      if (!processedData[field] || processedData[field].trim() === "") {
        delete processedData[field];
      }
    });

    try {
      if (isEditing && eventId) {
        await updateEvent.mutateAsync(processedData);
        toast.success("Event updated successfully!");
      } else {
        await createEvent.mutateAsync(processedData);
        toast.success("Event created successfully!");
        // Navigation will be handled by the useEffect above
      }
    } catch (error) {
      console.error("Form submission failed:", error);
      const errorMessage =
        error?.message || "An error occurred while saving the event";
      toast.error(errorMessage);
    }
  };

  const handleRevertToDraft = undefined as unknown as () => Promise<void>;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error("Image file must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("cover_image", file);
        setImageAction("upload");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue("cover_image", null);
    setImageAction("remove");
  };

  const handleRestoreImage = () => {
    if (originalImageUrl) {
      setImagePreview(originalImageUrl);
      form.setValue("cover_image", originalImageUrl);
      setImageAction("keep");
    }
  };

  return (
    <div className="min-h-screen bg-card text-gray-900 p-2">
      <div className="max-w-6xl mx-auto">
        {isLoading ? ( // Conditional rendering for loading state
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-12 w-12 animate-spin" />{" "}
            {/* Replace with your loading spinner */}
            <p className="ml-2">Loading event details...</p>
          </div>
        ) : (
          <FormProvider {...form}>
            <form
              onSubmit={(e) => {
                form.handleSubmit(
                  (data) => {
                    onSubmit(data);
                  },
                  (errors) => {
                    console.log("Form validation failed:", errors);
                  }
                )(e);
              }}
              className="space-y-8"
              encType="multipart/form-data"
            >
              <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
                {/* Image Upload Section */}
                <div className="space-y-4">
                  <div className="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 p-4">
                    <FormField
                      control={form.control}
                      name="cover_image"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Event Image</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <div
                                className={cn(
                                  "aspect-square rounded-none overflow-hidden flex items-center justify-center relative",
                                  !imagePreview &&
                                    "border-2 border-dashed border-gray-200 dark:border-gray-700"
                                )}
                              >
                                {imagePreview ? (
                                  <Image
                                    src={imagePreview}
                                    alt="Event preview"
                                    fill
                                    className="object-cover"
                                    sizes="(min-width: 66em) 33vw,
                                      (min-width: 44em) 50vw,
                                      100vw"
                                    priority
                                  />
                                ) : (
                                  <div className="text-center p-4">
                                    <ImagePlus className="h-12 w-12 mx-auto text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">
                                      Upload event image
                                    </p>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  onChange={handleImageUpload}
                                  {...field}
                                />
                              </div>

                              {/* Image action buttons */}
                              {imagePreview && (
                                <div className="flex gap-2 text-xs">
                                  <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                  >
                                    Remove Image
                                  </button>
                                  {originalImageUrl &&
                                    imageAction !== "keep" && (
                                      <button
                                        type="button"
                                        onClick={handleRestoreImage}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                      >
                                        Restore Original
                                      </button>
                                    )}
                                </div>
                              )}

                              <div className="text-xs text-gray-500">
                                Recommended: Square image, at least 1080x1080px
                                {imageAction === "upload" && (
                                  <div className="text-green-600 mt-1">
                                    ✓ New image will be uploaded
                                  </div>
                                )}
                                {imageAction === "remove" && (
                                  <div className="text-red-600 mt-1">
                                    ⚠ Image will be removed
                                  </div>
                                )}
                                {imageAction === "keep" && originalImageUrl && (
                                  <div className="text-blue-600 mt-1">
                                    ℹ Keeping existing image
                                  </div>
                                )}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Event Details Form */}
                <Card className="rounded-lg shadow-md">
                  <CardHeader>
                    <CardTitle className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200">
                      {eventData?.result?.title
                        ? `${eventData?.result?.title.substring(0, 20)}`
                        : "New Event"}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-200">
                      Fill in the details for the event.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EventDetailsForm />
                    <EventDateTimeForm />
                    <EventVenueCapacityForm />
                    <EventSocialLinksForm />

                    <Button
                      type="submit"
                      variant="default"
                      className="w-full text-white mt-4"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditing ? "Updating..." : "Creating..."}
                        </>
                      ) : isEditing ? (
                        "Update Event"
                      ) : (
                        "Create Event"
                      )}
                    </Button>
                    {false}
                  </CardContent>
                </Card>
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
}
