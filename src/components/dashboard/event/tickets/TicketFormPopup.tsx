"use client";

import "react-datepicker/dist/react-datepicker.css";

import * as z from "zod";

import {
  Calendar,
  Clock,
  DollarSign,
  Info,
  Loader2,
  Settings,
  Tag,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreateTicketTypeRequest,
  TicketCustomAttributes,
} from "@/types/ticket";
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
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { useTicket } from "@/hooks/useTicket";
import { zodResolver } from "@hookform/resolvers/zod";

const ticketSchema = z
  .object({
    name: z
      .string()
      .min(1, "Ticket name is required")
      .max(100, "Name must be less than 100 characters"),
    price: z.string().optional(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    description: z.string().optional(),
    is_active: z.boolean().default(true),
    is_free: z.boolean().default(false),
    is_public: z.boolean().default(true),
    reserve_timeout_minutes: z
      .number()
      .min(1, "Must be at least 1 minute")
      .max(60, "Cannot exceed 60 minutes")
      .default(10),
    per_user_purchase_limit: z
      .number()
      .min(1, "Must be at least 1")
      .nullable()
      .optional(),
    custom_attributes: z
      .array(
        z.object({
          key: z.string().min(1, "Key is required"),
          value: z.string().min(1, "Value is required"),
        })
      )
      .optional(),
    sale_start_date: z.date(),
    sale_end_date: z.date(),
    has_complementary_policy: z.boolean().default(false),
    complementary_ratio: z.number().min(1, "Must be at least 1").default(1),
    complementary_max_per_purchase: z
      .number()
      .min(1, "Must be at least 1")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      return new Date(data.sale_end_date) > new Date(data.sale_start_date);
    },
    {
      message: "Sale end date must be after start date",
      path: ["sale_end_date"],
    }
  )
  .refine(
    (data) => {
      if (data.is_free) {
        return true; // Free tickets don't need price validation
      }
      return data.price && data.price.trim() !== "";
    },
    {
      message: "Price is required for paid tickets",
      path: ["price"],
    }
  )
  .refine(
    (data) => {
      if (data.is_free) {
        return true; // Free tickets are always valid
      }
      return data.price && parseFloat(data.price) > 0;
    },
    {
      message: "Price must be greater than 0 for paid tickets",
      path: ["price"],
    }
  );
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
      handleClose();
    },
  });

  const updateTicket = useUpdateTicketType(
    { eventId },
    {
      onSuccess: () => {
        toast.success("Ticket updated successfully");
        handleClose();
      },
    }
  );

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      name: "",
      price: "",
      quantity: 1,
      description: "",
      sale_start_date: new Date(),
      sale_end_date: new Date(),
      is_active: true,
      is_free: false,
      is_public: true,
      reserve_timeout_minutes: 10,
      per_user_purchase_limit: null,
      custom_attributes: [],
      has_complementary_policy: false,
      complementary_ratio: 1,
      complementary_max_per_purchase: null,
    },
  });

  // Reset form when editing ticket changes
  useEffect(() => {
    if (editingTicket) {
      form.reset({
        name: editingTicket.name,
        price: editingTicket.price.toString(),
        quantity: parseInt(editingTicket.quantity.toString(), 10),
        description: editingTicket.description || "",
        sale_start_date: new Date(editingTicket.sale_start_date),
        sale_end_date: new Date(editingTicket.sale_end_date),
        is_active: editingTicket.is_active,
        is_free: editingTicket.is_free || false,
        is_public:
          editingTicket.is_public !== undefined
            ? editingTicket.is_public
            : true,
        reserve_timeout_minutes: editingTicket.reserve_timeout_minutes || 10,
        per_user_purchase_limit: editingTicket.per_user_purchase_limit,
        custom_attributes: editingTicket.custom_attributes
          ? Object.entries(editingTicket.custom_attributes)
              .filter(
                ([key]) =>
                  ![
                    "is_auto_generated",
                    "complementary_policy",
                    "parent_ticket_type_id",
                  ].includes(key)
              )
              .map(([key, value]) => ({
                key,
                value: Array.isArray(value) ? value.join(", ") : String(value),
              }))
          : [],
        has_complementary_policy:
          editingTicket.has_complementary_policy || false,
        complementary_ratio: editingTicket.complementary_ratio || 1,
        complementary_max_per_purchase:
          editingTicket.complementary_max_per_purchase,
      });
    } else {
      form.reset({
        name: "",
        price: "",
        quantity: 1,
        description: "",
        sale_start_date: new Date(),
        sale_end_date: new Date(),
        is_active: true,
        is_free: false,
        is_public: true,
        reserve_timeout_minutes: 10,
        per_user_purchase_limit: null,
        custom_attributes: [],
        has_complementary_policy: false,
        complementary_ratio: 1,
        complementary_max_per_purchase: null,
      });
    }
  }, [editingTicket, form]);

  const handleSubmit = async (data: TicketFormData) => {
    setIsLoading(true);

    try {
      // Convert key-value pairs to object
      let customAttributes: TicketCustomAttributes = {};
      if (data.custom_attributes && data.custom_attributes.length > 0) {
        data.custom_attributes.forEach(({ key, value }) => {
          if (key.trim() && value.trim()) {
            // Try to parse as JSON if it looks like an array or object
            if (
              (value.startsWith("[") && value.endsWith("]")) ||
              (value.startsWith("{") && value.endsWith("}"))
            ) {
              try {
                customAttributes[key] = JSON.parse(value);
              } catch {
                customAttributes[key] = value;
              }
            } else {
              customAttributes[key] = value;
            }
          }
        });
      }

      const ticketData: CreateTicketTypeRequest = {
        name: data.name,
        price: data.is_free ? "0.00" : data.price || "0.00",
        quantity: data.quantity,
        description: data.description || "",
        sale_start_date: data.sale_start_date.toISOString(),
        sale_end_date: data.sale_end_date.toISOString(),
        is_active: data.is_active,
        is_free: data.is_free,
        is_public: data.is_public,
        reserve_timeout_minutes: data.reserve_timeout_minutes,
        per_user_purchase_limit: data.per_user_purchase_limit,
        custom_attributes: customAttributes,
        has_complementary_policy: data.has_complementary_policy,
        complementary_ratio: data.complementary_ratio,
        complementary_max_per_purchase: data.complementary_max_per_purchase,
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

  const watchedIsFree = form.watch("is_free");
  const watchedCustomAttributes = form.watch("custom_attributes") || [];

  const addCustomAttribute = () => {
    const currentAttributes = form.getValues("custom_attributes") || [];
    form.setValue("custom_attributes", [
      ...currentAttributes,
      { key: "", value: "" },
    ]);
  };

  const removeCustomAttribute = (index: number) => {
    const currentAttributes = form.getValues("custom_attributes") || [];
    form.setValue(
      "custom_attributes",
      currentAttributes.filter((_, i) => i !== index)
    );
  };

  const updateCustomAttribute = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const currentAttributes = form.getValues("custom_attributes") || [];
    const updatedAttributes = [...currentAttributes];
    updatedAttributes[index] = { ...updatedAttributes[index], [field]: value };
    form.setValue("custom_attributes", updatedAttributes);
  };

  const handleClose = () => {
    // Reset form to default values when closing
    form.reset({
      name: "",
      price: "",
      quantity: 1,
      description: "",
      sale_start_date: new Date(),
      sale_end_date: new Date(),
      is_active: true,
      is_free: false,
      is_public: true,
      reserve_timeout_minutes: 10,
      per_user_purchase_limit: null,
      custom_attributes: [],
      has_complementary_policy: false,
      complementary_ratio: 1,
      complementary_max_per_purchase: null,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {editingTicket ? "Edit Ticket Type" : "Create New Ticket Type"}
          </DialogTitle>
          <DialogDescription>
            {editingTicket
              ? "Update the details for this ticket type"
              : "Define a new ticket category for your event with pricing, availability, and custom attributes"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Basic Information Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-4 w-4" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Essential details about this ticket type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Ticket Type Name{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., VIP Pass, General Admission"
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
                        <FormLabel className="flex items-center gap-1">
                          Total Quantity <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what's included with this ticket..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing & Inventory Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-4 w-4" />
                  Pricing & Inventory
                </CardTitle>
                <CardDescription>
                  Set the price and availability for this ticket type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Price{" "}
                          {!watchedIsFree && (
                            <span className="text-red-500">*</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="0.00"
                              value={field.value}
                              onChange={field.onChange}
                              disabled={watchedIsFree}
                              className={
                                watchedIsFree
                                  ? "bg-muted text-muted-foreground"
                                  : ""
                              }
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                              KES
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_free"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Free Ticket
                          </FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Mark this as a complimentary ticket
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                form.setValue("price", "0.00");
                              }
                            }}
                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sale Period Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-4 w-4" />
                  Sale Period
                </CardTitle>
                <CardDescription>
                  Define when tickets can be purchased
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sale_start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="flex items-center gap-1">
                          Sale Start Date{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <DatePicker
                          selected={field.value}
                          onChange={(date) => field.onChange(date)}
                          className="border border-border rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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

                  <FormField
                    control={form.control}
                    name="sale_end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="flex items-center gap-1">
                          Sale End Date <span className="text-red-500">*</span>
                        </FormLabel>
                        <DatePicker
                          selected={field.value}
                          onChange={(date) => field.onChange(date)}
                          className="border border-border rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
              </CardContent>
            </Card>

            {/* Advanced Settings Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-4 w-4" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>
                  Configure purchase limits, timeouts, and other options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reserve_timeout_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Reservation Timeout (minutes)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="10"
                            min="1"
                            max="60"
                            value={field.value}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 10;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="per_user_purchase_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Purchase Limit per User
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Unlimited"
                            min="1"
                            value={field.value || ""}
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? null
                                  : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Make this ticket type available for purchase
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_public"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Public</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Make this ticket type visible to public users
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Complementary Policy Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-4 w-4" />
                  Complementary Policy
                </CardTitle>
                <CardDescription>
                  Configure automatic complementary ticket distribution when
                  this ticket type is purchased
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="has_complementary_policy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Enable Complementary Policy
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Automatically grant free tickets when this ticket type
                          is purchased
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("has_complementary_policy") && (
                  <div className="space-y-4 pl-4 border-l-2 border-muted">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="complementary_ratio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Complementary Ratio
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="1"
                                min="1"
                                value={field.value}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1;
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="complementary_max_per_purchase"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Max per Purchase
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Unlimited"
                                min="1"
                                value={field.value || ""}
                                onChange={(e) => {
                                  const value =
                                    e.target.value === ""
                                      ? null
                                      : parseInt(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                      <p className="font-medium mb-2">
                        Complementary Policy Examples:
                      </p>
                      <div className="space-y-1">
                        <p>
                          • <strong>1:1 Ratio:</strong> 1 complementary ticket
                          per purchased ticket
                        </p>
                        <p>
                          • <strong>2:1 Ratio:</strong> 2 complementary tickets
                          per purchased ticket
                        </p>
                        <p>
                          • <strong>Max Limit:</strong> Cap complementary
                          tickets per single purchase
                        </p>
                        <p>
                          • <strong>Auto-Created:</strong> Complementary ticket
                          type is automatically created by the system
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Attributes Section (Read-only) */}
            {editingTicket &&
              editingTicket.custom_attributes &&
              (() => {
                const systemKeys = [
                  "is_auto_generated",
                  "complementary_policy",
                  "parent_ticket_type_id",
                ];
                const systemAttrs: any = Object.entries(
                  editingTicket.custom_attributes
                )
                  .filter(([key]) => systemKeys.includes(key))
                  .reduce(
                    (acc, [key, value]) => ({ ...acc, [key]: value }),
                    {}
                  );

                if (Object.keys(systemAttrs).length > 0) {
                  return (
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Settings className="h-4 w-4" />
                          System Information
                        </CardTitle>
                        <CardDescription>
                          System-generated attributes (read-only)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {systemAttrs.is_auto_generated && (
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="secondary">Auto-generated</Badge>
                              <span className="text-muted-foreground">
                                This ticket type was automatically created by
                                the system
                              </span>
                            </div>
                          )}
                          {systemAttrs.complementary_policy &&
                            typeof systemAttrs.complementary_policy ===
                              "object" && (
                              <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline">
                                  Policy:{" "}
                                  {
                                    (systemAttrs.complementary_policy as any)
                                      .ratio
                                  }
                                  :1
                                  {(systemAttrs.complementary_policy as any)
                                    .max_per_purchase &&
                                    ` (max ${
                                      (systemAttrs.complementary_policy as any)
                                        .max_per_purchase
                                    })`}
                                </Badge>
                                <span className="text-muted-foreground">
                                  Complementary policy configuration
                                </span>
                              </div>
                            )}
                          {systemAttrs.parent_ticket_type_id && (
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="outline">Parent Ticket</Badge>
                              <span className="text-muted-foreground">
                                ID:{" "}
                                {systemAttrs.parent_ticket_type_id as string}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              })()}

            {/* Custom Attributes Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="h-4 w-4" />
                  Custom Attributes
                </CardTitle>
                <CardDescription>
                  Add custom metadata or attributes for this ticket type
                  (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {watchedCustomAttributes.map((attribute, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <Input
                          placeholder="Key (e.g., category, features, color)"
                          value={attribute.key}
                          onChange={(e) =>
                            updateCustomAttribute(index, "key", e.target.value)
                          }
                          className="mb-2"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Value (e.g., premium, early_access, gold)"
                          value={attribute.value}
                          onChange={(e) =>
                            updateCustomAttribute(
                              index,
                              "value",
                              e.target.value
                            )
                          }
                          className="mb-2"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomAttribute(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCustomAttribute}
                    className="w-full border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Attribute
                  </Button>

                  {watchedCustomAttributes.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No custom attributes added yet</p>
                      <p className="text-xs">
                        Click "Add Custom Attribute" to get started
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                    <p className="font-medium mb-2">Common Examples:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">
                          Special Perks:
                        </p>
                        <p>
                          • <strong>vip_lounge_access:</strong> true
                        </p>
                        <p>
                          • <strong>free_drinks:</strong> true
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">
                          Categories:
                        </p>
                        <p>
                          • <strong>category:</strong> early_bird
                        </p>
                        <p>
                          • <strong>audience:</strong> students
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">
                          Restrictions:
                        </p>
                        <p>
                          • <strong>min_age:</strong> 18
                        </p>
                        <p>
                          • <strong>requires_id:</strong> true
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">
                          UI Styling:
                        </p>
                        <p>
                          • <strong>highlight_color:</strong> #FFD700
                        </p>
                        <p>
                          • <strong>show_badge:</strong> true
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">
                          Seating:
                        </p>
                        <p>
                          • <strong>section:</strong> A
                        </p>
                        <p>
                          • <strong>row:</strong> 5
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">
                          Internal:
                        </p>
                        <p>
                          • <strong>partner_code:</strong> XYZ123
                        </p>
                        <p>
                          • <strong>refundable:</strong> true
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
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
