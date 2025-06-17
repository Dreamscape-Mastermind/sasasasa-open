"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Download, QrCode, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CheckIn } from "@/types/checkin";
import { CheckInHistory } from "@/components/checkin/CheckInHistory";
import { CheckInStats } from "@/components/checkin/CheckInStats";
import { ScannerModal } from "@/components/checkin/ScannerModal";
import toast from "react-hot-toast";
import { useCheckin } from "@/hooks/useCheckin";
import { useParams } from "next/navigation";
import { useState } from "react";

interface CheckInStatsData {
  totalTickets: number;
  checkedIn: number;
  pending: number;
  invalid: number;
}

const StatsSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const HistorySkeleton = () => (
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
      <tbody>
        {[1, 2, 3].map((i) => (
          <tr key={i} className="border-b animate-pulse">
            <td className="p-4">
              <div className="h-4 w-24 bg-muted rounded" />
            </td>
            <td className="p-4">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </td>
            <td className="p-4">
              <div className="h-4 w-20 bg-muted rounded" />
            </td>
            <td className="p-4">
              <div className="h-4 w-16 bg-muted rounded" />
            </td>
            <td className="p-4">
              <div className="h-4 w-32 bg-muted rounded" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export function CheckInContent() {
  const params = useParams();
  const eventId = params.id as string;
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<CheckIn | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { useScanTicket, useCheckIns, useCheckInStats } = useCheckin();
  const {
    data: checkInsData,
    isLoading: isCheckInsLoading,
    error: checkInsError,
  } = useCheckIns(eventId);
  const {
    data: statsData,
    isLoading: isStatsLoading,
    error: statsError,
  } = useCheckInStats(eventId);
  const { mutate: scanTicket } = useScanTicket(eventId);

  const handleQRScan = (data: string) => {
    if (!data) {
      setLastScanResult(null);
      return;
    }

    setIsProcessing(true);
    scanTicket(
      {
        qr_data: data,
        device_info: {
          device_id: "device-123",
          name: "Scanner App",
          model: navigator.userAgent,
          os: navigator.platform,
          version: "1.0.0",
        },
        location: {
          latitude: 0,
          longitude: 0,
          accuracy: 0,
        },
      },
      {
        onSuccess: (response) => {
          setLastScanResult(response.result || null);
          const attendeeName =
            response.result?.ticket_details?.owner || "Unknown";
          toast.success(`Check-in successful for ${attendeeName}`);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to check in ticket");
        },
        onSettled: () => {
          setIsProcessing(false);
        },
      }
    );
  };

  const exportCheckInData = () => {
    if (!checkInsData?.result?.results) return;

    const csvContent = [
      [
        "Ticket ID",
        "Attendee Name",
        "Email",
        "Ticket Type",
        "Check-in Time",
        "Status",
      ],
      ...checkInsData.result.results.map((record: CheckIn) => [
        record.ticket_details?.ticket_number || "N/A",
        record.ticket_details?.owner || "N/A",
        record.ticket_details?.owner || "N/A",
        record.ticket_details?.ticket_type_name || "N/A",
        record.check_in_time,
        record.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkin-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const defaultStats: CheckInStatsData = {
    totalTickets: 0,
    checkedIn: 0,
    pending: 0,
    invalid: 0,
  };

  const stats: CheckInStatsData = statsData?.result
    ? {
        totalTickets: statsData.result.total_tickets || 0,
        checkedIn: statsData.result.checked_in || 0,
        pending: statsData.result.pending || 0,
        invalid: statsData.result.invalid || 0,
      }
    : defaultStats;

  const eventTitle =
    (!isCheckInsLoading &&
      checkInsData?.result?.results[0]?.ticket_details?.event_title) ||
    "";


  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Event Check-in</h1>
            <p className="text-muted-foreground">{eventTitle}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setIsScannerModalOpen(true)}>
            <QrCode className="h-4 w-4 mr-2" />
            Scan Ticket
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportCheckInData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats */}
      {isStatsLoading ? (
        <StatsSkeleton />
      ) : statsError ? (
        <div className="text-red-500">Failed to load stats.</div>
      ) : (
        <CheckInStats stats={stats} />
      )}

      {/* Scanner and History */}
      <div className="mt-8">
        {isCheckInsLoading ? (
          <HistorySkeleton />
        ) : checkInsError ? (
          <div className="text-red-500">Failed to load check-ins.</div>
        ) : checkInsData?.result?.results?.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No check-ins found.
          </div>
        ) : (
          <CheckInHistory records={checkInsData?.result?.results ?? []} />
        )}
      </div>

      {/* Scanner Modal */}
      <ScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onScan={handleQRScan}
        lastScanResult={lastScanResult}
        isProcessing={isProcessing}
      />
    </div>
  );
}
