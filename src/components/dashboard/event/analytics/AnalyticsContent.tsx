"use client";

import {
  BarChart2,
  DollarSign,
  Download,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// removed date range select
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useEvent } from "@/hooks/useEvent";

interface AnalyticsContentProps {
  eventId: string;
}

export function AnalyticsContent({ eventId }: AnalyticsContentProps) {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { useEventAnalytics, useExportEventAnalytics } = useEvent();

  const computedParams = useMemo(() => {
    return {
      granularity: "day" as const,
      include_checkins: true,
    };
  }, []);

  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = useEventAnalytics(eventId, computedParams);

  const { mutateAsync: exportAnalytics } = useExportEventAnalytics(eventId);

  // Handle errors more gracefully
  if (analyticsError) {
    const error = analyticsError as Error | any;
    console.error("Analytics error:", error);

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-semibold">
            Failed to load analytics
          </div>
          <div className="text-muted-foreground text-sm">
            {error?.message || "Please try refreshing the page"}
          </div>
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const analytics = analyticsData?.result;
  const currentEvent = analytics?.event;

  if (isLoadingAnalytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-cyan-400">Loading analytics...</div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-yellow-500 text-lg font-semibold">
            Event not found
          </div>
          <div className="text-muted-foreground text-sm">
            The event you're looking for doesn't exist or you don't have access
            to it.
          </div>
        </div>
      </div>
    );
  }

  // Error boundary for runtime errors
  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-semibold">
            Something went wrong
          </div>
          <div className="text-muted-foreground text-sm">
            {errorMessage || "An unexpected error occurred"}
          </div>
          <button
            onClick={() => {
              setHasError(false);
              setErrorMessage("");
              router.refresh();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  try {
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "KES",
      }).format(amount || 0);

    const timelinePoints = analytics?.ticketSales.timeline || [];

    const barColors = [
      "bg-primary",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-purple-500",
      "bg-sky-500",
      "bg-rose-500",
    ];

    const metrics = [
      {
        title: "Total Revenue",
        value: formatCurrency(analytics?.overview.totalRevenue || 0),
        change: `${analytics?.overview.revenueGrowth ?? 0}%`,
        trend: "up",
        description: "vs selected period",
      },
      {
        title: "Ticket Sales",
        value: (analytics?.overview.totalTicketsSold || 0).toString(),
        change: `${analytics?.overview.ticketGrowth ?? 0}%`,
        trend: "up",
        description: "vs selected period",
      },
      {
        title: "Attendees",
        value: (analytics?.overview.totalAttendees || 0).toString(),
        change: `${analytics?.overview.attendeeGrowth ?? 0}%`,
        trend: "up",
        description: `${
          analytics?.overview.attendanceRate || 0
        }% attendance rate`,
      },
      {
        title: "Avg. Ticket Price",
        value: formatCurrency(analytics?.overview.averageTicketPrice || 0),
        change: "",
        trend: "up",
        description: "Average price",
      },
    ];

    return (
      <div className="space-y-6 animate-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Track your event performance and metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={async () => {
                const res = await exportAnalytics({
                  format: "csv",
                  ...computedParams,
                });
                if (!res || !res.result) return;
                const { download_url, file_name } = res.result;
                if (!download_url) return;
                const a = document.createElement("a");
                a.href = download_url;
                if (file_name) a.download = file_name;
                a.click();
              }}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="default"
              className="gap-2"
              onClick={async () => {
                const res = await exportAnalytics({
                  format: "excel",
                  ...computedParams,
                });
                if (!res || !res.result) return;
                const { download_url, file_name } = res.result;
                if (!download_url) return;
                const a = document.createElement("a");
                a.href = download_url;
                if (file_name) a.download = file_name;
                a.click();
              }}
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                {metric.title === "Total Revenue" && (
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                )}
                {metric.title === "Ticket Sales" && (
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                )}
                {metric.title === "Attendees" && (
                  <Users className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs">
                  <span
                    className={`flex items-center ${
                      metric.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {metric.change}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {metric.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Sales Timeline</CardTitle>
              <CardDescription>
                Tickets sold and revenue by {computedParams.granularity}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timelinePoints.map((p) => (
                  <div
                    key={p.date}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground">
                      {p.date}
                    </span>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          {p.cumulative}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary">
                          {p.daily}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Daily
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Types</CardTitle>
              <CardDescription>Distribution by ticket type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analytics?.ticketSales.byType || []).map((t, idx) => (
                  <div key={t.type} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {t.type}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          barColors[idx % barColors.length]
                        }`}
                        style={{ width: `${t.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t.sold} tickets</span>
                      <span>{formatCurrency(t.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Check-in Analytics</CardTitle>
            <CardDescription>
              Attendance overview and hourly check-ins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {analytics?.checkIn.peakTime || "--:--"}
                </div>
                <div className="text-sm text-muted-foreground">Peak Time</div>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {analytics?.checkIn.averageWaitTime || "--"}
                </div>
                <div className="text-sm text-muted-foreground">Avg. Wait</div>
              </div>
            </div>
            <div className="space-y-3">
              {(analytics?.checkIn.timeline || []).map((h) => (
                <div key={h.time} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {h.time}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min(100, h.count)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-10 text-right">
                      {h.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Analytics runtime error:", error);
    setHasError(true);
    setErrorMessage(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-semibold">
            Something went wrong
          </div>
          <div className="text-muted-foreground text-sm">
            {errorMessage || "An unexpected error occurred"}
          </div>
          <button
            onClick={() => {
              setHasError(false);
              setErrorMessage("");
              router.refresh();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}
