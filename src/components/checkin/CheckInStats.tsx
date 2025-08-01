import { AlertCircle, Clock, TrendingUp, UserCheck, Users } from "lucide-react";
import { type CheckInStats as CheckInStatsType } from "@/types/checkin";

interface CheckInStatsProps {
  stats?: CheckInStatsType;
  isLoading?: boolean;
}

export function CheckInStats({ stats, isLoading }: CheckInStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card rounded-lg shadow-sm p-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="h-6 w-6 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const checkedInPercentage =
    stats.total_tickets > 0
      ? (stats.checked_in / stats.total_tickets) * 100
      : 0;
  const invalidPercentage =
    stats.total_tickets > 0 ? (stats.invalid / stats.total_tickets) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Tickets
            </p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {stats.total_tickets}
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 mr-1" />
            Event capacity tracking
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Checked In
            </p>
            <p className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
              {stats.checked_in}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg dark:bg-green-950/20">
            <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300 dark:bg-green-400"
              style={{ width: `${checkedInPercentage}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
            {checkedInPercentage.toFixed(1)}% of total
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <p className="mt-1 text-3xl font-semibold text-yellow-600 dark:text-yellow-400">
              {stats.pending}
            </p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-lg dark:bg-yellow-950/20">
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
            <Clock className="h-4 w-4 mr-1" />
            Awaiting check-in
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Invalid Scans
            </p>
            <p className="mt-1 text-3xl font-semibold text-red-600 dark:text-red-400">
              {stats.invalid}
            </p>
          </div>
          <div className="p-3 bg-red-100 rounded-lg dark:bg-red-950/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300 dark:bg-red-400"
              style={{ width: `${Math.min(invalidPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {invalidPercentage.toFixed(1)}% error rate
          </p>
        </div>
      </div>
    </div>
  );
}
