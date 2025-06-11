"use client";

import "react-datepicker/dist/react-datepicker.css";

import * as z from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard";
import { Control, useForm } from "react-hook-form";
import { Facebook, Instagram, Linkedin, Twitter } from "../social-icons/icons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Globe, ImagePlus, Loader2 } from "lucide-react";
import { allTimezones, useTimezoneSelect } from "react-timezone-select";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";
import { useSearchParams } from "next/navigation";
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
    cover_image: z.any().optional(),
    facebook_url: z.string(),
    website_url: z.string(),
    linkedin_url: z.string(),
    instagram_url: z.string(),
    twitter_url: z.string(),
  })
  .refine(
    (data) => {
      const startDateTime = combineDateTime(data.start_date, data.start_time);
      const endDateTime = combineDateTime(data.end_date, data.end_time);
      return endDateTime > startDateTime;
    },
    {
      message: "End date and time must be after start date and time",
      path: ["end_time"],
    }
  );

function combineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const datetime = new Date(date);
  datetime.setHours(hours, minutes);
  return datetime;
}

interface TimePickerProps {
  name: string;
  control: Control<any>;
}

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
      className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-zinc-800 max-w-full w-full"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default function EventForm() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id") as string;

  // State to track if we are editing an event
  const [isEditing, setIsEditing] = useState(false);

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
  } = useEventQuery(eventId);

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent(eventId);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

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
    if (createEvent.isSuccess) {
      setIsEditing(true); // Set editing mode to true after successful creation
    }
  }, [createEvent.isSuccess]);

  // Populate the form with event data if available
  useEffect(() => {
    if (eventData?.result) {
      form.setValue("title", eventData.result.title);
      form.setValue("description", eventData.result.description);
      form.setValue("start_date", new Date(eventData.result.start_date));
      form.setValue(
        "start_time",
        format(new Date(eventData.result.start_date), "HH:mm")
      );
      form.setValue("end_date", new Date(eventData.result.end_date));
      form.setValue(
        "end_time",
        format(new Date(eventData.result.end_date), "HH:mm")
      );
      form.setValue("venue", eventData.result.venue);
      form.setValue("capacity", eventData.result.capacity);
      form.setValue(
        "cover_image",
        eventData.result.cover_image ? eventData.result.cover_image : ""
      );
      form.setValue("timezone", eventData.result.timezone);
      // Populate other fields as necessary
      setIsEditing(true); // Set editing mode to true if event data is loaded
      setImagePreview(eventData.result.cover_image ?? null);
      setIsLoading(false);
    }
    console.log({ eventError, eventData });
    if (eventError) {
      const errorMessage = eventError?.message.includes("401")
        ? "Session expired, please login again"
        : "An error occurred while fetching event details.";
      toast.error(errorMessage); // Show error toast
      setIsLoading(false); // Set loading to false on error
    }
  }, [eventData, eventError, form]); // Run effect when eventData changes

  const onSubmit = async (data) => {
    console.log("Form submission started");
    console.log("Form data:", data);

    const processedData = {
      ...data,
      start_date: data.start_date.toISOString(),
      end_date: data.end_date.toISOString(),
    };

    console.log("Processed data:", processedData);

    try {
      if (isEditing && eventId) {
        console.log("Updating event with ID:", eventId);
        await updateEvent.mutateAsync(processedData);
      } else {
        console.log("Creating new event");
        await createEvent.mutateAsync(processedData);
      }
      console.log("Form submission successful");
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("cover_image", file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        {isLoading ? ( // Conditional rendering for loading state
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-12 w-12 animate-spin" />{" "}
            {/* Replace with your loading spinner */}
            <p className="ml-2">Loading event details...</p>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={(e) => {
                console.log("Form submit event triggered");
                console.log("Current form state:", {
                  isValid: form.formState.isValid,
                  errors: form.formState.errors,
                  isDirty: form.formState.isDirty,
                  values: form.getValues(),
                });
                form.handleSubmit(
                  (data) => {
                    console.log("Form validation passed, submitting data");
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
                  <div className="rounded-none border-2 border-dashed border-gray-200 dark:border-gray-700 p-4">
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
                                  "aspect-square rounded-none overflow-hidden bg-gray-50 flex items-center justify-center relative",
                                  !imagePreview &&
                                    "border-2 border-dashed border-gray-200"
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
                              <div className="text-xs text-gray-500">
                                Recommended: Square image, at least 1080x1080px
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
                <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200">
                      Event Details
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-200">
                      Fill in the details for the event.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter event title"
                              {...field}
                              className="bg-gray-50 dark:bg-zinc-900 rounded-full border-gray-300 dark:border-gray-700"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter event description..."
                              className="bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-gray-700 min-h-[100px] rounded-lg "
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <div className="bg-gray-50 dark:bg-zinc-900 rounded-none p-4 border border-gray-200 dark:border-gray-700 mt-4">
                      <div className="flex flex-col md:flex-row md:gap-8">
                        <div className="flex items-center gap-3 flex-1">
                          <FormField
                            control={form.control}
                            name="start_date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col flex-1">
                                <FormLabel className="text-gray-700 dark:text-gray-300">
                                  Start Date & Time
                                </FormLabel>
                                <DatePicker
                                  selected={field.value}
                                  onChange={(date) => {
                                    field.onChange(date);
                                    if (date) {
                                      form.setValue(
                                        "start_time",
                                        format(date, "HH:mm")
                                      );
                                    }
                                  }}
                                  className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-zinc-800 rounded-full "
                                  placeholderText="Select start date and time"
                                  dateFormat="MMM d, yyyy h:mm aa"
                                  showTimeSelect
                                  timeFormat="HH:mm"
                                  timeIntervals={30}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex items-center gap-3 flex-1">
                          <FormField
                            control={form.control}
                            name="end_date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col flex-1">
                                <FormLabel className="text-gray-700 dark:text-gray-300">
                                  End Date & Time
                                </FormLabel>
                                <DatePicker
                                  selected={field.value}
                                  onChange={(date) => {
                                    field.onChange(date);
                                    if (date) {
                                      form.setValue(
                                        "end_time",
                                        format(date, "HH:mm")
                                      );
                                    }
                                  }}
                                  className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-zinc-800 rounded-full "
                                  placeholderText="Select end date and time"
                                  dateFormat="MMM d, yyyy h:mm aa"
                                  showTimeSelect
                                  timeFormat="HH:mm"
                                  timeIntervals={30}
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-4">
                        <FormField
                          control={form.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem className="flex flex-col flex-1">
                              <FormLabel className="text-gray-700 dark:text-gray-300">
                                Timezone
                              </FormLabel>
                              <CustomTimezoneSelect
                                value={field.value}
                                onChange={(timezone) =>
                                  field.onChange(timezone.value)
                                }
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="venue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Venue</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter event Venue"
                              {...field}
                              className="bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-gray-700 rounded-full "
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Capacity
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter maximum capacity"
                              {...field}
                              className="bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-gray-700 rounded-full "
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-1">
                        <AccordionTrigger>Social media links?</AccordionTrigger>
                        <AccordionContent>
                          <FormField
                            control={form.control}
                            name="website_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Globe className="w-4 h-4 text-gray-500" />
                                    <Input
                                      {...field}
                                      placeholder="https://your-website.com"
                                      className="dark:bg-zinc-900 dark:border-gray-700 rounded-full "
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="facebook_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Facebook</FormLabel>
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Facebook className="w-4 h-4 text-gray-500" />
                                    <Input
                                      {...field}
                                      placeholder="https://facebook.com/your-page"
                                      className="dark:bg-zinc-900 dark:border-gray-700 rounded-full "
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="instagram_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instagram</FormLabel>
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Instagram className="w-4 h-4 text-gray-500" />
                                    <Input
                                      {...field}
                                      placeholder="https://instagram.com/your-handle"
                                      className="dark:bg-zinc-900 dark:border-gray-700 rounded-full "
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="twitter_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Twitter</FormLabel>
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Twitter className="w-4 h-4 text-gray-500" />
                                    <Input
                                      {...field}
                                      placeholder="https://twitter.com/your-handle"
                                      className="dark:bg-zinc-900 dark:border-gray-700 rounded-full "
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="linkedin_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>LinkedIn</FormLabel>
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Linkedin className="w-4 h-4 text-gray-500" />
                                    <Input
                                      {...field}
                                      placeholder="https://linkedin.com/company/your-page"
                                      className="dark:bg-zinc-900 dark:border-gray-700 rounded-full "
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <Button
                      type="submit"
                      variant="default"
                      className="w-full text-white dark:bg-gray-700 dark:hover:bg-gray-600 mt-4"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditing ? "Updating..." : "Creating..."}
                        </>
                      ) : isEditing ? (
                        "Edit Event"
                      ) : (
                        "Create Event"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
