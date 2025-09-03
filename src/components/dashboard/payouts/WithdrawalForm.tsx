"use client";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Wallet,
  Smartphone,
  Building2,
  DollarSign,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";

type PaymentMethod = "Crypto" | "MobileMoney" | "BankAccount";

const baseSchema = z.object({
  event_id: z.string().min(1, "Event is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Amount must be a positive number"),
  method: z.enum(["Crypto", "MobileMoney", "BankAccount"]),
});

interface WithdrawalFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function WithdrawalForm({
  onSubmit,
  isLoading = false,
}: WithdrawalFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Crypto");
  const [revenueDetails, setRevenueDetails] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const { useMyEvents, useEventRevenue } = useEvent();

  const { data: events, isLoading: isEventsLoading } = useMyEvents({
    owner: true,
  });

  // Fetch revenue for selected event and update balance
  const { data: revenue } = useEventRevenue(selectedEvent);
  useEffect(() => {
    if (selectedEvent && revenue?.result) {
      setRevenueDetails(revenue.result);
    } else {
      setRevenueDetails(null);
    }
  }, [selectedEvent, revenue]);

  const form = useForm<any>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      amount: "",
      method: paymentMethod,
      event_id: "",
    },
  });

  // Keep event_id in form synced with selectedEvent
  useEffect(() => {
    form.setValue("event_id", selectedEvent);
  }, [selectedEvent, form]);

  const handleSubmit = (data: any) => {
    toast.custom("Your withdrawal request has been submitted for processing.");
    onSubmit(data);
  };

  const paymentMethods = [
    { value: "Crypto", label: "Cryptocurrency", icon: Wallet },
    { value: "MobileMoney", label: "Mobile Money", icon: Smartphone },
    { value: "BankAccount", label: "Bank Account", icon: Building2 },
  ];

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader></CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="event_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Event</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedEvent(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an event to withdraw from" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {events?.result?.results.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{event.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedEvent && revenueDetails && (
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Available for Payout:
                  </span>
                  <span className="text-xl font-semibold text-primary">
                    KES {Number(revenueDetails.available_for_payout).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Total Revenue:</span>
                    <span>
                      KES {Number(revenueDetails.total_revenue).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee:</span>
                    <span>
                      - KES {Number(revenueDetails.platform_fee).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Revenue:</span>
                    <span>
                      KES {Number(revenueDetails.net_revenue).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Withdrawn:</span>
                    <span>
                      - KES {Number(revenueDetails.total_withdrawn).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (KES)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0.00"
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Button
                      key={method.value}
                      type="button"
                      variant={
                        paymentMethod === method.value ? "default" : "outline"
                      }
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() => {
                        setPaymentMethod(method.value as PaymentMethod);
                        form.setValue("method", method.value as PaymentMethod);
                      }}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm">{method.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <Button
              variant="default"
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Submit Withdrawal Request"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
