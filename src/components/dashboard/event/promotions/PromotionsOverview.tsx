import { Award, Clock, DollarSign, Percent, TrendingUp } from "lucide-react";

import { FlashSaleStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useDiscount } from "@/hooks/useDiscount";
import { useFlashSale } from "@/hooks/useFlashSale";

interface PromotionsOverviewProps {
  eventId: string;
  onCreatePromotion: (type: "discount" | "flash-sale") => void;
}

// Add this type at the top of the file
type Promotion = {
  id: string;
  name: string;
  type: "Discount Code" | "Flash Sale";
  discount: string;
  startDate: string;
  endDate: string;
  status: string;
} & (
  | { type: "Discount Code"; usageCount: number }
  | { type: "Flash Sale"; ticketsRemaining: number }
);

export function PromotionsOverview({
  eventId,
  onCreatePromotion,
}: PromotionsOverviewProps) {
  const { useDiscountOverallStats, useDiscounts } = useDiscount();
  const { useFlashSaleOverallStats, useFlashSales } = useFlashSale();

  const { data: discountStats, isLoading: isLoadingDiscountStats } =
    useDiscountOverallStats(eventId);
  const { data: flashSaleStats, isLoading: isLoadingFlashSaleStats } =
    useFlashSaleOverallStats(eventId);
  const { data: discounts, isLoading: isLoadingDiscounts } =
    useDiscounts(eventId);
  const { data: flashSales, isLoading: isLoadingFlashSales } =
    useFlashSales(eventId);

  const isLoading =
    isLoadingDiscountStats ||
    isLoadingFlashSaleStats ||
    isLoadingDiscounts ||
    isLoadingFlashSales;

  const stats = [
    {
      name: "Active Promotions",
      value: String(
        (discountStats?.result?.active_discounts || 0) +
          (flashSaleStats?.result?.active_flash_sales || 0)
      ),
      change: `+${
        (discountStats?.result?.total_discounts || 0) +
        (flashSaleStats?.result?.total_flash_sales || 0) -
        ((discountStats?.result?.active_discounts || 0) +
          (flashSaleStats?.result?.active_flash_sales || 0))
      } total`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      name: "Revenue from Promotions",
      value: `KSH. ${(
        (discountStats?.result?.total_amount_saved || 0) +
        (flashSaleStats?.result?.total_revenue || 0)
      ).toLocaleString()}`,
      change: `${
        ((discountStats?.result?.average_discount_per_use || 0) +
          (flashSaleStats?.result?.ticket_type_stats?.[
            Object.keys(flashSaleStats?.result?.ticket_type_stats || {})[0]
          ]?.average_discount || 0)) /
        2
      }% avg discount`,
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      name: "Total Usage",
      value: String(
        (discountStats?.result?.total_uses || 0) +
          (flashSaleStats?.result?.total_tickets_sold || 0)
      ),
      change: `${
        discountStats?.result?.type_distribution?.[0]?.count || 0
      } discount codes, ${
        flashSaleStats?.result?.status_distribution?.find(
          (s) => s.status === FlashSaleStatus.ACTIVE
        )?.count || 0
      } active flash sales`,
      icon: Percent,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      name: "Most Popular Type",
      value:
        (discountStats?.result?.total_uses || 0) >
        (flashSaleStats?.result?.total_tickets_sold || 0)
          ? "Discount Codes"
          : "Flash Sales",
      change: `${Math.round(
        ((discountStats?.result?.total_uses || 0) /
          ((discountStats?.result?.total_uses || 0) +
            (flashSaleStats?.result?.total_tickets_sold || 0))) *
          100
      )}% of total usage`,
      icon: Award,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
  ];

  // Then update the upcomingPromotions mapping
  const upcomingPromotions: Promotion[] = [
    ...(discounts?.result?.results || []).map((discount) => ({
      id: discount.id,
      name: discount.name,
      type: "Discount Code" as const,
      discount: `${discount.amount}${
        discount.discount_type === "PERCENTAGE" ? "%" : ""
      } off`,
      startDate: discount.start_date,
      endDate: discount.end_date,
      status: discount.status.toLowerCase(),
      usageCount: discount.current_uses,
    })),
    ...(flashSales?.result?.results || []).map((sale) => ({
      id: sale.id,
      name: sale.name,
      type: "Flash Sale" as const,
      discount: `${sale.discount_amount}${
        sale.discount_type === "PERCENTAGE" ? "%" : ""
      } off`,
      startDate: sale.start_date,
      endDate: sale.end_date,
      status: sale.status.toLowerCase(),
      ticketsRemaining: sale.max_tickets - sale.tickets_sold,
    })),
  ].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400";
      case "scheduled":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400";
      case "expired":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Stats Grid with Skeleton Loading
  const renderStatsGrid = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-40 mt-4" />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  // Upcoming Promotions Table with Skeleton Loading
  const renderUpcomingPromotions = () => {
    if (isLoading) {
      return (
        <div className="bg-card rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="bg-card rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              Upcoming & Active Promotions
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                    Usage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {upcomingPromotions.map((promotion) => (
                  <tr key={promotion.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {promotion.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {promotion.type === "Flash Sale" ? (
                          <Clock className="h-4 w-4 text-destructive mr-2" />
                        ) : (
                          <Percent className="h-4 w-4 text-primary mr-2" />
                        )}
                        <span className="text-sm text-foreground">
                          {promotion.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {promotion.discount}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(promotion.startDate), "MMM d, yyyy")} -{" "}
                      {format(new Date(promotion.endDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          promotion.status
                        )}`}
                      >
                        {promotion.status.charAt(0).toUpperCase() +
                          promotion.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {promotion.type === "Flash Sale"
                        ? `${promotion.ticketsRemaining} tickets left`
                        : `${promotion.usageCount} uses`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {(!upcomingPromotions || upcomingPromotions.length === 0) && (
          <div className="text-center py-12 bg-card rounded-lg shadow-sm">
            <div className="text-muted-foreground">
              <Percent className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium mb-2 text-foreground">
                No upcoming or active promotions found
              </h3>
              <p>Create a new promotion to get started</p>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-8">
      {renderStatsGrid()}

      {/* Quick Actions */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onCreatePromotion("discount")}
            className="flex items-center justify-center p-6 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <div className="text-center">
              <Percent className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-medium text-foreground">
                Create Discount Code
              </h3>
              <p className="text-sm text-muted-foreground">
                Set up percentage or fixed amount discounts
              </p>
            </div>
          </button>
          <button
            onClick={() => onCreatePromotion("flash-sale")}
            className="flex items-center justify-center p-6 border-2 border-dashed border-destructive/30 rounded-lg hover:border-destructive/50 hover:bg-destructive/5 transition-colors"
          >
            <div className="text-center">
              <Clock className="h-8 w-8 text-destructive mx-auto mb-2" />
              <h3 className="text-lg font-medium text-foreground">
                Create Flash Sale
              </h3>
              <p className="text-sm text-muted-foreground">
                Schedule time-limited promotional events
              </p>
            </div>
          </button>
        </div>
      </div>

      {renderUpcomingPromotions()}
    </div>
  );
}
