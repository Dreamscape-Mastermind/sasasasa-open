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
        return "text-green-600 bg-green-50";
      case CheckInStatus.FAILED:
      case CheckInStatus.INVALID_QR:
      case CheckInStatus.WRONG_EVENT:
        return "text-red-600 bg-red-50";
      case CheckInStatus.DUPLICATE:
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm dark:bg-[#232326]">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 mb-4">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm dark:bg-[#232326]">
      <div className="px-6 py-4 border-b dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground dark:text-white">
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
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#CC322D]"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>

            <select
              value={selectedStatus}
              onChange={(e) =>
                handleFilterChange(e.target.value as CheckInStatus | "all")
              }
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#CC322D]"
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

      <div className="overflow-x-auto">
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
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {records.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-muted/50 dark:hover:bg-[#18181b]"
              >
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
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {record.ticket_details.owner.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {record.ticket_details.owner.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-mono">
                  {record.ticket_details.ticket_number}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {record.ticket_details.ticket_type.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {record.ticket_details.ticket_type.price}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                  {formatDateTime(record.check_in_time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {records.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-[#18181b] rounded-b-lg">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-300 text-lg">
            No check-ins found
          </p>
          <p className="text-gray-400 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
