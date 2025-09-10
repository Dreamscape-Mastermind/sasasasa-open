import {
  BarChart3,
  HandCoins,
  Download,
  LineChart,
  Percent,
  PieChart,
  TrendingUp,
  Users,
  AlertCircle,
} from "lucide-react";

import { useState } from "react";
import { usePromotions } from "@/hooks/usePromotions";
import { PromotionAnalyticsQueryParams } from "@/types/promotions";
import { Skeleton } from "@/components/ui/skeleton";

interface PromotionAnalyticsProps {
  eventId: string;
  onCreatePromotion: (type: "discount" | "flash-sale") => void;
}

export function PromotionAnalytics({
  eventId,
  onCreatePromotion,
}: PromotionAnalyticsProps) {
  const [dateRange, setDateRange] =
    useState<PromotionAnalyticsQueryParams["date_range"]>("30d");
  const [promotionType, setPromotionType] =
    useState<PromotionAnalyticsQueryParams["promotion_type"]>("all");

  const { useAnalytics } = usePromotions();
  const { data, isLoading, error } = useAnalytics(eventId, {
    date_range: dateRange,
    promotion_type: promotionType,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-card rounded-lg shadow-sm">
        <div className="text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-medium mb-2 text-foreground">
            Error loading analytics
          </h3>
          <p>Please try again later</p>
        </div>
      </div>
    );
  }

  const analyticsData = data?.result;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) =>
              setDateRange(
                e.target.value as PromotionAnalyticsQueryParams["date_range"]
              )
            }
            className="border border-input bg-background rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <select
            value={promotionType}
            onChange={(e) =>
              setPromotionType(
                e.target
                  .value as PromotionAnalyticsQueryParams["promotion_type"]
              )
            }
            className="border border-input bg-background rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Promotions</option>
            <option value="discount-codes">Discount Codes</option>
            <option value="flash-sales">Flash Sales</option>
          </select>
        </div>
        <button className="flex items-center px-4 py-2 border border-input bg-background text-foreground rounded-lg hover:bg-muted">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {formatCurrency(analyticsData?.overview.totalRevenue || 0)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <HandCoins className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p
            className={`mt-4 text-sm ${
              analyticsData?.overview.revenueGrowth &&
              analyticsData.overview.revenueGrowth > 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatPercentage(analyticsData?.overview.revenueGrowth || 0)} from
            last period
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Promotions
              </p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {analyticsData?.overview.totalPromotions || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p
            className={`mt-4 text-sm ${
              analyticsData?.overview.promotionGrowth &&
              analyticsData.overview.promotionGrowth > 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatPercentage(analyticsData?.overview.promotionGrowth || 0)}{" "}
            from last period
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg. Discount Rate
              </p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {analyticsData?.overview.averageDiscount?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
              <Percent className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p
            className={`mt-4 text-sm ${
              analyticsData?.overview.discountGrowth &&
              analyticsData.overview.discountGrowth > 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatPercentage(analyticsData?.overview.discountGrowth || 0)} from
            last period
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Conversion Rate
              </p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {analyticsData?.overview.conversionRate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p
            className={`mt-4 text-sm ${
              analyticsData?.overview.conversionGrowth &&
              analyticsData.overview.conversionGrowth > 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatPercentage(analyticsData?.overview.conversionGrowth || 0)}{" "}
            from last period
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue by Type */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Revenue by Promotion Type
            </h3>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {analyticsData?.revenueByType.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${
                      index === 0 ? "bg-primary" : "bg-destructive"
                    }`}
                  ></div>
                  <span className="text-sm text-muted-foreground">
                    {item.type}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {formatCurrency(item.revenue || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.percentage?.toFixed(1) || 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="flex rounded-full overflow-hidden h-2">
              <div
                className="bg-primary"
                style={{
                  width: `${analyticsData?.revenueByType[0].percentage || 0}%`,
                }}
              ></div>
              <div
                className="bg-destructive"
                style={{
                  width: `${analyticsData?.revenueByType[1].percentage || 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Usage Trends */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Usage Trends
            </h3>
            <LineChart className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {analyticsData?.usageTrends.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {item.month}
                </span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    <span className="text-sm text-foreground">
                      {item.discountCodes || 0}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-destructive rounded-full mr-2"></div>
                    <span className="text-sm text-foreground">
                      {item.flashSales || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-1"></div>
              Discount Codes
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-destructive rounded-full mr-1"></div>
              Flash Sales
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Promotions */}
      <div className="bg-card rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Top Performing Promotions
            </h3>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Promotion
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Uses
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Conversion
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Discount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {analyticsData?.topPerformingPromotions.map((promotion) => (
                <tr key={promotion.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                      {promotion.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        promotion.type === "Flash Sale"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {promotion.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {formatCurrency(promotion.revenue || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {promotion.uses || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {promotion.conversionRate?.toFixed(1) || 0}%
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {promotion.discount?.toFixed(1) || 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {(!analyticsData?.topPerformingPromotions ||
        analyticsData?.topPerformingPromotions.length === 0) && (
        <div className="text-center py-8 bg-card rounded-lg shadow-sm">
          <div className="text-muted-foreground">
            <Percent className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
            <h3 className="text-lg font-medium mb-2 text-foreground">
              No top performing promotions found
            </h3>
          </div>
        </div>
      )}

      {/* Ticket Type Distribution */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Ticket Type Distribution
          </h3>
          <PieChart className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {analyticsData?.ticketTypeDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${`bg-${
                      [
                        "green-500",
                        "yellow-500",
                        "purple-500",
                        "blue-500",
                        "red-500",
                        "indigo-500",
                        "pink-500",
                      ][index % 7]
                    } dark:bg-${
                      [
                        "green-400",
                        "yellow-400",
                        "purple-400",
                        "blue-400",
                        "red-400",
                        "indigo-400",
                        "pink-400",
                      ][index % 7]
                    }`}`}
                  ></div>
                  <span className="text-sm text-muted-foreground">
                    {item.type}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {item.count || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.percentage?.toFixed(1) || 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg
                className="w-32 h-32 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="2"
                />
                {analyticsData?.ticketTypeDistribution.map((item, index) => {
                  const colors = [
                    "hsl(var(--primary))",
                    "hsl(var(--success))",
                    "hsl(var(--warning))",
                    "hsl(var(--secondary))",
                  ];
                  const offset = analyticsData.ticketTypeDistribution
                    .slice(0, index)
                    .reduce((sum, prev) => sum + prev.percentage, 0);
                  return (
                    <path
                      key={index}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={colors[index]}
                      strokeWidth="2"
                      strokeDasharray={`${item.percentage} ${
                        100 - item.percentage
                      }`}
                      strokeDashoffset={-offset}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
