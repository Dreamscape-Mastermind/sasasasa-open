import {
  CheckCircle,
  Clock,
  Copy,
  Download,
  Edit,
  Percent,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { DiscountStatus, DiscountType } from "@/types/discount";

import { CreatePromotionModal } from "./CreatePromotionModal";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useDiscount } from "@/hooks/useDiscount";
import { useState } from "react";

interface DiscountCodesTableProps {
  eventId: string;
  onCreatePromotion: (type: "discount" | "flash-sale") => void;
}

export function DiscountCodesTable({
  eventId,
  onCreatePromotion,
}: DiscountCodesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<DiscountStatus | "all">(
    "all"
  );
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);

  const { useDiscounts, useDeleteDiscount } = useDiscount();
  const { data: discounts, isLoading } = useDiscounts(eventId, {
    search: searchQuery,
    status: filterStatus === "all" ? undefined : filterStatus,
  });

  const deleteDiscount = useDeleteDiscount(eventId);

  const getStatusIcon = (status: DiscountStatus) => {
    switch (status) {
      case DiscountStatus.ACTIVE:
        return (
          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
        );
      case DiscountStatus.EXPIRED:
        return <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />;
      case DiscountStatus.INACTIVE:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: DiscountStatus) => {
    switch (status) {
      case DiscountStatus.ACTIVE:
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400";
      case DiscountStatus.EXPIRED:
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400";
      case DiscountStatus.INACTIVE:
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getUsagePercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-yellow-500 dark:bg-yellow-400";
    return "bg-green-500 dark:bg-green-400";
  };

  const handleEdit = (discountId: string) => {
    setSelectedDiscount(discountId);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (discountId: string) => {
    if (window.confirm("Are you sure you want to delete this discount code?")) {
      await deleteDiscount.mutateAsync(discountId);
    }
  };

  const handleSelectCode = (id: string) => {
    setSelectedCodes((prev) =>
      prev.includes(id) ? prev.filter((codeId) => codeId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCodes.length === (discounts?.result?.results?.length || 0)) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(
        discounts?.result?.results?.map((code) => code.id) || []
      );
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Discount code copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 flex flex-col"
            >
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-2 w-full mb-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search discount codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring w-64"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {selectedCodes.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedCodes.length} selected
              </span>
              <button
                onClick={() => selectedCodes.forEach(handleDelete)}
                className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
              >
                Delete Selected
              </button>
            </div>
          )}

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as DiscountStatus | "all")
            }
            className="border border-input bg-background rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value={DiscountStatus.ACTIVE}>Active</option>
            <option value={DiscountStatus.EXPIRED}>Expired</option>
            <option value={DiscountStatus.INACTIVE}>Inactive</option>
          </select>
          <button className="flex items-center px-4 py-2 border border-input bg-background text-foreground rounded-lg hover:bg-muted">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          {/* <button
            onClick={() => onCreatePromotion("discount")}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Code
          </button> */}
        </div>
      </div>

      {/* Discount Codes List (Responsive) */}
      <div className="space-y-4">
        {discounts?.result?.results?.map((code) => {
          const usagePercentage = getUsagePercentage(
            code.current_uses,
            code.max_uses
          );
          return (
            <div
              key={code.id}
              className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 flex flex-col"
            >
              {/* Header and Status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4 gap-2">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono bg-muted px-2 py-1 rounded text-md sm:text-lg">
                      {code.code}
                    </span>
                    <button
                      onClick={() => copyToClipboard(code.code)}
                      className="p-1 hover:bg-muted rounded"
                      title="Copy code"
                    >
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        code.status
                      )}`}
                    >
                      {code.status.charAt(0).toUpperCase() +
                        code.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(code.id)}
                    className="p-2 hover:bg-muted rounded-lg"
                    title="Edit code"
                  >
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(code.id)}
                    className="p-2 hover:bg-muted rounded-lg"
                    title="Delete code"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Info Row */}
              <div className="font-medium text-foreground text-sm sm:text-base mb-1">
                {code.name}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                {code.description}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                <div className="flex items-center mb-1 sm:mb-0">
                  <Percent className="h-4 w-4 mr-1" />
                  {code.discount_type === DiscountType.PERCENTAGE
                    ? `${code.amount}%`
                    : `KSH. ${code.amount}`}
                </div>
                <div className="flex items-center mb-1 sm:mb-0">
                  <Clock className="h-4 w-4 mr-1" />
                  {format(new Date(code.start_date), "MMM d, yyyy")} -{" "}
                  {format(new Date(code.end_date), "MMM d, yyyy")}
                </div>
                {code.max_discount_amount && (
                  <div className="flex items-center mb-1 sm:mb-0">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Max: Ksh. {code.max_discount_amount}
                    </span>
                  </div>
                )}
                {code.min_ticket_count > 1 && (
                  <div className="flex items-center mb-1 sm:mb-0">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Min: {code.min_ticket_count} tickets
                    </span>
                  </div>
                )}
              </div>

              {/* Usage Bar */}
              <div className="mb-2 sm:mb-4">
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-1">
                  <span>Usage</span>
                  <span>{usagePercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(
                      usagePercentage
                    )}`}
                    style={{ width: `${usagePercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs sm:text-sm mt-1">
                  <span className="text-foreground">
                    {code.current_uses}/{code.max_uses}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(!discounts?.result?.results ||
        discounts.result.results.length === 0) && (
        <div className="text-center py-12 bg-card rounded-lg shadow-sm">
          <div className="text-muted-foreground">
            <Percent className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium mb-2 text-foreground">
              No discount codes found
            </h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedDiscount && (
        <CreatePromotionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedDiscount(null);
          }}
          type="discount"
          discountId={selectedDiscount}
          flashSaleId={undefined}
          eventId={eventId}
        />
      )}
    </div>
  );
}
