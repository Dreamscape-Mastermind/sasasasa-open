"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
  showPageSizeChanger?: boolean;
}

export function MobilePagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  className,
  showPageSizeChanger = true,
}: MobilePaginationProps) {
  const renderPageNumbers = () => {
    const pages: JSX.Element[] = [];
    const maxVisiblePages = 3; // Reduced for mobile
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Always show first page if not in range
    if (startPage > 1) {
      pages.push(
        <Button
          key="1"
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(1)}
          className="h-8 w-8 p-0"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span
            key="ellipsis-start"
            className="flex items-center justify-center w-8 h-8"
          >
            <MoreHorizontal className="w-4 h-4" />
          </span>
        );
      }
    }

    // Show pages in range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          className="h-8 w-8 p-0"
        >
          {i}
        </Button>
      );
    }

    // Always show last page if not in range
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span
            key="ellipsis-end"
            className="flex items-center justify-center w-8 h-8"
          >
            <MoreHorizontal className="w-4 h-4" />
          </span>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8 p-0"
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Page size selector - mobile friendly */}
      {showPageSizeChanger && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center justify-between">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-8 px-3"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page numbers - responsive */}
        <div className="flex items-center gap-1">
          {/* Mobile: Show only current page and total */}
          <div className="sm:hidden flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Desktop: Show page numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {renderPageNumbers()}
          </div>
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-8 px-3"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Mobile page selector */}
      <div className="sm:hidden">
        <Select
          value={currentPage.toString()}
          onValueChange={(value) => onPageChange(Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select page" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <SelectItem key={page} value={page.toString()}>
                Page {page}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
