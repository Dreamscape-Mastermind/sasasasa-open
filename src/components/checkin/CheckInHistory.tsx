import { CheckCircle, Clock, Search, XCircle } from "lucide-react";
import { CheckInStatus, type CheckIn } from "@/types/checkin";
import { useState } from "react";
import { formatDateTime } from "@/lib/utils";

interface CheckInHistoryProps {
  records: CheckIn[];
  isLoading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onFilter?: (status: CheckInStatus | "all") => void;
}

export function CheckInHistory({
  records,
  isLoading,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  onSearch,
  onFilter,
}: CheckInHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<CheckInStatus | "all">(
    "all"
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleFilterChange = (status: CheckInStatus | "all") => {
    setSelectedStatus(status);
    onFilter?.(status);
  };

  const getStatusIcon = (status: CheckInStatus) => {
    switch (status) {
      case CheckInStatus.SUCCESS:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case CheckInStatus.FAILED:
      case CheckInStatus.INVALID_QR:
      case CheckInStatus.WRONG_EVENT:
        return <XCircle className="h-5 w-5 text-red-600" />;
      case CheckInStatus.DUPLICATE:
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: CheckInStatus) => {
    switch (status) {
      case CheckInStatus.SUCCESS:
        return "Checked In";
      case CheckInStatus.FAILED:
      case CheckInStatus.INVALID_QR:
      case CheckInStatus.WRONG_EVENT:
        return "Invalid Ticket";
      case CheckInStatus.DUPLICATE:
        return "Already Checked In";
      case CheckInStatus.EVENT_NOT_STARTED:
        return "Event Not Started";
      case CheckInStatus.EVENT_ENDED:
        return "Event Has Ended";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: CheckInStatus) => {
    switch (status) {
      case CheckInStatus.SUCCESS:
        return "text-green-600 bg-green-50 dark:bg-green-950/20";
      case CheckInStatus.FAILED:
      case CheckInStatus.INVALID_QR:
      case CheckInStatus.WRONG_EVENT:
        return "text-red-600 bg-red-50 dark:bg-red-950/20";
      case CheckInStatus.DUPLICATE:
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="px-6 py-4 border-b border-border">
          <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 mb-4">
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Check-ins
          </h2>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </form>

            <select
              value={selectedStatus}
              onChange={(e) =>
                handleFilterChange(e.target.value as CheckInStatus | "all")
              }
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value={CheckInStatus.SUCCESS}>Checked In</option>
              <option value={CheckInStatus.FAILED}>Failed</option>
              <option value={CheckInStatus.DUPLICATE}>Duplicate</option>
              <option value={CheckInStatus.INVALID_QR}>Invalid QR</option>
              <option value={CheckInStatus.WRONG_EVENT}>Wrong Event</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden p-4 space-y-3">
        {records.length === 0 ? (
          <div className="text-center py-8 bg-muted rounded-lg">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No check-ins found</p>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="rounded-xl border p-4 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(record.status)}
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      record.status
                    )}`}
                  >
                    {getStatusText(record.status)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDateTime(record.check_in_time)}
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="uppercase tracking-wide text-muted-foreground">
                    Attendee
                  </div>
                  <div className="text-foreground truncate">
                    {record.ticket_details?.owner?.name ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="uppercase tracking-wide text-muted-foreground">
                    Ticket
                  </div>
                  <div className="font-mono text-foreground break-all">
                    {record.ticket_details?.ticket_number}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="uppercase tracking-wide text-muted-foreground">
                    Type
                  </div>
                  <div className="text-foreground">
                    {record.ticket_details?.ticket_type?.name}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted">
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                Attendee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                Ticket Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                Ticket Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                Check-in Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-muted/50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {getStatusIcon(record.status)}
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {getStatusText(record.status)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {record.ticket_details?.owner?.name ?? "—"}
                    </div>
                    {record.ticket_details?.owner?.email && (
                      <div className="text-sm text-muted-foreground">
                        {record.ticket_details?.owner?.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-foreground font-mono">
                  {record.ticket_details?.ticket_number}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {record.ticket_details?.ticket_type?.name}
                    </div>
                    {record.ticket_details?.ticket_type?.price && (
                      <div className="text-sm text-muted-foreground">
                        {record.ticket_details?.ticket_type?.price}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {formatDateTime(record.check_in_time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {records.length === 0 && (
        <div className="hidden sm:block text-center py-12 bg-muted rounded-b-lg">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No check-ins found</p>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
