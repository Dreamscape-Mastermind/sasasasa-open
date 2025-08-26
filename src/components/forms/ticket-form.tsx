"use client";

import "react-datepicker/dist/react-datepicker.css"; // Import the CSS for react-datepicker

import * as z from "zod";

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
import { Loader2, Trash2 } from "lucide-react";
import { use, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { CreateTicketTypeRequest } from "@/types/ticket";
import DatePicker from "react-datepicker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";
import { useForm } from "react-hook-form";
import { useParams, useSearchParams } from "next/navigation";
// import { TimePicker } from "@/components/ui/time-picker"
import { useTicket } from "@/hooks/useTicket";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/user";
import styles from '@/components/Datepicker.module.css';
import BetaProgramPopup from "@/components/dashboard/event/tickets/BetaProgramPopup";

function combineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const datetime = new Date(date);
  datetime.setHours(hours, minutes);
  return datetime;
}

const ticketSchema = z.object({
  name: z.string().min(1, "Ticket name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
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

export default function TicketForm({ onFormSubmitSuccess, eventId }: { onFormSubmitSuccess?: () => void, eventId?: string }) {
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
  const updateTicket = useUpdateTicketType({ eventId }, {
    onSuccess: () => {
      toast.success("Ticket updated successfully");
    },
  }); // We'll set the ticketId when editing
  const deleteTicket = useDeleteTicketType(eventId);
  const formRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, hasRole } = useAuth();
  const isBeta = !!user?.beta || hasRole(UserRole.BETA_TESTER);

  const { useEvent: useEventQuery, useUpdateEvent } = useEvent();
  const { data: eventData, error: eventError } = useEventQuery(eventId);
  const createTicketType = useCreateTicketType(eventId, {
    onSuccess: () => {
      toast.success("Ticket updated successfully");
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

  useEffect(() => {
    if (eventData?.result?.available_tickets?.[0]) {
      const ticket = eventData.result.available_tickets[0];
      form.reset({
        name: ticket.name,
        price: isBeta ? parseInt(ticket.price.toString(), 10) : 0,
        quantity: ticket.quantity,
        description: ticket.description,
        sale_start_date: new Date(ticket.sale_start_date),
        sale_end_date: new Date(ticket.sale_end_date),
        is_active: ticket.is_active,
      });
    }
  }, [eventData, form, user?.beta]);

  // Enforce free tickets for non-beta users
  useEffect(() => {
    if (!isBeta) {
      form.setValue("price", 0);
    }
  }, [isBeta, form]);

  const handleSubmit = async (data: TicketFormData) => {
    setIsLoading(true);

    try {
      const ticketData: CreateTicketTypeRequest = {
        name: data.name,
        price: isBeta ? parseInt(data.price.toString(), 10) : 0, // Enforce free tickets for non-beta users
        quantity: parseInt(data.quantity.toString(), 10) || 0,
        description: data.description,
        sale_start_date: data.sale_start_date,
        sale_end_date: data.sale_end_date,
        is_active: data.is_active,
      };

      if (data.isEdit && editingTicketId) {
        await updateTicket.mutateAsync({ ...ticketData, ticketTypeId: editingTicketId as string });
      } else {
        await createTicketType.mutateAsync(ticketData);
        onFormSubmitSuccess?.();
      }
    } catch (error) {
      toast.error("Failed to update ticket");
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
    formRef.current?.scrollIntoView({ behavior: "smooth" });
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
    setShowForm(false); // Hide form when clearing
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
                  handleClearForm(); // Clear form first
                  setShowForm(true); // Then show form
                  formRef.current?.scrollIntoView({ behavior: "smooth" });
                } else {
                  setShowForm(false); // Just hide form if it's showing
                }
              }}
              variant="default"
              className="w-full md:w-auto"
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
                <Card key={ticket.id} className="p-2 rounded-lg">
                  <CardHeader className="border-b border-b-black-500">
                    <CardTitle>{ticket.name}</CardTitle>
                    <CardDescription>{ticket.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between p-2 items-center border-b border-b-black-500">
                      <div>
                        <p className="text-sm font-medium">Price</p>
                        <p className="text-lg font-bold">${ticket.price}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Quantity</p>
                        <p className="text-lg font-bold">
                          {ticket.remaining_tickets} / {ticket.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2  p-2 rounded-lg border-b border-b-black-500">
                      <div>
                        <p className="text-sm font-medium">Sale Start</p>
                        <p className="text-sm">
                          {format(new Date(ticket.sale_start_date), "PPP p")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Sale End</p>
                        <p className="text-sm">
                          {format(new Date(ticket.sale_end_date), "PPP p")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleEditTicket(ticket)}
                        variant="outline"
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        variant="destructive"
                        className="flex-1"
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

        {/* Add New Ticket Form */}
        <div
          ref={formRef}
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            showForm ? "max-h-[2000px]" : "max-h-0"
          )}
        >
          <Card className="p-2 rounded-lg">
            <CardHeader>
              <CardTitle>
                {isEditing ? "Edit Ticket" : "Add New Ticket"}
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? "Update ticket details"
                  : "Create a new ticket type for your event"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-6"
                >
                  {/* Single Ticket Form Fields */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-full"
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
                              className="rounded-lg"
                              placeholder="Describe what's included with this ticket"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Price
                          {!isBeta && (
                                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full text-xs font-medium">
                                  Beta Only
                                </span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <Input
                                className={cn(
                                  "rounded-full",
                                  !isBeta && "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                )}
                                type="number"
                                placeholder={isBeta ? "0.00" : "Free ticket only"}
                                disabled={!isBeta}
                                value={isBeta ? field.value : 0}
                                onChange={isBeta ? field.onChange : () => { }}
                              />
                            </FormControl>
                            {!isBeta && (
                              <BetaProgramPopup>
                                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 cursor-pointer hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                                  💡 Join our beta program to unlock paid ticketing features
                                </p>
                              </BetaProgramPopup>
                            )}
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
                                className="rounded-full"
                                type="number"
                                placeholder="100"
                                value={field.value}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                                  field.onChange(isNaN(value) ? 0 : value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="sale_start_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Sale Start Date</FormLabel>
                              <DatePicker
                                selected={field.value}
                                onChange={(date) => field.onChange(date)}
                                className="border rounded-full p-2 bg-card"
                                placeholderText="Sale start date and time"
                                dateFormat="MMM d, yyyy h:mm aa"
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={30}
                                popperClassName={styles.customDatepicker}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sale_end_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Sale End Date</FormLabel>
                              <DatePicker
                                selected={field.value}
                                onChange={(date) => field.onChange(date)}
                                className="border rounded-full p-2 bg-card"
                                placeholderText="Sale end date and time"
                                dateFormat="MMM d, yyyy h:mm aa"
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={30}
                                popperClassName={styles.customDatepicker}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearForm}
                      className="flex items-center w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>

                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
