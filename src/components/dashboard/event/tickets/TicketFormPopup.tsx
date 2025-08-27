"use client";

import "react-datepicker/dist/react-datepicker.css";

import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CreateTicketTypeRequest } from "@/types/ticket";
import DatePicker from "react-datepicker";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/user";
import { useForm } from "react-hook-form";
import { useTicket } from "@/hooks/useTicket";
import { zodResolver } from "@hookform/resolvers/zod";

const ticketSchema = z.object({
  name: z.string().min(1, "Ticket name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  description: z.string().min(1, "Description is required"),
  sale_start_date: z.date(),
  sale_end_date: z.date(),
  is_active: z.boolean().default(true),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormPopupProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  editingTicket: any;
}

export default function TicketFormPopup({
  eventId,
  isOpen,
  onClose,
  editingTicket,
}: TicketFormPopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, hasRole } = useAuth();
  const isBeta = true;

  const { useCreateTicketType, useUpdateTicketType } = useTicket();
  const createTicketType = useCreateTicketType(eventId, {
    onSuccess: () => {
      toast.success(
        editingTicket
          ? "Ticket updated successfully"
          : "Ticket created successfully"
      );
      onClose();
    },
  });

  const updateTicket = useUpdateTicketType(
    { eventId },
    {
      onSuccess: () => {
        toast.success("Ticket updated successfully");
        onClose();
      },
    }
  );

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      name: "",
      price: 0,
      quantity: 1,
      description: "",
      sale_start_date: new Date(),
      sale_end_date: new Date(),
      is_active: true,
    },
  });

  // Reset form when editing ticket changes
  useEffect(() => {
    if (editingTicket) {
      form.reset({
        name: editingTicket.name,
        price: parseInt(editingTicket.price.toString(), 10),
        quantity: parseInt(editingTicket.quantity.toString(), 10),
        description: editingTicket.description,
        sale_start_date: new Date(editingTicket.sale_start_date),
        sale_end_date: new Date(editingTicket.sale_end_date),
        is_active: editingTicket.is_active,
      });
    } else {
      form.reset({
        name: "",
        price: 0,
        quantity: 1,
        description: "",
        sale_start_date: new Date(),
        sale_end_date: new Date(),
        is_active: true,
      });
    }
  }, [editingTicket, form, user?.beta]);

  

  const handleSubmit = async (data: TicketFormData) => {
    setIsLoading(true);

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

      if (editingTicket) {
        await updateTicket.mutateAsync({
          ...ticketData,
          ticketTypeId: editingTicket.id,
        });
      } else {
        await createTicketType.mutateAsync(ticketData);
      }
    } catch (error) {
      toast.error(
        editingTicket ? "Failed to update ticket" : "Failed to create ticket"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTicket ? "Edit Ticket Type" : "Create New Ticket Type"}
          </DialogTitle>
          <DialogDescription>
            {editingTicket
              ? "Update the details for this ticket type"
              : "Create a new ticket type for your event"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Price
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={"0.00"}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what's included with this ticket"
                      {...field}
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
                      type="number"
                      placeholder="100"
                      value={field.value}
                      onChange={(e) => {
                        const value =
                          e.target.value === "" ? 0 : parseInt(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      className="border border-border rounded p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                control={form.control}
                name="sale_end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Sale End Date</FormLabel>
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      className="border border-border rounded p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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

            

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingTicket ? "Updating..." : "Creating..."}
                  </>
                ) : editingTicket ? (
                  "Update Ticket"
                ) : (
                  "Create Ticket"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
