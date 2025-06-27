"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Search, UserPlus } from "lucide-react";

import { AttendeeDetails } from "./AttendeeDetails";
import { AttendeesPagination } from "./AttendeesPagination";
import { AttendeesTable } from "./AttendeesTable";
import { Button } from "@/components/ui/button";
import { ExportFormat } from "@/types/ticket";
import { ExportPopup } from "./ExportPopup";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useTicket } from "@/hooks/useTicket";

// interface AttendeeDetailsProps {
//   ticket: any;
//   onBack: () => void;
// }

// function AttendeeDetails({ ticket, onBack }: AttendeeDetailsProps) {
//   const formatDate = (dateString: string | undefined) => {
//     if (!dateString) return "N/A";
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
//     } catch {
//       return dateString;
//     }
//   };

//   const getStatusBadge = (status: TicketStatus) => {
//     switch (status) {
//       case TicketStatus.VALID:
//         return (
//           <Badge variant="default" className="bg-green-500 hover:bg-green-600">
//             Valid
//           </Badge>
//         );
//       case TicketStatus.USED:
//         return <Badge variant="secondary">Used</Badge>;
//       case TicketStatus.PENDING:
//         return (
//           <Badge
//             variant="outline"
//             className="border-yellow-500 text-yellow-600"
//           >
//             Pending
//           </Badge>
//         );
//       case TicketStatus.CANCELLED:
//         return <Badge variant="destructive">Cancelled</Badge>;
//       case TicketStatus.REFUNDED:
//         return (
//           <Badge variant="outline" className="border-red-500 text-red-600">
//             Refunded
//           </Badge>
//         );
//       default:
//         return <Badge variant="secondary">{status}</Badge>;
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center gap-4">
//         <Button variant="ghost" size="sm" onClick={onBack}>
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Back
//         </Button>
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Ticket Details</h1>
//           <p className="text-muted-foreground">
//             Ticket: {ticket.ticket_number}
//           </p>
//         </div>
//       </div>

//       <div className="grid gap-6 md:grid-cols-2">
//         <Card>
//           <CardHeader>
//             <CardTitle>Ticket Information</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Status:</span>
//               {getStatusBadge(ticket.status)}
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Ticket Number:</span>
//               <span className="font-mono text-sm font-medium">
//                 {ticket.ticket_number}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Type:</span>
//               <span className="font-medium">{ticket.ticket_type_name}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Price:</span>
//               <span className="font-medium">KSH {ticket.purchase_price}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Created:</span>
//               <span className="font-medium">
//                 {formatDate(ticket.created_at)}
//               </span>
//             </div>
//             {ticket.checked_in_at && (
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Checked In:</span>
//                 <span className="font-medium">
//                   {formatDate(ticket.checked_in_at)}
//                 </span>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Event Information</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex justify-between items-start">
//               <span className="text-muted-foreground">Event Title:</span>
//               <span className="font-medium text-right max-w-[60%]">
//                 {ticket.event_title}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Event ID:</span>
//               <span className="font-mono text-sm text-muted-foreground">
//                 {ticket.event}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted-foreground">Ticket Type ID:</span>
//               <span className="font-mono text-sm text-muted-foreground">
//                 {ticket.ticket_type}
//               </span>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {ticket.owner_details && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Customer Information</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Name:</span>
//                   <span className="font-medium">
//                     {ticket.owner_details.first_name}{" "}
//                     {ticket.owner_details.last_name}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Email:</span>
//                   <span className="font-medium text-right max-w-[60%] break-all">
//                     {ticket.owner_details.email}
//                   </span>
//                 </div>
//               </div>
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Customer ID:</span>
//                   <span className="font-mono text-sm text-muted-foreground">
//                     {ticket.owner_details.id}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Owner ID:</span>
//                   <span className="font-mono text-sm text-muted-foreground">
//                     {ticket.owner}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {ticket.qr_code && (
//         <Card>
//           <CardHeader>
//             <CardTitle>QR Code</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="flex justify-center">
//               <div className="text-center">
//                 <img
//                   src={ticket.qr_code}
//                   alt="Ticket QR Code"
//                   className="w-48 h-48 object-contain border rounded-lg"
//                 />
//                 <p className="text-sm text-muted-foreground mt-2">
//                   Scan this QR code for check-in
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

export function AttendeesContent({ eventId }: { eventId: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showExportPopup, setShowExportPopup] = useState(false);
  const { useTickets, useExportTickets } = useTicket();

  const { data: ticketsData, isLoading } = useTickets(eventId, {
    page: currentPage,
    search: searchQuery || undefined,
    page_size: 10,
  });
  const exportTickets = useExportTickets();

  const tickets = ticketsData?.result?.results || [];
  const totalPages = Math.ceil((ticketsData?.result?.count ?? 0) / 10);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      // Request payload for export
      const exportRequest = {
        event_id: eventId,
        format: format,
        filters: {
          search: searchQuery || undefined,
          status: undefined, // Could add status filter
          date_from: undefined, // Could add date range
          date_to: undefined,
        },
        include_fields: [
          "ticket_number",
          "ticket_type_name",
          "purchase_price",
          "status",
          "created_at",
          "checked_in_at",
          "owner_details.first_name",
          "owner_details.last_name",
          "owner_details.email",
          "event_title",
        ],
      };

      console.log("Export request:", exportRequest);

      // Call the export API
      const response = await exportTickets.mutateAsync(exportRequest);

      console.log("Export response:", response);

      // Handle the response - typically returns a download URL or file
      if (response?.result?.download_url) {
        // Trigger download
        const link = document.createElement("a");
        link.href = response.result.download_url;
        link.download = `attendees-${eventId}-${format}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setShowExportPopup(false);
    } catch (error) {
      console.error("Error exporting tickets:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Skeleton className="h-10 w-64" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedTicket) {
    return (
      <AttendeeDetails
        ticket={selectedTicket}
        onBack={() => setSelectedTicket(null)}
      />
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Attendees</h1>
            <p className="text-muted-foreground">
              {ticketsData?.result?.count || 0} ticket
              {(ticketsData?.result?.count || 0) !== 1 ? "s" : ""} sold for this
              event
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              className="gap-2 w-full sm:w-auto"
              onClick={() => setShowExportPopup(true)}
              disabled={exportTickets.isPending}
            >
              <Download className="h-4 w-4" />
              {exportTickets.isPending ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">All Attendees</CardTitle>
            <CardDescription className="text-muted-foreground">
              A list of all ticket holders for this event
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ticket number, customer name, or email..."
                  className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery ? "No tickets found" : "No tickets sold yet"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Tickets will appear here once they are purchased"}
                </p>
              </div>
            ) : (
              <>
                <AttendeesTable
                  tickets={tickets}
                  onViewDetails={setSelectedTicket}
                />
                <AttendeesPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ExportPopup
        isOpen={showExportPopup}
        onClose={() => setShowExportPopup(false)}
        onExport={handleExport}
        isLoading={exportTickets.isPending}
      />
    </>
  );
}
