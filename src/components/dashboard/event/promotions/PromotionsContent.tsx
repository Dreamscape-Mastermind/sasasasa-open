"use client";

import { Calendar, Clock, Percent, Plus, TrendingUp } from "lucide-react";

import { CreatePromotionModal } from "./CreatePromotionModal";
import { DiscountCodesTable } from "./DiscountCodesTable";
import { FlashSalesCalendar } from "./FlashSalesCalendar";
import { PromotionAnalytics } from "./PromotionAnalytics";
import { PromotionsOverview } from "./PromotionsOverview";
import { useState } from "react";

export function PromotionsContent({ eventId }: { eventId: string }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [promotionType, setPromotionType] = useState<"discount" | "flash-sale">(
    "discount"
  );

  const handleCreatePromotion = (type: "discount" | "flash-sale") => {
    setPromotionType(type);
    setIsCreateModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6 animate-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Promotions</h1>
              <p className="text-muted-foreground">
                Manage your event promotions and discounts.
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleCreatePromotion("discount")}
              className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Discount Code
            </button>
            <button
              onClick={() => handleCreatePromotion("flash-sale")}
              className="flex items-center px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Flash Sale
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-card rounded-lg shadow-sm mb-8">
          <div className="border-b border-border">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-4 text-sm font-medium flex items-center ${
                  activeTab === "overview"
                    ? "border-b-2 border-primary bg-destructive/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("discount-codes")}
                className={`px-6 py-4 text-sm font-medium flex items-center ${
                  activeTab === "discount-codes"
                    ? "border-b-2 border-primary bg-destructive/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Percent className="h-4 w-4 mr-2" />
                Discount Codes
              </button>
              <button
                onClick={() => setActiveTab("flash-sales")}
                className={`px-6 py-4 text-sm font-medium flex items-center ${
                  activeTab === "flash-sales"
                    ? "border-b-2 border-primary bg-destructive/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="h-4 w-4 mr-2" />
                Flash Sales
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-6 py-4 text-sm font-medium flex items-center ${
                  activeTab === "analytics"
                    ? "border-b-2 border-primary bg-destructive/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && (
            <PromotionsOverview
              onCreatePromotion={handleCreatePromotion}
              eventId={eventId}
            />
          )}
          {activeTab === "discount-codes" && (
            <DiscountCodesTable
              onCreatePromotion={handleCreatePromotion}
              eventId={eventId}
            />
          )}
          {activeTab === "flash-sales" && (
            <FlashSalesCalendar
              onCreatePromotion={handleCreatePromotion}
              eventId={eventId}
            />
          )}
          {activeTab === "analytics" && (
            <PromotionAnalytics
              onCreatePromotion={handleCreatePromotion}
              eventId={eventId}
            />
          )}
        </div>
      </div>
      {/* Create Promotion Modal */}
      <CreatePromotionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        type={promotionType}
        discountId={undefined}
        flashSaleId={undefined}
        eventId={eventId}
      />
    </>
  );
}
