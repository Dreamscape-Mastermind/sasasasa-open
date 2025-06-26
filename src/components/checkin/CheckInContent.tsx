"use client";

import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle,
  Download,
  QrCode,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { CheckInHistory } from "@/components/checkin/CheckInHistory";
import { CheckInStats } from "@/components/checkin/CheckInStats";
import { QRScanner } from "@/components/checkin/qr/QRScanner";
import { useCheckin } from "@/hooks/useCheckin";
import {
  CheckInStatus,
  type CheckIn,
  type CheckInQueryParams,
  type ScanTicketRequest,
} from "@/types/checkin";
import { useState, useEffect } from "react";
import { useMobile } from "@/hooks/use-mobile";

interface QRScanResult {
  text: string;
  timestamp: Date;
  format?: string;
}

export function CheckInContent({ eventId }: { eventId: string }) {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<CheckIn | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [queryParams, setQueryParams] = useState<CheckInQueryParams>({
    page: 1,
    ordering: "-check_in_time",
    page_size: 10,
  });

  const { useCheckIns, useScanTicket, useCheckInStats } = useCheckin();

  const {
    data: checkInData,
    isLoading: isLoadingCheckIns,
    refetch,
  } = useCheckIns(eventId, queryParams);

  useEffect(() => {
    refetch();
  }, [queryParams]);

  const { data: stats, isLoading: isLoadingStats } = useCheckInStats(eventId);
  const scanTicketMutation = useScanTicket(eventId);

  const isMobile = useMobile();

  const handleQRScan = async (result: QRScanResult) => {
    setIsProcessing(true);

    try {
      const scanData: ScanTicketRequest = {
        qr_data: result.text,
        device_info: {
          device_id: "web-scanner",
          name: "Web Scanner",
          model: "Web Browser",
          os: navigator.platform,
          version: navigator.userAgent,
        },
        location: {
          accuracy: 0,
          latitude: 0,
          longitude: 0,
        },
      };

      const response = await scanTicketMutation.mutateAsync(scanData);
      if (response.result) {
        setScannedTicket(response.result ?? null);
      }
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setIsProcessing(false);
      setIsScannerActive(false);
    }
  };

  const handleNextScan = () => {
    setScannedTicket(null);
    setIsProcessing(false);
    setIsScannerActive(true);
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  const handleSearch = (query: string) => {
    setQueryParams((prev) => ({
      ...prev,
      page: 1, // Reset to first page on new search
      search: query || undefined,
    }));
  };

  const handleFilter = (status: CheckInStatus | "all") => {
    setQueryParams((prev) => ({
      ...prev,
      page: 1, // Reset to first page on new filter
      status: status !== "all" ? status : undefined,
    }));
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

  const exportCheckInData = () => {
    if (!checkInData?.result) return;

    const csvContent = [
      ["Ticket ID", "Attendee", "Ticket Type", "Check-in Time", "Status"],
      ...checkInData.result.results.map((record) => [
        record.ticket,
        record.ticket_details.owner,
        record.ticket_details.ticket_type,
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

  return (
    <div className="p-3 md:p-6 bg-background">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Event Check-in
            </h1>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent bg-card"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportCheckInData}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats */}
      <CheckInStats stats={stats?.result} isLoading={isLoadingStats} />

      {/* Unified Check-in Card */}
      <div className="mt-8 bg-card rounded-t-2xl md:rounded-lg shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <QrCode className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-foreground">
                Ticket Scanner
              </h2>
            </div>
            <button
              onClick={() => setIsScannerActive(!isScannerActive)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto mt-2 sm:mt-0
                ${
                  isScannerActive
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }
              `}
            >
              {isScannerActive ? (
                <>
                  <CameraOff className="h-5 w-5 mr-2" />
                  Stop Scanner
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5 mr-2" />
                  Start Scanner
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Scanner Section */}
          {isScannerActive && (
            <div className="mb-6">
              <QRScanner
                onScan={handleQRScan}
                isActive={isScannerActive}
                onToggle={() => setIsScannerActive(!isScannerActive)}
                fullscreen={isMobile}
              />
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mr-3"></div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Processing Ticket...
                  </h3>
                  <p className="text-blue-700 dark:text-blue-200">
                    Verifying ticket information
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ticket Information Display */}
          {scannedTicket && !isProcessing && (
            <div
              className={`border-2 rounded-lg p-6 mb-6 ${getStatusColor(
                scannedTicket.status
              )}`}
            >
              <div className="flex items-center justify-center mb-4">
                {getStatusIcon(scannedTicket.status)}
              </div>

              <h3 className="text-lg font-semibold text-center mb-6 text-foreground">
                {getStatusText(scannedTicket.status)}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ticket Number
                  </label>
                  <p className="font-mono text-sm bg-muted p-2 rounded border border-border mt-1 text-foreground">
                    {scannedTicket.ticket_details.ticket_number}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ticket Type
                  </label>
                  <p className="font-medium mt-1 text-foreground">
                    {scannedTicket.ticket_details.ticket_type.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Checked in by
                  </label>
                  <p className="font-semibold mt-1 text-foreground">
                    {scannedTicket.checked_in_by_details.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Event
                  </label>
                  <p className="font-medium mt-1 text-foreground">
                    {scannedTicket.event_details.title}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Check-in Time
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {scannedTicket.check_in_time}
                  </p>
                </div>

                {scannedTicket.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Notes
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {scannedTicket.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleNextScan}
                  className="flex-1 bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                  Scan Next Ticket
                </button>
                <button
                  onClick={() => setScannedTicket(null)}
                  className="flex-1 bg-secondary text-secondary-foreground py-3 px-4 rounded-lg font-medium hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors"
                >
                  Clear Results
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!scannedTicket && !isProcessing && (
            <div className="text-center py-8 bg-muted rounded-lg">
              <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Ready to Scan
              </h3>
              <p className="text-muted-foreground mb-4">
                {isScannerActive
                  ? "Point the camera at a QR code to verify the ticket"
                  : 'Click "Start Scanner" to begin scanning tickets'}
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Ensure good lighting for best results</p>
                <p>• Hold the QR code steady in the camera view</p>
                <p>• Results will appear automatically after scanning</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Check-in History */}
      <div className="mt-8">
        <CheckInHistory
          records={checkInData?.result?.results ?? []}
          isLoading={isLoadingCheckIns}
          totalPages={Math.ceil((checkInData?.result?.count ?? 0) / 10)}
          currentPage={queryParams.page ?? 1}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onFilter={handleFilter}
        />
      </div>
    </div>
  );
}
