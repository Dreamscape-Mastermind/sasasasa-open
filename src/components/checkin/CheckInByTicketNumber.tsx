"use client";

import { useState } from "react";
import { useCheckin } from "@/hooks/useCheckin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Ticket,
} from "lucide-react";
import {
  CheckInStatus,
  type CheckIn,
  type CheckInByTicketNumberRequest,
} from "@/types/checkin";

export function CheckInByTicketNumber({ eventId }: { eventId: string }) {
  const [ticketNumber, setTicketNumber] = useState("");
  const [checkInResult, setCheckInResult] = useState<CheckIn | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { useCheckInByTicketNumber } = useCheckin();
  const checkInMutation = useCheckInByTicketNumber(eventId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ticketNumber.trim()) {
      setError("Please enter a ticket number.");
      return;
    }
    setError(null);
    setCheckInResult(null);

    const request: CheckInByTicketNumberRequest = {
      ticket_number: `TKT-${ticketNumber.trim()}`,
    };

    try {
      const response = await checkInMutation.mutateAsync(request);
      if (response.result) {
        setCheckInResult(response.result);
      } else {
        setError(response.message || "An unknown error occurred.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to check in ticket.");
    }
  };

  const getStatusIcon = (status: CheckInStatus) => {
    switch (status) {
      case CheckInStatus.SUCCESS:
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case CheckInStatus.FAILED:
      case CheckInStatus.INVALID_QR:
      case CheckInStatus.WRONG_EVENT:
        return <XCircle className="h-8 w-8 text-red-600" />;
      case CheckInStatus.DUPLICATE:
        return <AlertCircle className="h-8 w-8 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: CheckInStatus) => {
    switch (status) {
      case CheckInStatus.SUCCESS:
        return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800";
      case CheckInStatus.FAILED:
      case CheckInStatus.INVALID_QR:
      case CheckInStatus.WRONG_EVENT:
        return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800";
      case CheckInStatus.DUPLICATE:
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800";
      default:
        return "bg-muted border-border";
    }
  };

  const getStatusText = (status: CheckInStatus) => {
    switch (status) {
      case CheckInStatus.SUCCESS:
        return "Valid Ticket - Check-in Successful";
      case CheckInStatus.FAILED:
        return "Invalid Ticket";
      case CheckInStatus.DUPLICATE:
        return "Ticket Already Used";
      case CheckInStatus.INVALID_QR:
        return "Invalid QR Code";
      case CheckInStatus.WRONG_EVENT:
        return "Wrong Event Ticket";
      case CheckInStatus.EVENT_NOT_STARTED:
        return "Event Not Started";
      case CheckInStatus.EVENT_ENDED:
        return "Event Has Ended";
      default:
        return "Unknown Status";
    }
  };

  return (
    <div className="p-6 border-t border-border">
      <div className="flex items-center mb-4">
        <Ticket className="h-6 w-6 text-primary mr-2" />
        <h2 className="text-xl font-semibold text-foreground">
          Manual Check-in
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ticket-number">Ticket Number</Label>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              TKT-
            </span>
            <Input
              id="ticket-number"
              type="text"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="AB12XXXX"
              className="rounded-l-none w-full"
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={checkInMutation.isPending}
          className="w-full"
        >
          {checkInMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Check In
        </Button>
      </form>

      {checkInMutation.isPending && (
        <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mr-3"></div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Verifying Ticket...
              </h3>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {checkInResult && (
        <div
          className={`mt-6 border-2 rounded-lg p-6 ${getStatusColor(
            checkInResult.status
          )}`}
        >
          <div className="flex items-center justify-center mb-4">
            {getStatusIcon(checkInResult.status)}
          </div>
          <h3 className="text-lg font-semibold text-center mb-6 text-foreground">
            {getStatusText(checkInResult.status)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Ticket Number
              </Label>
              <p className="font-mono text-sm bg-muted p-2 rounded border border-border mt-1 text-foreground">
                {checkInResult.ticket_details?.ticket_number}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Ticket Type
              </Label>
              <p className="font-medium mt-1 text-foreground">
                {checkInResult.ticket_details?.ticket_type.name}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Checked in by
              </Label>
              <p className="font-semibold mt-1 text-foreground">
                {checkInResult.checked_in_by_details?.name}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Event
              </Label>
              <p className="font-medium mt-1 text-foreground">
                {checkInResult.event_details?.title}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Check-in Time
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {checkInResult.check_in_time}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setCheckInResult(null)}
            className="w-full mt-6"
            variant="outline"
          >
            Clear Result
          </Button>
        </div>
      )}
    </div>
  );
}
