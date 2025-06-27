"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ExportFormat } from "@/types/ticket";
import { useState } from "react";

interface ExportPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
  isLoading?: boolean;
}

const exportFormats = [
  {
    id: "excel" as ExportFormat,
    name: "Excel Spreadsheet",
    description: "Microsoft Excel (.xlsx)",
    icon: FileSpreadsheet,
    color: "text-green-500",
  },
  {
    id: "csv" as ExportFormat,
    name: "CSV File",
    description: "Comma Separated Values",
    icon: FileText,
    color: "text-blue-500",
  },
];

export function ExportPopup({
  isOpen,
  onClose,
  onExport,
  isLoading,
}: ExportPopupProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(
    null
  );

  const handleExport = () => {
    if (selectedFormat) {
      onExport(selectedFormat);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Attendees
          </DialogTitle>
          <DialogDescription>
            Choose the format you'd like to export your attendees data in.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {exportFormats.map((format) => {
            const Icon = format.icon;
            return (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`w-full p-4 border rounded-lg text-left transition-all hover:bg-muted/50 ${
                  selectedFormat === format.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-6 w-6 ${format.color}`} />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {format.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format.description}
                    </div>
                  </div>
                  {selectedFormat === format.id && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={!selectedFormat || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
