import { CheckCircle, Clock, XCircle } from "lucide-react";

import type { CheckIn } from "@/types/checkin";
import { cn } from "@/lib/utils";

interface CheckInHistoryProps {
  records: CheckIn[];
}

export function CheckInHistory({ records }: CheckInHistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "duplicate":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "Checked In";
      case "failed":
        return "Invalid Ticket";
      case "duplicate":
        return "Already Checked In";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "text-green-500 bg-green-500/10";
      case "failed":
        return "text-red-500 bg-red-500/10";
      case "duplicate":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Status
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Attendee
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Ticket ID
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Ticket Type
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Check-in Time
            </th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {records.map((record) => (
            <tr
              key={record.id}
              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            >
              <td className="p-4 align-middle">
                <div className="flex items-center gap-2">
                  {getStatusIcon(record.status)}
                  <span
                    className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      getStatusColor(record.status)
                    )}
                  >
                    {getStatusText(record.status)}
                  </span>
                </div>
              </td>
              <td className="p-4 align-middle">
                <div>
                  <div className="font-medium">
                    {record.ticket_details?.owner || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {record.ticket_details?.owner || "N/A"}
                  </div>
                </div>
              </td>
              <td className="p-4 align-middle font-mono text-sm">
                {record.ticket_details?.ticket_number || "N/A"}
              </td>
              <td className="p-4 align-middle">
                {record.ticket_details?.ticket_type_name || "N/A"}
              </td>
              <td className="p-4 align-middle text-sm text-muted-foreground">
                {record.check_in_time
                  ? new Date(record.check_in_time).toLocaleString()
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {records.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No check-ins yet</p>
          <p className="text-sm text-muted-foreground">
            Start scanning QR codes to see check-in history
          </p>
        </div>
      )}
    </div>
  );
}
