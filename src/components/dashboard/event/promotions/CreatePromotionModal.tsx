import "react-datepicker/dist/react-datepicker.css";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { DiscountStatus, DiscountType } from "@/types/discount";
import { DollarSign, Percent, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { AlertCircle } from "lucide-react";
import DatePicker from "react-datepicker";
import { FlashSaleDiscountType } from "@/types/flashsale";
import { TicketType } from "@/types/ticket";
import styles from '@/components/Datepicker.module.css';
import { useDiscount } from "@/hooks/useDiscount";
import { useFlashSale } from "@/hooks/useFlashSale";
import { useTicket } from "@/hooks/useTicket";

interface CreatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "discount" | "flash-sale";
  discountId?: string;
  flashSaleId?: string;
  eventId: string;
}

export function CreatePromotionModal({
  isOpen,
  onClose,
  type,
  discountId,
  flashSaleId,
  eventId,
}: CreatePromotionModalProps) {
  const { useSingleDiscount, useCreateDiscount, useUpdateDiscount } =
    useDiscount();
  const { useSingleFlashSale, useCreateFlashSale, useUpdateFlashSale } =
    useFlashSale();
  const { useTicketTypes } = useTicket();

  const { data: discountData } = useSingleDiscount(eventId, discountId || "");

  const { data: flashSaleData } = useSingleFlashSale(
    eventId,
    flashSaleId || ""
  );

  const { data: ticketTypesData } = useTicketTypes(eventId, { ordering: "-created_at" });

  const createDiscount = useCreateDiscount(eventId);
  const updateDiscount = useUpdateDiscount(eventId, discountId || "");
  const createFlashSale = useCreateFlashSale(eventId);
  const updateFlashSale = useUpdateFlashSale(eventId, flashSaleId || "");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    discountType: "percentage",
    amount: "",
    maxDiscount: "",
    maxUses: "",
    minTickets: "1",
    startDateTime: "",
    endDateTime: "",
    ticketTypes: [] as string[],
    recurrence: "none",
    recurrenceInterval: "1",
    recurrenceEndAfter: "",
    recurrenceEndDate: "",
  });

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (discountId && discountData?.result) {
      const discount = discountData.result;
      setFormData({
        name: discount.name,
        description: discount.description || "",
        code: discount.code,
        discountType: discount.discount_type.toLowerCase(),
        amount: discount.amount.toString(),
        maxDiscount: discount.max_discount_amount?.toString() || "",
        maxUses: discount.max_uses.toString(),
        minTickets: discount.min_ticket_count.toString(),
        startDateTime: new Date(discount.start_date).toISOString().slice(0, 16),
        endDateTime: new Date(discount.end_date).toISOString().slice(0, 16),
        ticketTypes: [],
        recurrence: "none",
        recurrenceInterval: "1",
        recurrenceEndAfter: "",
        recurrenceEndDate: "",
      });
      setIsEditing(true);
    } else if (flashSaleId && flashSaleData?.result) {
      const flashSale = flashSaleData.result;
      setFormData({
        name: flashSale.name,
        description: flashSale.description || "",
        code: "",
        discountType: flashSale.discount_type.toLowerCase(),
        amount: flashSale.discount_amount.toString(),
        maxDiscount: "",
        maxUses: flashSale.max_tickets.toString(),
        minTickets: "1",
        startDateTime: new Date(flashSale.start_date)
          .toISOString()
          .slice(0, 16),
        endDateTime: new Date(flashSale.end_date).toISOString().slice(0, 16),
        ticketTypes: flashSale.ticket_types.map((t) => t.ticket_type_name),
        recurrence: flashSale.is_recurring
          ? flashSale.recurrence_pattern?.type || "none"
          : "none",
        recurrenceInterval:
          flashSale.recurrence_pattern?.interval?.toString() || "1",
        recurrenceEndAfter:
          flashSale.recurrence_pattern?.end_after?.toString() || "",
        recurrenceEndDate:
          flashSale.recurrence_pattern?.end_date?.split("T")[0] || "",
      });
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [discountId, flashSaleId, discountData, flashSaleData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    console.log({name, value});
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleTicketTypeChange = (ticketTypeId: string) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [ticketTypeId], // Only store one ticket type
    }));
    setHasChanges(true);
  };

  const generateCode = () => {
    const code =
      formData.name.toUpperCase().replace(/\s+/g, "") +
      Math.random().toString(36).substr(2, 4).toUpperCase();
    setFormData((prev) => ({ ...prev, code }));
  };

  const convertToISOString = (datetimeLocal: string): string => {
    if (!datetimeLocal) return "";
    // datetime-local format: "2025-06-25T14:00"
    // We need to preserve the exact time without timezone conversion
    return datetimeLocal + ":00.000Z";
  };

  const validateRecurrencePattern = () => {
    if (formData.recurrence === "none") return true;

    // Validate interval
    const interval = parseInt(formData.recurrenceInterval);
    if (isNaN(interval) || interval < 1) {
      setError("Recurrence interval must be a positive number");
      return false;
    }

    // Validate end_after if provided
    if (formData.recurrenceEndAfter) {
      const endAfter = parseInt(formData.recurrenceEndAfter);
      if (isNaN(endAfter) || endAfter < 1) {
        setError("End after occurrences must be a positive number");
        return false;
      }
    }

    // Validate end_date if provided
    if (formData.recurrenceEndDate) {
      const endDate = new Date(formData.recurrenceEndDate);
      const startDate = new Date(convertToISOString(formData.startDateTime));
      if (endDate <= startDate) {
        setError("Recurrence end date must be after the start date");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate recurring pattern if applicable
    if (type === "flash-sale" && !validateRecurrencePattern()) {
      return;
    }

    try {
      if (type === "discount") {
        const discountData = {
          name: formData.name,
          description: formData.description,
          code: formData.code,
          discount_type: formData.discountType.toUpperCase() as DiscountType,
          amount: parseFloat(formData.amount),
          max_uses: parseInt(formData.maxUses) || undefined,
          min_ticket_count: parseInt(formData.minTickets) || 1,
          max_discount_amount: formData.maxDiscount
            ? parseFloat(formData.maxDiscount)
            : undefined,
          start_date: convertToISOString(formData.startDateTime),
          end_date: convertToISOString(formData.endDateTime),
          status: DiscountStatus.ACTIVE,
        };

        if (isEditing && discountId) {
          await updateDiscount.mutateAsync(discountData);
        } else {
          await createDiscount.mutateAsync(discountData);
        }
      } else {
        const flashSaleData = {
          name: formData.name,
          description: formData.description,
          start_date: convertToISOString(formData.startDateTime),
          end_date: convertToISOString(formData.endDateTime),
          max_tickets: parseInt(formData.maxUses),
          discount_type:
            formData.discountType.toUpperCase() as FlashSaleDiscountType,
          discount_amount: parseFloat(formData.amount),
          is_recurring: formData.recurrence !== "none",
          recurrence_pattern:
            formData.recurrence !== "none"
              ? {
                  type: formData.recurrence as "weekly" | "monthly",
                  interval: parseInt(formData.recurrenceInterval) || 1,
                  ...(formData.recurrenceEndAfter && {
                    end_after: parseInt(formData.recurrenceEndAfter),
                  }),
                  ...(formData.recurrenceEndDate && {
                    end_date: `${formData.recurrenceEndDate}T23:59:59Z`,
                  }),
                }
              : undefined,
          ticket_types: formData.ticketTypes.map((ticketTypeName) => {
            const ticketType = ticketTypesData?.result?.results.find(
              (tt: TicketType) => tt.name === ticketTypeName
            );
            return {
              ticket_type: ticketType?.id || ticketTypeName,
              max_tickets: parseInt(formData.maxUses),
            };
          }),
        };

        if (isEditing && flashSaleId) {
          await updateFlashSale.mutateAsync(flashSaleData);
        } else {
          await createFlashSale.mutateAsync(flashSaleData);
        }
      }

      onClose();
    } catch (err: any) {
      const errorData = err.response?.data?.result?.errors;
      if (errorData?.error_details?.errors?.non_field_errors) {
        setError(errorData.error_details.errors.non_field_errors[0]);
      } else if (errorData?.error_details?.errors) {
        // Handle field-specific errors
        const fieldErrors = Object.entries(errorData.error_details.errors)
          .map(([field, errors]: [string, any[]]) => `${field}: ${errors[0]}`)
          .join(", ");
        setError(fieldErrors);
      } else {
        setError("An error occurred while saving the promotion");
      }
    }
  };

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    if (hasChanges) {
      closeButtonRef.current?.click();
    } else {
      onClose();
    }
  };

  const handleDiscard = () => {
    setHasChanges(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-muted/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
          className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              {isEditing ? "Edit" : "Create"}{" "}
              {type === "discount" ? "Discount Code" : "Flash Sale"}
            </h2>
            <button
              onClick={handleDiscard}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
            {/* <Popover>
              <PopoverTrigger asChild>
                <button
                  ref={closeButtonRef}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">
                    Discard Changes?
                  </h4>
                  <p className="text-sm text-foreground">
                    You have unsaved changes. Are you sure you want to discard
                    them?
                  </p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => closeButtonRef.current?.click()}
                      className="px-3 py-1.5 text-sm border border-input bg-background text-foreground rounded-md hover:bg-muted"
                    >
                      Continue Editing
                    </button>
                    <button
                      onClick={handleDiscard}
                      className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                    >
                      Discard Changes
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover> */}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Basic Information
              </h3>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Promotion Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter promotion name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe your promotion"
                />
              </div>

              {type === "discount" && (
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Discount Code *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="flex-1 rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                      placeholder="DISCOUNT2024"
                      required
                    />
                    <button
                      type="button"
                      onClick={generateCode}
                      className="w-full sm:w-auto px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Discount Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Discount Settings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="discountType"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Discount Type *
                  </label>
                  <select
                    id="discountType"
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    {formData.discountType === "percentage"
                      ? "Percentage (%)"
                      : "Amount ($)"}{" "}
                    *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 pl-8 focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder={
                        formData.discountType === "percentage" ? "25" : "10"
                      }
                      min="0"
                      max={
                        formData.discountType === "percentage"
                          ? "100"
                          : undefined
                      }
                      required
                    />
                    {formData.discountType === "percentage" ? (
                      <Percent className="absolute left-2 top-2.5 h-4 w-4 text-foreground" />
                    ) : (
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {formData.discountType === "percentage" && (
                <div>
                  <label
                    htmlFor="maxDiscount"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Maximum Discount Amount ($)
                  </label>
                  <input
                    type="number"
                    id="maxDiscount"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="100"
                    min="0"
                  />
                </div>
              )}
            </div>

            {/* Usage Limits */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Usage Limits
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="maxUses"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Maximum Uses
                  </label>
                  <input
                    type="number"
                    id="maxUses"
                    name="maxUses"
                    value={formData.maxUses}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="100"
                    min="1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="minTickets"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Minimum Tickets
                  </label>
                  <input
                    type="number"
                    id="minTickets"
                    name="minTickets"
                    value={formData.minTickets}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Validity Period
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full sm:w-auto max-w-full sm:max-w-xs">
                  <label
                    htmlFor="startDateTime"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Start Date & Time *
                  </label>
                  <DatePicker
                    selected={
                      formData.startDateTime
                        ? new Date(formData.startDateTime)
                        : null
                    }
                    onChange={(date: Date | null) => {
                      setFormData((prev) => ({
                        ...prev,
                        startDateTime: date ? date.toLocaleString('sv-SE').slice(0, 16) : "",
                      }));
                      setHasChanges(true);
                    }}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholderText="Start date and time"
                    dateFormat="MMM d, yyyy h:mm aa"
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    popperClassName={styles.customDatepicker}
                    required
                  />
                </div>

                <div className="w-full sm:w-auto max-w-full sm:max-w-xs">
                  <label
                    htmlFor="endDateTime"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    End Date & Time *
                  </label>
                  <DatePicker
                    selected={
                      formData.endDateTime
                        ? new Date(formData.endDateTime)
                        : null
                    }
                    onChange={(date: Date | null) => {
                      setFormData((prev) => ({
                        ...prev,
                        endDateTime: date ? date.toLocaleString('sv-SE').slice(0, 16) : "",
                      }));
                      setHasChanges(true);
                    }}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholderText="End date and time"
                    dateFormat="MMM d, yyyy h:mm aa"
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    popperClassName={styles.customDatepicker}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Ticket Types - Only show for Flash Sales */}
            {type === "flash-sale" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">
                  Select Ticket Type
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ticketTypesData?.result?.results.map(
                    (ticketType: TicketType) => (
                      <label key={ticketType.id} className="flex items-center">
                        <input
                          type="radio"
                          name="ticketType"
                          checked={formData.ticketTypes.includes(
                            ticketType.name
                          )}
                          onChange={() =>
                            handleTicketTypeChange(ticketType.name)
                          }
                          className="rounded-full border-input text-primary focus:ring-primary mr-2"
                        />
                        <span className="text-sm text-foreground">
                          {ticketType.name} (KES {ticketType.price})
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>
            )}

            {type === "flash-sale" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    Recurrence (Optional)
                  </h3>
                  <p className="text-sm text-foreground mt-1">
                    Set up automatic repetition of this flash sale at regular
                    intervals
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="recurrence"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Recurrence Type
                    </label>
                    <select
                      id="recurrence"
                      name="recurrence"
                      value={formData.recurrence}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="none">No Recurrence</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {formData.recurrence !== "none" && (
                    <>
                      <div>
                        <label
                          htmlFor="recurrenceInterval"
                          className="block text-sm font-medium text-foreground mb-1"
                        >
                          Repeat Every (Interval)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            id="recurrenceInterval"
                            name="recurrenceInterval"
                            value={formData.recurrenceInterval}
                            onChange={handleInputChange}
                            className="w-20 rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                            min="1"
                            max="52"
                          />
                          <span className="text-sm text-foreground">
                            {formData.recurrence === "weekly"
                              ? "week(s)"
                              : "month(s)"}
                          </span>
                        </div>
                        <p className="text-xs text-foreground mt-1">
                          Example: "2" means every 2{" "}
                          {formData.recurrence === "weekly"
                            ? "weeks"
                            : "months"}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-foreground">
                          End Condition (Optional)
                        </label>
                        <p className="text-xs text-foreground">
                          Set when the recurring pattern should stop. Leave both
                          empty to continue indefinitely.
                        </p>
                        <div className="space-y-3">
                          <div>
                            <label
                              htmlFor="recurrenceEndAfter"
                              className="block text-sm text-foreground mb-1"
                            >
                              End After Occurrences
                            </label>
                            <input
                              type="number"
                              id="recurrenceEndAfter"
                              name="recurrenceEndAfter"
                              value={formData.recurrenceEndAfter}
                              onChange={handleInputChange}
                              className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                              placeholder="e.g., 12"
                              min="1"
                            />
                            <p className="text-xs text-foreground mt-1">
                              Example: "12" means stop after 12 occurrences
                            </p>
                          </div>

                          <div>
                            <label
                              htmlFor="recurrenceEndDate"
                              className="block text-sm text-foreground mb-1"
                            >
                              End By Date
                            </label>
                            <input
                              type="date"
                              id="recurrenceEndDate"
                              name="recurrenceEndDate"
                              value={formData.recurrenceEndDate}
                              onChange={handleInputChange}
                              className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <p className="text-xs text-foreground mt-1">
                              Example: "2025-12-31" means stop by December 31,
                              2025
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-border">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-input bg-background text-foreground rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
              >
                {isEditing
                  ? "Save Changes"
                  : `Create ${
                      type === "discount" ? "Discount Code" : "Flash Sale"
                    }`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
