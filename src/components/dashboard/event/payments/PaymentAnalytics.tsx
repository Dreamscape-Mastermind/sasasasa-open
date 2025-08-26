"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { usePayment } from "@/hooks/usePayment";

interface PaymentAnalyticsProps {
  eventId: string;
}

export function PaymentAnalytics({ eventId }: PaymentAnalyticsProps) {
  const { usePayments, usePaymentAnalytics } = usePayment();
  const { data } = usePaymentAnalytics({ event: eventId });

  const analytics = data?.result || {
    total_revenue: 0,
    pending_payments: 0,
    avg_ticket_price: 0,
    refunds: 0,
    revenue_change: "0.0%",
    pending_transactions: 0,
    refund_count: 0,
  };

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <span className="text-sm">KSH. </span>
            {analytics.total_revenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics.revenue_change} from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <span className="text-sm">KSH. </span>
            {analytics.pending_payments.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics.pending_transactions} transactions pending
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Ticket Price
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <span className="text-sm">KSH. </span>
            {analytics.avg_ticket_price.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">Across all events</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Refunds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <span className="text-sm">KSH. </span>
            {analytics?.refunds}
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics?.refund_count} refunds this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
