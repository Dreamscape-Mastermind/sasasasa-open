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
            className="bg-white rounded-lg shadow-sm p-6 dark:bg-[#232326]"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg dark:bg-[#18181b]">
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const checkedInPercentage = (stats.checked_in / stats.total_tickets) * 100;
  const invalidPercentage = (stats.invalid / stats.total_tickets) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-[#232326]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Tickets
            </p>
            <p className="mt-1 text-3xl font-semibold text-foreground dark:text-white">
              {stats.total_tickets}
            </p>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg dark:bg-[#18181b]">
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

      <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-[#232326]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Checked In
            </p>
            <p className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
              {stats.checked_in}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900">
            <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
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

      <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-[#232326]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Pending
            </p>
            <p className="mt-1 text-3xl font-semibold text-yellow-600 dark:text-yellow-400">
              {stats.pending}
            </p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-lg dark:bg-yellow-900">
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

      <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-[#232326]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Invalid Scans
            </p>
            <p className="mt-1 text-3xl font-semibold text-red-600 dark:text-[#CC322D]">
              {stats.invalid}
            </p>
          </div>
          <div className="p-3 bg-red-100 rounded-lg dark:bg-[#CC322D]">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-white" />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300 dark:bg-[#CC322D]"
              style={{ width: `${Math.min(invalidPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-red-600 dark:text-[#CC322D]">
            {invalidPercentage.toFixed(1)}% error rate
          </p>
        </div>
      </div>
    </div>
  );
}
