import { CheckCircle, Clock, XCircle } from "lucide-react";
// src/components/checkin/ScannerModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { CheckIn } from "@/types/checkin";
import { QRScanner } from "./QRScanner";
import { useState } from "react";

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  lastScanResult?: CheckIn | null;
  isProcessing: boolean;
}

export function ScannerModal({
  isOpen,
  onClose,
  onScan,
  lastScanResult,
  isProcessing,
}: ScannerModalProps) {
  const [isScannerActive, setIsScannerActive] = useState(true);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "failed":
        return <XCircle className="h-6 w-6 text-red-500" />;
      case "duplicate":
        return <Clock className="h-6 w-6 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "bg-green-500/10 border-green-500/20";
      case "failed":
        return "bg-red-500/10 border-red-500/20";
      case "duplicate":
        return "bg-yellow-500/10 border-yellow-500/20";
      default:
        return "bg-muted border-muted";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Scan Ticket</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="space-y-4">
            <QRScanner
              onScan={(data) => {
                onScan(data);
                setIsScannerActive(false);
              }}
              isActive={isScannerActive}
              onToggle={() => setIsScannerActive((prev) => !prev)}
            />
          </div>

          {/* Ticket Information Section */}
          <div className="space-y-4">
            {lastScanResult ? (
              <div
                className={`p-6 rounded-lg border ${getStatusColor(
                  lastScanResult.status
                )}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {getStatusIcon(lastScanResult.status)}
                  <h3 className="text-lg font-semibold">
                    {lastScanResult.status === "SUCCESS"
                      ? "Valid Ticket"
                      : lastScanResult.status === "FAILED"
                      ? "Invalid Ticket"
                      : "Already Checked In"}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ticket ID</p>
                    <p className="font-mono">
                      {lastScanResult.ticket_details?.ticket_number}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Attendee</p>
                    <p className="font-medium">
                      {lastScanResult.ticket_details?.owner}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Ticket Type</p>
                    <p>{lastScanResult.ticket_details?.ticket_type_name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Event</p>
                    <p>{lastScanResult.ticket_details?.event_title}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Check-in Time
                    </p>
                    <p>
                      {new Date(lastScanResult.check_in_time).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center text-muted-foreground">
                Scan a ticket to see details
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsScannerActive(true);
                  onScan("");
                }}
                className="flex-1"
              >
                Next Scan
              </Button>
              <Button variant="default" onClick={onClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
