"use client";

import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PaymentActionsProps {
  onFilter?: () => void;
  onExport?: () => void;
}

export function PaymentActions({ onFilter, onExport }: PaymentActionsProps) {
  return (
    <div className="flex gap-2 sm:gap-3 items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-full px-3 sm:px-4" onClick={onFilter}>
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Filter payments</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="default" size="sm" className="gap-2 rounded-full px-3 sm:px-4" onClick={onExport}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Export transactions</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
