import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Edit,
  MoreHorizontal,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { useFlashSale } from "@/hooks/useFlashSale";
import { FlashSaleStatus } from "@/types/flashsale";
import { CreatePromotionModal } from "./CreatePromotionModal";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface FlashSalesCalendarProps {
  eventId: string;
  onCreatePromotion: (type: "discount" | "flash-sale") => void;
}

export function FlashSalesCalendar({
  eventId,
  onCreatePromotion,
}: FlashSalesCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFlashSale, setSelectedFlashSale] = useState<string | null>(
    null
  );

  const { useFlashSales, useDeleteFlashSale, useCancelFlashSale } =
    useFlashSale();
  const { data: flashSales, isLoading } = useFlashSales(eventId);
  const deleteFlashSale = useDeleteFlashSale(eventId);
  const cancelFlashSale = useCancelFlashSale(eventId);

  const getStatusColor = (status: FlashSaleStatus) => {
    switch (status) {
      case FlashSaleStatus.ACTIVE:
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800/20";
      case FlashSaleStatus.SCHEDULED:
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800/20";
      case FlashSaleStatus.ENDED:
        return "bg-muted text-muted-foreground border-border";
      case FlashSaleStatus.CANCELLED:
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getSalesForDate = (date: string) => {
    return (
      flashSales?.result?.results?.filter(
        (sale) => sale.start_date <= date && sale.end_date >= date
      ) || []
    );
  };

  const handleEdit = (flashSaleId: string) => {
    setSelectedFlashSale(flashSaleId);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (flashSaleId: string) => {
    if (window.confirm("Are you sure you want to delete this flash sale?")) {
      await deleteFlashSale.mutateAsync(flashSaleId);
    }
  };

  const handleCancel = async (flashSaleId: string) => {
    if (window.confirm("Are you sure you want to cancel this flash sale?")) {
      await cancelFlashSale.mutateAsync(flashSaleId);
    }
  };

  const EmptyState = () => (
    <div className="text-center py-12 bg-card rounded-lg shadow-sm">
      <div className="text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
        <h3 className="text-lg font-medium mb-2 text-foreground">
          No flash sales found
        </h3>
        <p>Create a new flash sale to get started</p>
      </div>
    </div>
  );

  const renderCalendarView = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
          {/* Day headers skeleton */}
          {[...Array(7)].map((_, index) => (
            <div
              key={`header-${index}`}
              className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground border-b border-border"
            >
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
          ))}
          {/* Calendar days skeleton */}
          {[...Array(35)].map((_, index) => (
            <div key={`day-${index}`} className="h-32 border border-border p-2">
              <Skeleton className="h-4 w-6 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!flashSales?.result?.results?.length) {
      return <EmptyState />;
    }

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days: JSX.Element[] = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-32 border border-border"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const salesForDay = getSalesForDate(dateString);
      const isToday = dateString === new Date().toISOString().split("T")[0];

      days.push(
        <div
          key={day}
          className={`h-32 border border-border p-2 ${
            isToday ? "bg-primary/5" : "bg-card"
          }`}
        >
          <div
            className={`text-sm font-medium mb-1 ${
              isToday ? "text-primary" : "text-foreground"
            }`}
          >
            {day}
          </div>
          <div className="space-y-1">
            {salesForDay.slice(0, 2).map((sale) => (
              <div
                key={sale.id}
                className={`text-xs p-1 rounded border ${getStatusColor(
                  sale.status
                )}`}
              >
                <div className="font-medium truncate">{sale.name}</div>
                <div className="text-xs opacity-75">
                  {sale.discount_type === "PERCENTAGE"
                    ? `${sale.discount_amount}% off`
                    : `$${sale.discount_amount} off`}
                </div>
              </div>
            ))}
            {salesForDay.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{salesForDay.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground border-b border-border"
          >
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderListView = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-card rounded-lg shadow-sm border border-border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-3" />
                  <div className="flex items-center space-x-6">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-muted rounded-lg p-3">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-2 w-full mb-4" />
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!flashSales?.result?.results?.length) {
      return <EmptyState />;
    }

    return (
      <div className="space-y-4">
        {flashSales?.result?.results?.map((sale) => {
          const totalAllocated = sale.ticket_types.reduce(
            (sum, type) => sum + type.max_tickets,
            0
          );
          const totalRemaining = sale.ticket_types.reduce(
            (sum, type) => sum + (type.max_tickets - type.tickets_sold),
            0
          );
          const soldPercentage =
            ((totalAllocated - totalRemaining) / totalAllocated) * 100;

          return (
            <div
              key={sale.id}
              className="bg-card rounded-lg shadow-sm border border-border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {sale.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        sale.status
                      )}`}
                    >
                      {sale.status.charAt(0).toUpperCase() +
                        sale.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    {sale.description}
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(sale.start_date), "MMM d, yyyy")} -{" "}
                      {format(new Date(sale.end_date), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {sale.discount_type === "PERCENTAGE"
                        ? `${sale.discount_amount}% off`
                        : `$${sale.discount_amount} off`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(sale.id)}
                    className="p-2 hover:bg-muted rounded-lg"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {sale.status === FlashSaleStatus.ACTIVE && (
                    <button
                      onClick={() => handleCancel(sale.id)}
                      className="p-2 hover:bg-muted rounded-lg"
                      title="Cancel"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                  <button
                    className="p-2 hover:bg-muted rounded-lg"
                    title="More options"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">
                    Total Allocated
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {totalAllocated}
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className="text-lg font-semibold text-foreground">
                    {totalRemaining}
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">Sold</div>
                  <div className="text-lg font-semibold text-foreground">
                    {sale.tickets_sold}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Sales Progress</span>
                  <span>{soldPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${soldPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Ticket Allocations */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Ticket Allocations
                </h4>
                <div className="space-y-2">
                  {sale.ticket_types.map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {type.ticket_type_name}
                      </span>
                      <span className="text-foreground">
                        {type.max_tickets - type.tickets_sold}/
                        {type.max_tickets} remaining
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-muted rounded-lg"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <h2 className="text-xl font-semibold text-foreground">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-muted rounded-lg"
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1 text-sm rounded-lg ${
                viewMode === "calendar"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-sm rounded-lg ${
                viewMode === "list"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              List
            </button>
          </div>
        </div>
        <button
          onClick={() => onCreatePromotion("flash-sale")}
          className="flex items-center px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Flash Sale
        </button>
      </div>

      {/* Content */}
      {viewMode === "calendar" ? renderCalendarView() : renderListView()}

      {/* Edit Modal */}
      {isEditModalOpen && selectedFlashSale && (
        <CreatePromotionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedFlashSale(null);
          }}
          type="flash-sale"
          discountId={undefined}
          flashSaleId={selectedFlashSale}
          eventId={eventId}
        />
      )}
    </div>
  );
}
