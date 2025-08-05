"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Wallet, Smartphone, Building2, DollarSign } from "lucide-react";
import toast from 'react-hot-toast';

type PaymentMethod = "crypto" | "mobile_money" | "bank_account";

const baseSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
  payment_method: z.enum(["crypto", "mobile_money", "bank_account"]),
});

const cryptoSchema = baseSchema.extend({
  wallet_address: z.string().min(1, "Wallet address is required"),
  crypto_currency: z.string().min(1, "Cryptocurrency is required"),
});

const mobileMoneySchema = baseSchema.extend({
  phone_number: z.string().min(1, "Phone number is required"),
  provider: z.string().min(1, "Provider is required"),
});

const bankAccountSchema = baseSchema.extend({
  account_number: z.string().min(1, "Account number is required"),
  bank_name: z.string().min(1, "Bank name is required"),
  account_holder_name: z.string().min(1, "Account holder name is required"),
  routing_number: z.string().optional(),
});

interface WithdrawalFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function WithdrawalForm({ onSubmit, isLoading = false }: WithdrawalFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("crypto");

  const getSchema = () => {
    switch (paymentMethod) {
      case "crypto":
        return cryptoSchema;
      case "mobile_money":
        return mobileMoneySchema;
      case "bank_account":
        return bankAccountSchema;
      default:
        return baseSchema;
    }
  };

  const form = useForm<any>({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      amount: "",
      payment_method: paymentMethod,
    },
  });

  const handleSubmit = (data: any) => {
    console.log("Withdrawal request:", data);
    toast.success("Your withdrawal request has been submitted for processing.");
    onSubmit(data);
  };

  const paymentMethods = [
    { value: "crypto", label: "Cryptocurrency", icon: Wallet },
    { value: "mobile_money", label: "Mobile Money", icon: Smartphone },
    { value: "bank_account", label: "Bank Account", icon: Building2 },
  ];

  const renderPaymentMethodFields = () => {
    switch (paymentMethod) {
      case "crypto":
        return (
          <>
            <FormField
              control={form.control}
              name="crypto_currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cryptocurrency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cryptocurrency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                      <SelectItem value="usdt">Tether (USDT)</SelectItem>
                      <SelectItem value="usdc">USD Coin (USDC)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wallet_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your wallet address" 
                      {...field} 
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "mobile_money":
        return (
          <>
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="airtel_money">Airtel Money</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your phone number" 
                      {...field} 
                      type="tel"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "bank_account":
        return (
          <>
            <FormField
              control={form.control}
              name="account_holder_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Holder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account holder name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter bank name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="routing_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Routing Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter routing number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>Request Withdrawal</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (USD)</FormLabel>
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
                      variant={paymentMethod === method.value ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() => {
                        setPaymentMethod(method.value as PaymentMethod);
                        form.setValue("payment_method", method.value as PaymentMethod);
                       
                        form.setValue("wallet_address", "");
                        form.setValue("crypto_currency", "");
                        form.setValue("phone_number", "");
                        form.setValue("account_holder_name", "");
                        form.setValue("bank_name", "");
                        form.setValue("account_number", "");
                        form.setValue("routing_number", "");
                        
                        console.log(form.getValues());
                      }}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm">{method.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              {renderPaymentMethodFields()}
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