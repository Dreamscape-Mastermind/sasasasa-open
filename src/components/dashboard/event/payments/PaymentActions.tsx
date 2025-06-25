"use client";

import { Download, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaymentActionsProps {
  onFilter?: () => void;
  onExport?: () => void;
}

export function PaymentActions({ onFilter, onExport }: PaymentActionsProps) {
  return (
    <div className="flex gap-4">
      <Button variant="outline" className="gap-2" onClick={onFilter}>
        <Filter className="h-4 w-4" />
        Filter
      </Button>
      <Button variant="outline" className="gap-2" onClick={onExport}>
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  );
}
