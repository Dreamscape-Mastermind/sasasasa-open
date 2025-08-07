"use client";

import { PaymentActions } from "./PaymentActions";
import { PaymentAnalytics } from "./PaymentAnalytics";
import { PaymentTransactionsTable } from "./PaymentTransactionsTable";

interface PaymentsContentProps {
  eventId: string;
}

export function PaymentsContent({ eventId }: PaymentsContentProps) {
  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log("Filter payments");
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export payments");
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            Manage your event payments and transactions
          </p>
        </div>
        <PaymentActions onFilter={handleFilter} onExport={handleExport} />
      </div>

      <PaymentAnalytics eventId={eventId} />
      <PaymentTransactionsTable eventId={eventId} />
    </div>
  );
}
