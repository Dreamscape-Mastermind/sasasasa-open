"use client";

import "react-datepicker/dist/react-datepicker.css"; // Import the CSS for react-datepicker

import * as z from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";

import { ApiError } from "@/services/api.service";
import { Button } from "@/components/ui/button";
import { CreateTicketTypeRequest } from "@/types/ticket";
import DatePicker from "react-datepicker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import styles from "@/components/Datepicker.module.css";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEvent } from "@/hooks/useEvent";
import { useForm } from "react-hook-form";
// import { TimePicker } from "@/components/ui/time-picker"
import { useTicket } from "@/hooks/useTicket";
import { zodResolver } from "@hookform/resolvers/zod";

function combineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const datetime = new Date(date);
  datetime.setHours(hours, minutes);
  return datetime;
}

const ticketSchema = z.object({
  name: z.string().min(1, "Ticket name is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  description: z.string().min(1, "Description is required"),
  sale_start_date: z.date(),
  sale_end_date: z.date(),
  is_active: z.boolean().default(true),
  isEdit: z.boolean().optional().default(false),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface Event {
  id: string;
  ticket_types: Array<{
    name: string;
    price: number;
    quantity: number;
    description: string;
  }>;
}

export default function TicketForm({
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
  if (!eventId) {
    eventId = "null";
  }

  const {
    useTicketTypes,
    useCreateTicketType,
    useUpdateTicketType,
    useDeleteTicketType,
  } = useTicket();
  const { data: tickets, isLoading: isLoadingTickets } =
    useTicketTypes(eventId);
  const updateTicket = useUpdateTicketType(
    { eventId },
    {
      onSuccess: () => {
        toast.success("Ticket updated successfully");
      },
    }
  ); // We'll set the ticketId when editing
  const deleteTicket = useDeleteTicketType(eventId);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const isBeta = true;

  const { useEvent: useEventQuery, useUpdateEvent } = useEvent();
  const { data: eventData, error: eventError } = useEventQuery(eventId);
  const createTicketType = useCreateTicketType(eventId, {
    onSuccess: () => {
      toast.success("Ticket added successfully");
    },
  });

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      name: "",
      price: 0, // Always default to 0, will be enforced by useEffect for non-beta users
      quantity: 1,
      description: "",
      sale_start_date: new Date(),
      sale_end_date: new Date(),
      is_active: true,
    },
  });

  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  useEffect(() => {
    if (eventData?.result?.available_tickets?.[0]) {
      const ticket = eventData.result.available_tickets[0];
      form.reset({
        name: ticket.name,
        price: parseInt(ticket.price.toString(), 10),
        quantity: ticket.quantity,
        description: ticket.description,
        sale_start_date: new Date(ticket.sale_start_date),
        sale_end_date: new Date(ticket.sale_end_date),
        is_active: ticket.is_active,
      });
    }
  }, [eventData, form]);

  const handleSubmit = async (data: TicketFormData) => {
    setIsLoading(true);
    setTopError(null);
    try {
      const ticketData: CreateTicketTypeRequest = {
        name: data.name,
        price: parseInt(data.price.toString(), 10),
        quantity: parseInt(data.quantity.toString(), 10) || 0,
        description: data.description,
        sale_start_date: data.sale_start_date,
        sale_end_date: data.sale_end_date,
        is_active: data.is_active,
      };

      if (data.isEdit && editingTicketId) {
        await updateTicket.mutateAsync({
          ...ticketData,
          ticketTypeId: editingTicketId as string,
        });
        setIsEditing(false);
        setEditingTicketId(null);
      } else {
        await createTicketType.mutateAsync(ticketData);
      }

      // Clear form after successful submission
      handleClearForm();
    } catch (error) {
      // Attempt to map API errors to fields; otherwise set a top-level alert
      let fallbackMessage = "Failed to save ticket";

      if (error instanceof ApiError) {
        const apiMessage = error.data?.message || error.message;
        const errorDetails =
          error.data?.result?.errors?.error_details || error.data?.errors;

        // Common detail message
        const detail: string | undefined =
          typeof errorDetails?.detail === "string"
            ? errorDetails.detail
            : undefined;

        // Try to set field-specific errors if keys match our schema
        const possibleFieldErrors =
          error.data?.result?.errors?.errors || error.data?.errors;

        if (possibleFieldErrors && typeof possibleFieldErrors === "object") {
          Object.entries(possibleFieldErrors as Record<string, any>).forEach(
            ([key, value]) => {
              const message = Array.isArray(value)
                ? String(value[0])
                : typeof value === "string"
                ? value
                : undefined;
              if (!message) return;

              // Map backend keys to our form fields when possible
              const fieldMap: Record<string, keyof TicketFormData> = {
                name: "name",
                price: "price",
                quantity: "quantity",
                description: "description",
                sale_start_date: "sale_start_date",
                sale_end_date: "sale_end_date",
                is_active: "is_active",
              };
              const mapped = fieldMap[key];
              if (mapped) {
                form.setError(mapped as keyof TicketFormData, {
                  type: "server",
                  message,
                });
              }
            }
          );
        }

        // Special-case validation text we know comes from backend
        if (
          (detail &&
            detail.includes("Sale end date must be after start date")) ||
          apiMessage?.includes("Sale end date must be after start date")
        ) {
          form.setError("sale_end_date", {
            type: "server",
            message: "Sale end date must be after start date",
          });
        }

        setTopError(detail || apiMessage || fallbackMessage);
      } else {
        setTopError(fallbackMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTicket = (ticket) => {
    form.setValue("name", ticket.name);
    form.setValue("description", ticket.description);
    form.setValue("price", parseInt(ticket.price.toString(), 10));
    form.setValue("quantity", parseInt(ticket.quantity.toString(), 10));
    form.setValue("sale_start_date", new Date(ticket.sale_start_date));
    form.setValue("sale_end_date", new Date(ticket.sale_end_date));
    form.setValue("isEdit", true);
    setEditingTicketId(ticket.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleClearForm = () => {
    form.reset({
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      sale_start_date: new Date(),
      sale_end_date: new Date(),
      is_active: true,
      isEdit: false,
    });
    setIsEditing(false);
    setEditingTicketId(null);
    // Don't hide form when clearing - keep it open for adding more tickets
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      if (eventId) await deleteTicket.mutateAsync(ticketId); // Call the delete function
      // Optionally, you can refresh the tickets or show a success message
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  if (eventError) {
    return (
      <div className="text-red-500">
        Error loading event data. Please try again.
      </div>
    );
  }

  return (
    <div className="p-0">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Existing Tickets Section */}
        <div>
          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">Tickets</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                All tickets created for this event
              </p>
            </div>
            <Button
              onClick={() => {
                if (!showForm) {
                  setShowForm(true); // Show popup form
                } else {
                  setShowForm(false); // Hide popup form
                }
              }}
              variant="default"
              className="w-full md:w-auto h-12 px-6 rounded-xl"
            >
              {showForm ? "Hide Form" : "Add New Ticket"}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingTickets ? (
              <div className="text-center col-span-full">
                Loading tickets...
              </div>
            ) : tickets?.result?.results?.length === 0 ? (
              <div className="text-center col-span-full">
                No tickets created yet
              </div>
            ) : (
              tickets?.result?.results?.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="rounded-xl border-2 hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{ticket.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {ticket.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Price
                        </p>
                        <p className="text-xl font-bold">${ticket.price}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Quantity
                        </p>
                        <p className="text-xl font-bold">
                          {ticket.remaining_tickets} / {ticket.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Sale Start
                        </p>
                        <p className="text-sm">
                          {format(new Date(ticket.sale_start_date), "PPP p")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Sale End
                        </p>
                        <p className="text-sm">
                          {format(new Date(ticket.sale_end_date), "PPP p")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleEditTicket(ticket)}
                        variant="outline"
                        className="flex-1 h-10 rounded-xl"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        variant="destructive"
                        className="flex-1 h-10 rounded-xl"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Add New Ticket Form - Popup Card */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {isEditing ? "Edit Ticket" : "Add New Ticket"}
                  </CardTitle>
                  <CardDescription>
                    {isEditing
                      ? "Update ticket details"
                      : "Create a new ticket type for your event"}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    handleClearForm();
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {topError && (
                  <Alert variant="destructive" className="mb-4 bg-white ">
                    <AlertTitle>Could not save ticket</AlertTitle>
                    <AlertDescription>{topError}</AlertDescription>
                  </Alert>
                )}
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6"
                  >
                    {/* Single Ticket Form Fields */}
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ticket Name</FormLabel>
                            <FormControl>
                              <Input
                                className="h-12 rounded-xl border-2 focus:border-primary"
                                placeholder="e.g., VIP Ticket, Early Bird"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                className="min-h-[100px] rounded-xl border-2 focus:border-primary resize-none"
                                placeholder="Describe what's included with this ticket"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input
                                  className="h-12 rounded-xl border-2 focus:border-primary"
                                  type="number"
                                  placeholder="0.00"
                                  value={field.value}
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? 0
                                        : parseFloat(e.target.value);
                                    field.onChange(isNaN(value) ? 0 : value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity Available</FormLabel>
                              <FormControl>
                                <Input
                                  className="h-12 rounded-xl border-2 focus:border-primary"
                                  type="number"
                                  placeholder="100"
                                  value={field.value}
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? 0
                                        : parseInt(e.target.value);
                                    field.onChange(isNaN(value) ? 0 : value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="sale_start_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Sale Start Date
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DatePicker
                                    selected={field.value}
                                    onChange={(date) => field.onChange(date)}
                                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholderText="Select start date and time"
                                    dateFormat="MMM d, yyyy h:mm aa"
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={30}
                                    popperClassName={styles.customDatepicker}
                                  />
                                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sale_end_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Sale End Date
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DatePicker
                                    selected={field.value}
                                    onChange={(date) => field.onChange(date)}
                                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholderText="Select end date and time"
                                    dateFormat="MMM d, yyyy h:mm aa"
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={30}
                                    popperClassName={styles.customDatepicker}
                                  />
                                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Form Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearForm}
                        className="flex-1 h-12 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-12 rounded-xl"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : isEditing ? (
                          "Update Ticket"
                        ) : (
                          "Add Ticket"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons - Below the form section */}
        <div className="mt-8 flex justify-between items-center">
          {/* Previous Button - Far Left */}
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="flex items-center gap-2 h-12 px-6 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          {/* Skip and Next Buttons - Far Right */}
          <div className="flex gap-3">
            {canSkip && (
              <Button
                type="button"
                variant="ghost"
                onClick={onSkip}
                disabled={!canGoNext}
                className="h-12 px-6 rounded-xl"
              >
                Skip
              </Button>
            )}
            <Button
              type="button"
              onClick={onNext}
              disabled={!canGoNext}
              className="flex items-center gap-2 h-12 px-6 rounded-xl"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
