"use client";

import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Mail,
  User,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketStatus } from "@/types/ticket";
import { format } from "date-fns";

interface AttendeesTableProps {
  tickets: any[];
  onViewDetails: (ticket: any) => void;
}

export function AttendeesTable({
  tickets,
  onViewDetails,
}: AttendeesTableProps) {
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
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.VALID:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case TicketStatus.USED:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case TicketStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case TicketStatus.CANCELLED:
      case TicketStatus.REFUNDED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-foreground font-semibold">
                Ticket
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Customer
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Type
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Price
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Status
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <div className="font-medium text-foreground">
                    {ticket.ticket_number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {ticket.created_at
                      ? format(new Date(ticket.created_at), "MMM d, yyyy")
                      : "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">
                    {ticket.owner_details?.first_name}{" "}
                    {ticket.owner_details?.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {ticket.owner_details?.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-foreground">
                    {ticket.ticket_type_name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-foreground">
                    KES {ticket.purchase_price}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-foreground hover:text-primary"
                    onClick={() => onViewDetails(ticket)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="bg-card border-border hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(ticket.status)}
                    <h3 className="font-semibold text-foreground">
                      {ticket.ticket_number}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ticket.created_at
                      ? format(new Date(ticket.created_at), "MMM d, yyyy")
                      : "N/A"}
                  </p>
                </div>
                {getStatusBadge(ticket.status)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {ticket.owner_details?.first_name}{" "}
                    {ticket.owner_details?.last_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {ticket.owner_details?.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{ticket.event_title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">
                    KES {ticket.purchase_price}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-foreground hover:text-primary"
                  onClick={() => onViewDetails(ticket)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
