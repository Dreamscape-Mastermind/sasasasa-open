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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  useCreateTicket,
  useDeleteTicket,
  useUpdateTicket,
} from "@/services/tickets/mutation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useTickets } from "@/services/tickets/queries";
import { zodResolver } from "@hookform/resolvers/zod";

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

const ticketSchema = z
  .object({
    name: z.string().min(1, "Ticket name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.string().min(1, "Price is required"),
    quantity: z.string().min(1, "Quantity is required"),
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
      path: ["tickets"],
    }
  );

export default function TicketForm() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const { data: tickets, isLoading: isLoadingTickets } = useTickets(eventId);
  const createTicket = useCreateTicket();
  const updateTicket = useUpdateTicket();
  const deleteTicket = useDeleteTicket();
  console.log({ "tickets data": useTickets(eventId).data });
  const formRef = useRef<HTMLDivElement>(null);
  const ticketForm = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      quantity: "",
      sale_start_date: new Date(),
      sale_end_date: new Date(),
    },
  });

  const [editingTicketId, setEditingTicketId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const onSubmitTicket = async (data: z.infer<typeof ticketSchema>) => {
    try {
      const processedTicket = {
        ...data,
        sale_start_date: data.sale_start_date, // Use only the date
        sale_end_date: data.sale_end_date, // Use only the date
      };

      if (editingTicketId && eventId) {
        await updateTicket.mutateAsync({
          eventId,
          ticketId: editingTicketId,
          data: processedTicket,
        });
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
    setEditingTicketId(ticket.id); // Store the ID of the ticket being edited
    setIsEditing(true); // Set editing mode to true
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearForm = () => {
    ticketForm.reset({
      name: "",
      description: "",
      price: "",
      quantity: "",
      sale_start_date: new Date(), // Reset to default value
      sale_end_date: new Date(), // Reset to default value
    }); // Reset the form fields
    setIsEditing(false); // Reset editing state
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      if (eventId) await deleteTicket.mutateAsync({ eventId, ticketId }); // Call the delete function
      // Optionally, you can refresh the tickets or show a success message
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-200 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Existing Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Tickets</CardTitle>
            <CardDescription>
              All tickets created for this event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Sale Period</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingTickets ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Loading tickets...
                      </TableCell>
                    </TableRow>
                  ) : tickets?.result?.results?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No tickets created yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    tickets?.result?.results?.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>{ticket.name}</TableCell>
                        <TableCell>{ticket.price}</TableCell>
                        <TableCell>{ticket.quantity}</TableCell>
                        <TableCell>
                          {format(new Date(ticket.sale_start_date), "PPP")} -
                          {format(new Date(ticket.sale_end_date), "PPP")}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleEditTicket(ticket)}
                            variant="outline"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            variant="outline"
                            className="ml-2"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Cards for Small Screens */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {isLoadingTickets ? (
                <div className="text-center">Loading tickets...</div>
              ) : tickets?.result?.results?.length === 0 ? (
                <div className="text-center">No tickets created yet</div>
              ) : (
                tickets?.result?.results?.map((ticket) => (
                  <Card key={ticket.id} className="p-4">
                    <CardHeader>
                      <CardTitle>{ticket.name}</CardTitle>
                      <CardDescription>Price: {ticket.price}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Quantity: {ticket.quantity}</p>
                      <p>
                        Sale Period:{" "}
                        {format(new Date(ticket.sale_start_date), "PPP")} -
                        {format(new Date(ticket.sale_end_date), "PPP")}
                      </p>
                    </CardContent>
                    <CardContent>
                      <Button
                        onClick={() => handleEditTicket(ticket)}
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        variant="outline"
                        className="ml-2"
                      >
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add New Ticket Form */}
        <Card ref={formRef}>
          <CardHeader>
            <CardTitle>Add New Ticket</CardTitle>
            <CardDescription>
              Create a new ticket type for your event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...ticketForm}>
              <form
                onSubmit={ticketForm.handleSubmit(onSubmitTicket)}
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
  );
}
