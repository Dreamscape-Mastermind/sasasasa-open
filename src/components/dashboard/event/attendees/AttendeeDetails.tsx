"use client";

import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketStatus } from "@/types/ticket";
import { format } from "date-fns";

interface AttendeeDetailsProps {
  ticket: any;
  onBack: () => void;
}

export function AttendeeDetails({ ticket, onBack }: AttendeeDetailsProps) {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.VALID:
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            Valid
          </Badge>
        );
      case TicketStatus.USED:
        return <Badge variant="secondary">Used</Badge>;
      case TicketStatus.PENDING:
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            Pending
          </Badge>
        );
      case TicketStatus.CANCELLED:
        return <Badge variant="destructive">Cancelled</Badge>;
      case TicketStatus.REFUNDED:
        return (
          <Badge variant="outline" className="border-red-500 text-red-600">
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status ?? 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ticket Details</h1>
          <p className="text-muted-foreground">
            Ticket: {ticket?.ticket_number ?? 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              {getStatusBadge(ticket?.status)}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticket Number:</span>
              <span className="font-mono text-sm font-medium">
                {ticket?.ticket_number ?? 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{ticket?.ticket_type_name ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-medium">KSH {ticket?.purchase_price ?? '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">
                {formatDate(ticket?.created_at)}
              </span>
            </div>
            {ticket?.checked_in_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Checked In:</span>
                <span className="font-medium">
                  {formatDate(ticket.checked_in_at)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Event Title:</span>
              <span className="font-medium text-right max-w-[60%]">
                {ticket?.event_title ?? 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Event ID:</span>
              <span className="font-mono text-sm text-muted-foreground">
                {ticket?.event ?? 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticket Type ID:</span>
              <span className="font-mono text-sm text-muted-foreground">
                {ticket?.ticket_type ?? 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {ticket?.owner_details && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">
                    {ticket.owner_details?.first_name ?? ''}{" "}
                    {ticket.owner_details?.last_name ?? ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-right max-w-[60%] break-all">
                    {ticket.owner_details?.email ?? 'N/A'}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer ID:</span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {ticket.owner_details?.id ?? 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner ID:</span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {ticket.owner ?? 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {ticket?.qr_code && (
        <Card>
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="text-center">
                <img
                  src={ticket.qr_code}
                  alt="Ticket QR Code"
                  className="w-48 h-48 object-contain border rounded-lg"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Scan this QR code for check-in
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
