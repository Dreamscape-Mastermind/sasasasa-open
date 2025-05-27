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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { allTimezones, useTimezoneSelect } from "react-timezone-select";
import { useCreateEvent, useUpdateEvent } from "services/events/mutation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Suspense } from "react";
import { Textarea } from "@/components/ui/textarea";
import { VenueSearchResult } from "utils/dataStructures";
import { cn } from "lib/utils";
import toast from "react-hot-toast";
import { useAuth } from "@/oldContexts/oldAuthContext";
import { useEvent } from "services/events/queries";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

// import toast, { Toaster } from 'react-hot-toast';

const formSchema = z
  .object({
    title: z.string().min(2, {
      message: "Title must be at least 2 characters.",
    }),
    description: z.string().min(10, {
      message: "Description must be at least 10 characters.",
    }),
    start_date: z.date().or(z.string()),
    end_date: z.date().or(z.string()),
    timezone: z.any(),
    venue: z.string().min(2, {
      message: "Venue must be at least 2 characters",
    }),
    capacity: z.coerce.number().min(1, {
      message: "Capacity is required.",
    }),
    cover_image: z.any().optional(),
    facebook_url: z.string().url().optional().or(z.literal("")),
    website_url: z.string().url().optional().or(z.literal("")),
    linkedin_url: z.string().url().optional().or(z.literal("")),
    instagram_url: z.string().url().optional().or(z.literal("")),
    twitter_url: z.string().url().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // Simple date comparison since DatePicker already includes time
      return data.end_date > data.start_date;
    },
    {
      message: "End date and time must be after start date and time",
      path: ["end_date"],
    }
  );

interface TimePickerProps {
  name: string;
  control: Control<any>;
}

const TimePicker = ({ name, control }: TimePickerProps) => {
  const times = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="flex flex-col">
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-[100px] pl-3 text-left font-normal bg-white border-gray-300 hover:bg-gray-100",
                    !field.value && "text-gray-500",
                    fieldState.error && "border-red-500"
                  )}
                >
                  {field.value || "Time"}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search time..." />
                <CommandEmpty>No time found.</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-auto">
                  {times.map((time) => (
                    <CommandItem
                      key={time}
                      value={time}
                      onSelect={(value: string) => field.onChange(value)}
                    >
                      {time}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventFormContent />
    </Suspense>
  );
}

function EventFormContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  // State to track if we are editing an event
  const [isEditing, setIsEditing] = useState(false);

  // Fetch event details if eventId is present
  const { data: eventData, error: eventError } = useEvent(eventId);

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  useEffect(() => {
    if (createEvent.isSuccess) {
      setIsEditing(true); // Set editing mode to true after successful creation
    }
  }, [createEvent.isSuccess]);

  const [venueSearchResults, setVenueSearchResults] = useState<
    VenueSearchResult[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const formData = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      start_date: "",
      end_date: "",
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

  // Populate the form with event data if available
  useEffect(() => {
    if (eventData && eventData.result) {
      formData.setValue("title", eventData.result.title);
      formData.setValue("description", eventData.result.description || "");
      formData.setValue(
        "start_date",
        new Date(eventData.result.start_date || "")
      );
      formData.setValue("end_date", new Date(eventData.result.end_date || ""));
      formData.setValue("venue", eventData.result.venue || "");
      formData.setValue(
        "capacity",
        parseInt(eventData.result.capacity?.toString() || "0", 10)
      );
      formData.setValue("cover_image", eventData.result.cover_image || "");
      formData.setValue("timezone", eventData.result.timezone);
      // Populate other fields as necessary
      setIsEditing(true); // Set editing mode to true if event data is loaded
      setImagePreview(eventData.result.cover_image || "");
      setIsLoading(false);
    }
    if (eventError) {
      console.log({ eventError });
      const errorMessage = eventError?.message.includes("401")
        ? "Session expired, please login again"
        : "An error occurred while fetching event details.";
      toast.error(errorMessage); // Show error toast
      setIsLoading(false); // Set loading to false on error
    }

    if (isAuthenticated && !isAuthLoading) {
      setIsLoading(false);
    }
  }, [eventData, eventError, formData, isAuthenticated, isAuthLoading]); // Run effect when eventData changes

  // const searchVenues = (query: string) => {
  //   if (!query || query.length <= 2) {
  //     setVenueSearchResults([])
  //     return
  //   }
  //   setIsSearching(true)
  //   // Simulated venue search - replace with actual API call
  //   setTimeout(() => {
  //     setVenueSearchResults([
  //       { place_id: '1', description: 'Convention Center' } as VenueSearchResult,
  //       { place_id: '2', description: 'City Hall' },
  //       { place_id: '3', description: 'Sports Arena' },
  //     ])
  //     setIsSearching(false)
  //   }, 1000)
  // }

  // function onSubmit(values: z.infer<typeof formSchema>) {
  //   const startDateTime = combineDateTime(values.start_date, values.start_time);
  //   const endDateTime = combineDateTime(values.end_date, values.end_time);
  //   const data = {
  //     ...values,
  //     start_date: startDateTime,
  //     end_date: endDateTime
  //   }
  //   createEvent.mutate(data);
  //   console.log(data);
  // }
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // Handle form submission logic

    const processedData = {
      ...data,
      // cover_image: imagePreview,
      // start_date: combineDateTime(data.start_date, data.start_time),
      // end_date: combineDateTime(data.end_date, data.end_time),
    };

    console.log({ processedData });

    if (isEditing && eventId) {
      // Call the update function here
      await updateEvent.mutateAsync({ eventId, data: processedData });
    } else {
      await createEvent.mutateAsync(processedData);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        formData.setValue("cover_image", file);
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
          <Form {...formData}>
            <form
              onSubmit={formData.handleSubmit(onSubmit)}
              className="space-y-8"
              encType="multipart/form-data"
            >
              <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
                {/* Image Upload Section */}
                <div className="space-y-4">
                  <div className="rounded-none border-2 border-dashed border-gray-200 dark:border-gray-700 p-4">
                    <FormField
                      control={formData.control}
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
                                    // sizes="(min-width: 66em) 33vw,
                                    //   (min-width: 44em) 50vw,
                                    //   100vw"
                                    // priority
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
                      control={formData.control}
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
                      control={formData.control}
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
                            control={formData.control}
                            name="start_date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col flex-1">
                                <FormLabel className="text-gray-700 dark:text-gray-300">
                                  Start Date & Time
                                </FormLabel>
                                <DatePicker
                                  selected={
                                    field.value ? new Date(field.value) : null
                                  }
                                  onChange={(date) => field.onChange(date)}
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
                            control={formData.control}
                            name="end_date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col flex-1">
                                <FormLabel className="text-gray-700 dark:text-gray-300">
                                  End Date & Time
                                </FormLabel>
                                <DatePicker
                                  selected={
                                    field.value ? new Date(field.value) : null
                                  }
                                  onChange={(date) => field.onChange(date)}
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
                          control={formData.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem className="flex flex-col flex-1">
                              <FormLabel className="text-gray-700 dark:text-gray-300">
                                Timezone
                              </FormLabel>
                              {/* <div className="max-w-full">  */}
                              <CustomTimezoneSelect
                                value={field.value}
                                onChange={(timezone) =>
                                  field.onChange(timezone.value)
                                }
                              />
                              {/* </div> */}
                              {/* <CustomTimezoneSelect value={field.value} onChange={(timezone) => field.onChange(timezone.value)} /> */}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* <FormField
                        control={form.control}
                        name="venue"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-gray-700">Venue</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between bg-gray-50 border-gray-300 rounded-none",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value.name ? field.value.name : "Search for a venue"}
                                    <MapPin className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[400px] p-0">
                                <Command>
                                  <CommandInput
                                    placeholder="Search for a venue..."
                                    onValueChange={searchVenues}
                                  />
                                  <CommandEmpty>No venues found.</CommandEmpty>
                                  <CommandGroup>
                                    {isSearching && (
                                      <div className="flex items-center justify-center p-4">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                      </div>
                                    )}
                                    {venueSearchResults.map((venue) => (
                                      <CommandItem
                                        key={venue.place_id}
                                        value={venue.description}
                                        onSelect={() => {
                                          form.setValue("venue", { name: venue.description, place_id: venue.place_id })
                                        }}
                                      >
                                        <MapPin className="mr-2 h-4 w-4" />
                                        {venue.description}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      /> */}

                    <FormField
                      control={formData.control}
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
                      control={formData.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">
                            Capacity
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter maximum capacity"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              value={field.value?.toString()}
                              className="bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-gray-700 rounded-full"
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
                            control={formData.control}
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
                            control={formData.control}
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
                            control={formData.control}
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
                            control={formData.control}
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
                            control={formData.control}
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
                    >
                      {isEditing ? "Edit Event" : "Create Event"}
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
