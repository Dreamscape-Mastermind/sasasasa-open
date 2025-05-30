"use client";

import "react-datepicker/dist/react-datepicker.css"; // Import the CSS for react-datepicker

import * as z from "zod";

import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard";
import { Control, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { TimePicker } from "@/components/ui/time-picker"
import {
  useCreateTicketType,
  useDeleteTicketType,
  useTicketTypes,
  useUpdateTicketType,
} from "@/lib/hooks/useTickets";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useParams, useSearchParams } from "next/navigation";
import { useTickets } from "@/lib/hooks/useTickets";
import { zodResolver } from "@hookform/resolvers/zod";

function combineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const datetime = new Date(date);
  datetime.setHours(hours, minutes);
  return datetime;
}

const ticketSchema = z
  .object({
    name: z.string().min(1, "Ticket name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().nonnegative("Price should be  positive"),
    quantity: z.coerce.number().gt(0, "Quantity is required"),
    sale_start_date: z.date({
      required_error: "Sale start date is required",
    }),
    sale_end_date: z.date({
      required_error: "Sale end date is required",
    }),
  })
  .refine(
    (data) => {
      const startDateTime = data.sale_start_date;
      const endDateTime = data.sale_end_date;
      return endDateTime > startDateTime;
    },
    {
      message: "Sale end date must be after sale start date",
      path: ["sale_end_date"],
    }
  );

export default function TicketForm() {
  const params = useParams();
  const eventId = params.id as string;

  const searchParams = useSearchParams();
  // const eventId = searchParams.get("eventId");
  const { data: tickets, isLoading: isLoadingTickets } = useTicketTypes(eventId);
  const createTicket = useCreateTicketType(eventId);
  const updateTicket = useUpdateTicketType(eventId);
  const deleteTicket = useDeleteTicketType(eventId);
  console.log({ "tickets data": tickets });
  const formRef = useRef<HTMLDivElement>(null);
  const ticketForm = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      sale_start_date: new Date(),
      sale_end_date: new Date(),
    },
  });

  const [editingTicketId, setEditingTicketId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const onSubmitTicket = async (data: z.infer<typeof ticketSchema>) => {
    console.log({ data })
    try {
      const processedTicket = {
        ...data,
        sale_start_date: data.sale_start_date,
        sale_end_date: data.sale_end_date,
        remaining_tickets: data.quantity,
        is_active: true
      };

      if (editingTicketId && eventId) {
        await updateTicket.mutateAsync({
          ticketId: editingTicketId,
          data: processedTicket
        }
        );
        setIsEditing(false); // Reset editing state after submission
      } else {
        await createTicket.mutateAsync(processedTicket);
      }

      ticketForm.reset(); // Reset form after successful creation or update
    } catch (error) {
      console.error("Error submitting ticket:", error);
    }
  };

  const handleEditTicket = (ticket) => {
    ticketForm.setValue("name", ticket.name);
    ticketForm.setValue("description", ticket.description);
    ticketForm.setValue("price", ticket.price);
    ticketForm.setValue("quantity", ticket.quantity);
    ticketForm.setValue("sale_start_date", new Date(ticket.sale_start_date));
    ticketForm.setValue("sale_end_date", new Date(ticket.sale_end_date));
    setEditingTicketId(ticket.id);
    setIsEditing(true);
    setShowForm(true); // Show form when editing
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearForm = () => {
    ticketForm.reset({
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      sale_start_date: new Date(),
      sale_end_date: new Date(),
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

  return (
    <div className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-200 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Existing Tickets Section */}
        <div>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Ticket Types</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  All tickets created for this event
                </p>
              </div>
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
              >
                {showForm ? "Hide Form" : "Add New Ticket"}
              </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingTickets ? (
              <div className="text-center col-span-full">Loading tickets...</div>
            ) : tickets?.result?.results?.length === 0 ? (
              <div className="text-center col-span-full">No tickets created yet</div>
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
                        <p className="text-lg font-bold">{ticket.remaining_tickets} / {ticket.quantity}</p>
                      </div>
                    </div>
                    <div className="space-y-2 bg-gray-50 dark:bg-zinc-800 p-2 rounded-lg border-b border-b-black-500">
                      <div>
                        <p className="text-sm font-medium">Sale Start</p>
                        <p className="text-sm">{format(new Date(ticket.sale_start_date), "PPP p")}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Sale End</p>
                        <p className="text-sm">{format(new Date(ticket.sale_end_date), "PPP p")}</p>
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
        <div ref={formRef} className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          showForm ? "max-h-[2000px]" : "max-h-0"
        )}>
          <Card className="p-2 rounded-lg">
            <CardHeader>
              <CardTitle>{isEditing ? "Edit Ticket" : "Add New Ticket"}</CardTitle>
              <CardDescription>
                {isEditing ? "Update ticket details" : "Create a new ticket type for your event"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...ticketForm}>
                <form
                  onSubmit={
                    (e) => {
                      console.log("Form submit event triggered");
                      console.log("Current form state:", {
                        isValid: ticketForm.formState.isValid,
                        errors: ticketForm.formState.errors,
                        isDirty: ticketForm.formState.isDirty,
                        values: ticketForm.getValues()
                      });
                      ticketForm.handleSubmit(
                        (data) => {
                          console.log("Form validation passed, submitting data");
                          onSubmitTicket(data);
                        },
                        (errors) => {
                          console.log("Form validation failed:", errors);
                        }
                      )(e);
                    }}
                  className="space-y-6"
                >
                  {/* Single Ticket Form Fields */}
                  <div className="space-y-4">
                    <FormField
                      control={ticketForm.control}
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
                      control={ticketForm.control}
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

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={ticketForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                className="rounded-full"
                                type="number"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={ticketForm.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity Available</FormLabel>
                            <FormControl>
                              <Input
                                className="rounded-full"
                                type="number"
                                placeholder="100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={ticketForm.control}
                          name="sale_start_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Sale Start Date</FormLabel>
                              <DatePicker
                                selected={field.value}
                                onChange={(date) => field.onChange(date)}
                                className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-zinc-800 rounded-full"
                                placeholderText="Sale start date and time"
                                dateFormat="MMM d, yyyy h:mm aa"
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={30}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={ticketForm.control}
                          name="sale_end_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Sale End Date</FormLabel>
                              <DatePicker
                                selected={field.value}
                                onChange={(date) => field.onChange(date)}
                                className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-zinc-800 rounded-full"
                                placeholderText="Sale end date and time"
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
                  </div>

                  <Button type="submit" disabled={createTicket.isPending}>
                    {isEditing ? (
                      "Edit Ticket"
                    ) : createTicket.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Ticket"
                    )}
                  </Button>

                  {/* Clear Form Button */}
                  {isEditing && (
                    <Button
                      type="button"
                      onClick={handleClearForm}
                      className="mt-4 ml-4"
                    >
                      Cancel Editing
                    </Button>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
