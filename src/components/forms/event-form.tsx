"use client";

import * as z from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Info,
  Layers,
  MapPin,
  Plus,
  Shield,
  Tag,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard";
import { FormProvider, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allTimezones, useTimezoneSelect } from "react-timezone-select";
import { useEffect, useState } from "react";

import { ApiError } from "@/services/api.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import LocationSearchMap from "./event-form-parts/LocationSearchMap";
import { ROUTES } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import styles from "@/components/Datepicker.module.css";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useWatch } from "react-hook-form";
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
    // Categorization fields
    category: z.string().min(1, "Please select a category"),
    event_type: z.string().optional(),
    format: z.string().min(1, "Please select an event format"),
    tags_input: z.array(z.string()).default([]),
    age_restriction: z.string().optional(),
    content_rating: z.string().optional(),
    minimum_age: z
      .union([
        z.string().transform((val) => (val === "" ? null : Number(val))),
        z.number(),
        z.null(),
      ])
      .refine(
        (val) =>
          val === null || (typeof val === "number" && val >= 0 && val <= 120),
        {
          message: "Minimum age must be between 0 and 120",
        }
      )
      .optional(),
    maximum_age: z
      .union([
        z.string().transform((val) => (val === "" ? null : Number(val))),
        z.number(),
        z.null(),
      ])
      .refine(
        (val) =>
          val === null || (typeof val === "number" && val >= 0 && val <= 120),
        {
          message: "Maximum age must be between 0 and 120",
        }
      )
      .optional(),
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
  onStepComplete,
  onPrevious,
  canGoPrevious,
  onNext,
  canGoNext,
  onSkip,
  canSkip,
}: {
  onFormSubmitSuccess?: () => void;
  eventId?: string;
  onStepComplete?: () => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
  onNext?: () => void;
  canGoNext?: boolean;
  onSkip?: () => void;
  canSkip?: boolean;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preservedFormData, setPreservedFormData] = useState<any>(null);
  const [topError, setTopError] = useState<string | null>(null);
  // State for tags
  const [tagInput, setTagInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // API hooks for categories, types, formats, tags with prefetching
  const {
    useCategories,
    useEventTypes,
    useEventFormats,
    useEventTags,
    useTagSearch,
  } = useEvent();

  // Prefetch all categorization data for better UX
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const { data: eventTypesData, isLoading: typesLoading } = useEventTypes();
  const { data: eventFormatsData, isLoading: formatsLoading } =
    useEventFormats();
  const { data: eventTagsData, isLoading: tagsLoading } = useEventTags();

  // Debounced search for tag autocomplete
  const [debouncedTagSearch, setDebouncedTagSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTagSearch(tagInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [tagInput]);

  // Tag search query
  const { data: tagSearchData, isLoading: tagSearchLoading } = useTagSearch(
    { search: debouncedTagSearch, limit: 10 },
    { enabled: debouncedTagSearch.length >= 2 }
  );

  // Get the event hooks
  const {
    useEvent: useEventQuery,
    useCreateEvent,
    useUpdateEvent,
  } = useEvent();

  // Check if any categorization data is still loading
  const isCategorizationLoading =
    categoriesLoading || typesLoading || formatsLoading || tagsLoading;

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
      capacity: 0,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      category: "",
      event_type: "",
      format: "",
      tags_input: [],
      age_restriction: "",
      content_rating: "",
      minimum_age: null,
      maximum_age: null,
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
        onStepComplete?.();
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
            // Categorization fields
            category: eventData.result.category?.id || "",
            event_type: eventData.result.event_type?.id || "",
            format: eventData.result.format?.id || "",
            tags_input:
              eventData.result.tags?.map((tag: any) =>
                typeof tag === "string" ? tag : tag.name
              ) || [],
            age_restriction: eventData.result.age_restriction || "",
            content_rating: eventData.result.content_rating || "",
            minimum_age: eventData.result.minimum_age || null,
            maximum_age: eventData.result.maximum_age || null,
          });
        }
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

    // Remove empty categorization fields
    const categorizationFields = [
      "age_restriction",
      "content_rating",
      "event_type",
    ];
    categorizationFields.forEach((field) => {
      if (!processedData[field] || processedData[field].trim() === "") {
        delete processedData[field];
      }
    });

    // Tags are now handled as strings (names) - the API will auto-create them
    // No conversion needed for tags_input

    // Handle age fields - set to null if empty
    if (
      processedData.minimum_age === undefined ||
      processedData.minimum_age === null
    ) {
      processedData.minimum_age = null;
    }
    if (
      processedData.maximum_age === undefined ||
      processedData.maximum_age === null
    ) {
      processedData.maximum_age = null;
    }

    try {
      if (isEditing && eventId) {
        setTopError(null);
        await updateEvent.mutateAsync(processedData);
        toast.success("Event updated successfully!");
        onStepComplete?.();
        onFormSubmitSuccess?.();
      } else {
        setTopError(null);
        await createEvent.mutateAsync(processedData);
        toast.success("Event created successfully!");
        // Navigation will be handled by the useEffect above
      }
    } catch (error) {
      let fallbackMessage = "Failed to save event";
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

              const fieldMap: Record<string, keyof z.infer<typeof formSchema>> =
                {
                  title: "title",
                  description: "description",
                  start_date: "start_date",
                  end_date: "end_date",
                  start_time: "start_time",
                  end_time: "end_time",
                  timezone: "timezone" as any,
                  venue: "venue",
                  capacity: "capacity",
                  category: "category",
                  event_type: "event_type",
                  format: "format",
                  minimum_age: "minimum_age",
                  maximum_age: "maximum_age",
                };
              const mapped = fieldMap[key];
              if (mapped) {
                // @ts-ignore generic index
                form.setError(mapped as any, { type: "server", message });
              }
            }
          );
        }

        setTopError(detail || apiMessage || fallbackMessage);
      } else {
        setTopError(fallbackMessage);
      }
    }
  };

  const handleRevertToDraft = undefined as unknown as () => Promise<void>;

  // Tag management functions
  const handleAddTag = (tagName?: string) => {
    const tagToAdd = tagName || tagInput.trim();
    if (tagToAdd && !form.getValues("tags_input").includes(tagToAdd)) {
      const currentTags = form.getValues("tags_input");
      form.setValue("tags_input", [...currentTags, tagToAdd]);
      setTagInput("");
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    setShowSuggestions(value.length >= 2);
    setSelectedSuggestionIndex(-1);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags_input");
    form.setValue(
      "tags_input",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && tagSearchData?.result?.results) {
        const selectedTag =
          tagSearchData.result.results[selectedSuggestionIndex];
        handleAddTag(selectedTag.name);
      } else {
        handleAddTag();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (tagSearchData?.result?.results) {
        setSelectedSuggestionIndex((prev) =>
          prev < tagSearchData.result!.results.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  // Watch age restriction and content rating changes
  const ageRestriction = useWatch({
    control: form.control,
    name: "age_restriction",
  });
  const contentRating = useWatch({
    control: form.control,
    name: "content_rating",
  });

  // Age restriction mappings
  const getAgeRestrictionRange = (restriction: string) => {
    const mappings = {
      "18+": { min: 18, max: null },
      "21+": { min: 21, max: null },
      "all-ages": { min: 0, max: null },
      "family-friendly": { min: 0, max: 17 },
      mature: { min: 18, max: null },
    };
    return mappings[restriction] || { min: null, max: null };
  };

  // Content rating mappings (fallback)
  const getContentRatingRange = (rating: string) => {
    const mappings = {
      G: { min: 0, max: null },
      PG: { min: 8, max: null },
      "PG-13": { min: 13, max: null },
      R: { min: 17, max: null },
      "NC-17": { min: 18, max: null },
    };
    return mappings[rating] || { min: null, max: null };
  };

  // Get age range based on selections
  const getAgeRange = (ageRestriction: string, contentRating: string) => {
    const restrictionRange = getAgeRestrictionRange(ageRestriction);
    const ratingRange = getContentRatingRange(contentRating);

    // Prioritize age restriction over content rating
    return restrictionRange.min !== null ? restrictionRange : ratingRange;
  };

  // Auto-populate age fields
  const updateAgeFields = (ageRange: {
    min: number | null;
    max: number | null;
  }) => {
    if (ageRange.min !== null) {
      form.setValue("minimum_age", ageRange.min);
    }
    if (ageRange.max !== null) {
      form.setValue("maximum_age", ageRange.max);
    } else {
      // Set to null for "no limit" cases
      form.setValue("maximum_age", null);
    }
  };

  // Effect to auto-populate age fields when selections change
  useEffect(() => {
    if (ageRestriction || contentRating) {
      const ageRange = getAgeRange(ageRestriction || "", contentRating || "");
      updateAgeFields(ageRange);
    }
  }, [ageRestriction, contentRating, form]);

  // Determine if age fields should be shown
  const shouldShowAgeFields = () => {
    return (
      ageRestriction !== "none" ||
      (contentRating && contentRating !== "not-rated")
    );
  };

  // Timezone setup
  const labelStyle = "original";
  const timezones = {
    ...allTimezones,
    "Europe/Berlin": "Frankfurt",
  };

  const CustomTimezoneSelect = ({ onChange, value }) => {
    const { options, parseTimezone } = useTimezoneSelect({
      labelStyle,
      timezones,
    });

    return (
      <select
        value={value}
        onChange={(e) => onChange(parseTimezone(e.currentTarget.value))}
        className="flex h-8 sm:h-10 w-full rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 text-foreground">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {isLoading ? ( // Conditional rendering for loading state
          <div className="flex justify-center items-center h-64 sm:h-96">
            <div className="text-center space-y-2 sm:space-y-4">
              <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin mx-auto text-red-500" />
              <p className="text-sm sm:text-base text-muted-foreground">
                Loading event details...
              </p>
            </div>
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
              className="space-y-4 sm:space-y-8"
              encType="multipart/form-data"
            >
              {topError && (
                <Alert
                  variant="destructive"
                  className="mb-4 sm:mb-8 border-red-200 bg-red-50 dark:bg-red-950/20"
                >
                  <AlertTitle className="text-sm sm:text-base text-red-800 dark:text-red-200">
                    Could not save event
                  </AlertTitle>
                  <AlertDescription className="text-sm text-red-700 dark:text-red-300">
                    {topError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Premium Header */}
              <div className="text-center space-y-2 sm:space-y-4 mb-6 sm:mb-12">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 mb-2 sm:mb-4">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  {eventData?.result?.title
                    ? `${eventData?.result?.title.substring(0, 30)}`
                    : "Create New Event"}
                </h1>
                <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Craft your perfect event with our intuitive form. Every detail
                  matters.
                </p>
              </div>

              {/* Premium Form Grid - Single Column with Timeline */}
              <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                {/* Section 1: Basic Information */}
                <div className="relative">
                  {/* Timeline connector */}
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-red-500 to-red-300 opacity-50"></div>
                  {/* Basic Information */}
                  <Card className="group border-0 shadow-lg sm:shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="pb-3 sm:pb-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
                          <Info className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                            Basic Information
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                            Tell us about your event
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      <div className="space-y-2 sm:space-y-3">
                        <Label
                          htmlFor="title"
                          className="text-xs sm:text-sm font-semibold text-foreground"
                        >
                          Event Title
                        </Label>
                        <Input
                          id="title"
                          placeholder="Enter a compelling event title"
                          {...form.register("title")}
                          className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                        />
                        {form.formState.errors.title && (
                          <p className="text-xs sm:text-sm text-red-500 font-medium">
                            {form.formState.errors.title.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label
                          htmlFor="description"
                          className="text-xs sm:text-sm font-semibold text-foreground"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Describe what makes your event special..."
                          {...form.register("description")}
                          className="min-h-[60px] sm:min-h-[80px] border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base resize-none"
                          rows={3}
                        />
                        {form.formState.errors.description && (
                          <p className="text-xs sm:text-sm text-red-500 font-medium">
                            {form.formState.errors.description.message}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Section 2: Categorization */}
                <div className="relative">
                  {/* Timeline connector */}
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-red-500 to-red-300 opacity-50"></div>

                  <Card className="group border-0 shadow-lg sm:shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="pb-3 sm:pb-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
                          <Layers className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                            Categorization
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                            Help people find your event
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      {isCategorizationLoading && (
                        <div className="flex items-center justify-center py-4 sm:py-8">
                          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2 sm:mr-3 text-red-500" />
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Loading categories...
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3">
                          <Label
                            htmlFor="category"
                            className="text-xs sm:text-sm font-semibold text-foreground"
                          >
                            Category *
                          </Label>
                          <Select
                            value={form.watch("category") || undefined}
                            onValueChange={(value) =>
                              form.setValue("category", value)
                            }
                          >
                            <SelectTrigger className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categoriesData?.result?.results?.map(
                                (category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.category && (
                            <p className="text-xs sm:text-sm text-red-500 font-medium">
                              {form.formState.errors.category.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label
                            htmlFor="event_type"
                            className="text-xs sm:text-sm font-semibold text-foreground"
                          >
                            Event Type
                          </Label>
                          <Select
                            value={form.watch("event_type") || undefined}
                            onValueChange={(value) =>
                              form.setValue("event_type", value)
                            }
                          >
                            <SelectTrigger className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base">
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                            <SelectContent>
                              {eventTypesData?.result?.results?.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.event_type && (
                            <p className="text-xs sm:text-sm text-red-500 font-medium">
                              {form.formState.errors.event_type.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label
                            htmlFor="format"
                            className="text-xs sm:text-sm font-semibold text-foreground"
                          >
                            Event Format *
                          </Label>
                          <Select
                            value={form.watch("format") || undefined}
                            onValueChange={(value) =>
                              form.setValue("format", value)
                            }
                          >
                            <SelectTrigger className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base">
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              {eventFormatsData?.result?.results?.map(
                                (format) => (
                                  <SelectItem key={format.id} value={format.id}>
                                    {format.name}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.format && (
                            <p className="text-xs sm:text-sm text-red-500 font-medium">
                              {form.formState.errors.format.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Section 3: Date & Time */}
                <div className="relative">
                  {/* Timeline connector */}
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-red-500 to-red-300 opacity-50"></div>

                  <Card className="group border-0 shadow-lg sm:shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="pb-3 sm:pb-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
                          <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                            Date & Time
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                            When will your event take place?
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3">
                          <Label
                            htmlFor="start_date"
                            className="text-xs sm:text-sm font-semibold text-foreground"
                          >
                            Start Date & Time
                          </Label>
                          <DatePicker
                            selected={form.watch("start_date")}
                            onChange={(date) => {
                              if (date) {
                                form.setValue("start_date", date);
                                form.setValue(
                                  "start_time",
                                  format(date, "HH:mm")
                                );
                              }
                            }}
                            className="flex h-8 sm:h-10 w-full rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300"
                            placeholderText="Select start date and time"
                            dateFormat="MMM d, yyyy h:mm aa"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={30}
                            popperClassName={styles.customDatepicker}
                          />
                          {form.formState.errors.start_date && (
                            <p className="text-xs sm:text-sm text-red-500 font-medium">
                              {form.formState.errors.start_date.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label
                            htmlFor="end_date"
                            className="text-xs sm:text-sm font-semibold text-foreground"
                          >
                            End Date & Time
                          </Label>
                          <DatePicker
                            selected={form.watch("end_date")}
                            onChange={(date) => {
                              if (date) {
                                form.setValue("end_date", date);
                                form.setValue(
                                  "end_time",
                                  format(date, "HH:mm")
                                );
                              }
                            }}
                            className="flex h-8 sm:h-10 w-full rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300"
                            placeholderText="Select end date and time"
                            dateFormat="MMM d, yyyy h:mm aa"
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={30}
                            popperClassName={styles.customDatepicker}
                          />
                          {form.formState.errors.end_date && (
                            <p className="text-xs sm:text-sm text-red-500 font-medium">
                              {form.formState.errors.end_date.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label
                            htmlFor="timezone"
                            className="text-xs sm:text-sm font-semibold text-foreground"
                          >
                            Timezone
                          </Label>
                          <CustomTimezoneSelect
                            value={form.watch("timezone")}
                            onChange={(timezone) =>
                              form.setValue("timezone", timezone.value)
                            }
                          />
                          {form.formState.errors.timezone && (
                            <p className="text-xs sm:text-sm text-red-500 font-medium">
                              {String(form.formState.errors.timezone.message)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Section 4: Venue & Capacity */}
                <div className="relative">
                  {/* Timeline connector */}
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-red-500 to-red-300 opacity-50"></div>

                  <Card className="group border-0 shadow-lg sm:shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="pb-3 sm:pb-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
                          <MapPin className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                            Venue & Capacity
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                            Where and how many people?
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3">
                          <Label
                            htmlFor="venue"
                            className="text-xs sm:text-sm font-semibold text-foreground"
                          >
                            Venue Name
                          </Label>
                          <Input
                            id="venue"
                            placeholder="Enter venue name or address"
                            {...form.register("venue")}
                            className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                          />
                          {form.formState.errors.venue && (
                            <p className="text-xs sm:text-sm text-red-500 font-medium">
                              {form.formState.errors.venue.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label
                            htmlFor="capacity"
                            className="text-xs sm:text-sm font-semibold text-foreground"
                          >
                            Maximum Capacity
                          </Label>
                          <Input
                            id="capacity"
                            type="number"
                            placeholder="Enter maximum number of attendees"
                            {...form.register("capacity", {
                              valueAsNumber: true,
                            })}
                            className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                          />
                          {form.formState.errors.capacity && (
                            <p className="text-xs sm:text-sm text-red-500 font-medium">
                              {form.formState.errors.capacity.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-6">
                        <LocationSearchMap
                          initialName={form.watch("venue")}
                          onSelect={(location) => {
                            form.setValue("venue", location.name);
                            console.log({ location });
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Section 5: Age & Content Settings */}
                <div className="relative">
                  {/* Timeline connector */}
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-red-500 to-red-300 opacity-50"></div>
                  <Card className="group border-0 shadow-lg sm:shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="pb-3 sm:pb-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
                          <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                            Age & Content
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                            Set age restrictions and content rating
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      <div className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2 sm:space-y-3">
                            <Label
                              htmlFor="age_restriction"
                              className="text-xs sm:text-sm font-semibold text-foreground"
                            >
                              Age Restriction
                            </Label>
                            <Select
                              value={form.watch("age_restriction") || undefined}
                              onValueChange={(value) =>
                                form.setValue("age_restriction", value)
                              }
                            >
                              <SelectTrigger className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base">
                                <SelectValue placeholder="Select restriction" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  No restriction
                                </SelectItem>
                                <SelectItem value="18+">18+</SelectItem>
                                <SelectItem value="21+">21+</SelectItem>
                                <SelectItem value="all-ages">
                                  All Ages
                                </SelectItem>
                                <SelectItem value="family-friendly">
                                  Family Friendly
                                </SelectItem>
                                <SelectItem value="mature">
                                  Mature Content
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <Label
                              htmlFor="content_rating"
                              className="text-xs sm:text-sm font-semibold text-foreground"
                            >
                              Content Rating
                            </Label>
                            <Select
                              value={form.watch("content_rating") || undefined}
                              onValueChange={(value) =>
                                form.setValue("content_rating", value)
                              }
                            >
                              <SelectTrigger className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base">
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not-rated">
                                  Not rated
                                </SelectItem>
                                <SelectItem value="G">G - General</SelectItem>
                                <SelectItem value="PG">
                                  PG - Parental Guidance
                                </SelectItem>
                                <SelectItem value="PG-13">PG-13</SelectItem>
                                <SelectItem value="R">
                                  R - Restricted
                                </SelectItem>
                                <SelectItem value="NC-17">NC-17</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {shouldShowAgeFields() && (
                          <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                              <div className="space-y-2 sm:space-y-3">
                                <Label
                                  htmlFor="minimum_age"
                                  className="text-xs sm:text-sm font-semibold text-foreground"
                                >
                                  Minimum Age
                                  {ageRestriction && (
                                    <span className="text-xs text-muted-foreground ml-1 sm:ml-2">
                                      (Auto-set)
                                    </span>
                                  )}
                                </Label>
                                <Input
                                  id="minimum_age"
                                  type="number"
                                  placeholder="0"
                                  {...form.register("minimum_age", {
                                    setValueAs: (value) => {
                                      if (
                                        value === "" ||
                                        value === null ||
                                        value === undefined
                                      ) {
                                        return null;
                                      }
                                      const num = Number(value);
                                      return isNaN(num) ? null : num;
                                    },
                                  })}
                                  className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                                  disabled={Boolean(
                                    ageRestriction && ageRestriction !== "none"
                                  )}
                                />
                              </div>

                              <div className="space-y-2 sm:space-y-3">
                                <Label
                                  htmlFor="maximum_age"
                                  className="text-xs sm:text-sm font-semibold text-foreground"
                                >
                                  Maximum Age
                                  {ageRestriction === "family-friendly" && (
                                    <span className="text-xs text-muted-foreground ml-1 sm:ml-2">
                                      (Auto-set)
                                    </span>
                                  )}
                                </Label>
                                <Input
                                  id="maximum_age"
                                  type="number"
                                  placeholder="No limit"
                                  {...form.register("maximum_age", {
                                    setValueAs: (value) => {
                                      if (
                                        value === "" ||
                                        value === null ||
                                        value === undefined
                                      ) {
                                        return null;
                                      }
                                      const num = Number(value);
                                      return isNaN(num) ? null : num;
                                    },
                                  })}
                                  className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                                  disabled={Boolean(
                                    ageRestriction === "family-friendly"
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Section 6: Event Tags */}
                <div className="relative">
                  {/* Timeline connector */}
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-red-500 to-red-300 opacity-50"></div>

                  <Card className="group border-0 shadow-lg sm:shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="pb-3 sm:pb-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
                          <Tag className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                            Event Tags
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                            Add tags to help people discover your event
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      <div className="relative">
                        <div className="flex gap-2 sm:gap-3">
                          <Input
                            placeholder="Add a tag..."
                            value={tagInput}
                            onChange={handleTagInputChange}
                            onKeyDown={handleKeyPress}
                            onFocus={() =>
                              setShowSuggestions(tagInput.length >= 2)
                            }
                            onBlur={() => {
                              setTimeout(() => setShowSuggestions(false), 200);
                            }}
                            className="flex-1 h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                          />
                          <Button
                            type="button"
                            onClick={() => handleAddTag()}
                            size="sm"
                            className="h-8 sm:h-10 px-3 sm:px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 rounded-lg sm:rounded-xl"
                          >
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </div>

                        {/* Autocomplete Suggestions */}
                        {showSuggestions &&
                          tagSearchData?.result?.results &&
                          tagSearchData.result.results.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-1 sm:mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl shadow-xl max-h-48 sm:max-h-60 overflow-y-auto">
                              {tagSearchData.result.results.map(
                                (tag, index) => (
                                  <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => handleAddTag(tag.name)}
                                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors ${
                                      index === selectedSuggestionIndex
                                        ? "bg-gray-50 dark:bg-gray-700"
                                        : ""
                                    }`}
                                  >
                                    <span className="text-xs sm:text-sm font-medium">
                                      {tag.name}
                                    </span>
                                    {tag.is_trending && (
                                      <span className="text-xs text-red-500 font-bold">
                                        🔥
                                      </span>
                                    )}
                                  </button>
                                )
                              )}
                            </div>
                          )}

                        {/* Loading indicator */}
                        {tagSearchLoading && tagInput.length >= 2 && (
                          <div className="absolute top-full left-0 right-0 z-50 mt-1 sm:mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl shadow-xl p-3 sm:p-4">
                            <div className="flex items-center justify-center">
                              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2 sm:mr-3 text-red-500" />
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                Searching tags...
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {form.watch("tags_input").map((tag: any) => {
                          const tagName =
                            typeof tag === "string" ? tag : tag?.name || "";
                          return (
                            <Badge
                              key={tagName}
                              variant="secondary"
                              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 px-2 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium"
                            >
                              {tagName}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tagName)}
                                className="ml-1 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              >
                                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
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
                  {canSkip && (
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
                    variant="default"
                    disabled={isLoading || !canGoNext}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 h-8 sm:h-10 px-6 sm:px-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-300 rounded-full text-sm font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        {isEditing ? "Update & Next" : "Create & Next"}
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
}
