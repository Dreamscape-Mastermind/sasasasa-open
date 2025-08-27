"use client";

import { ArrowRight, Calendar, Edit3, Ticket, Users } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/shadtab";
import { use, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import EventForm from "@/components/forms/event-form";
import TeamMembersForm from "@/components/forms/team-members-form";
import TicketForm from "@/components/forms/ticket-form";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";
import { ROUTES } from "@/lib/constants";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  params: Promise<{ id: string }>;
};

export default function CreateEvent({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: eventId } = use(params);
  
  // Check for eventId in search params as fallback
  const urlEventId = searchParams.get("eventId") || searchParams.get("id");
  const finalEventId = eventId || urlEventId || undefined;
  
  const isEditMode = Boolean(finalEventId);
  const [isPublishing, setIsPublishing] = useState(false);
  const { useEvent: useEventQuery, usePublishEvent } = useEvent();
  const publishEvent = usePublishEvent();

  const [activeTab, setActiveTab] = useState("event-details");
  const {
    data: eventData,
    error: eventError,
    isLoading,
  } = useEventQuery(finalEventId || "");

  // Auto-advance to next tab when event is created
  useEffect(() => {
    if (finalEventId && activeTab === "event-details") {
      // Small delay to allow user to see the success state
      const timer = setTimeout(() => {
        setActiveTab("tickets");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [finalEventId, activeTab]);

  const handleNext = () => {
    if (activeTab === "event-details") {
      setActiveTab("tickets");
    } else if (activeTab === "tickets") {
      setActiveTab("team");
    }
  };

  const handlePublish = async () => {
    if (!finalEventId) {
      toast.error("Event must be created before publishing");
      return;
    }

    setIsPublishing(true);
    try {
      await publishEvent.mutateAsync(finalEventId);
      toast.success("Event published successfully!");
      
      // Navigate to event details page after publishing
      router.push(ROUTES.DASHBOARD_EVENT_DETAILS(finalEventId));
    } catch (err) {
      toast.error("Failed to publish event");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto rounded-lg">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {isEditMode ? (
            <>
              <Edit3 className="w-6 h-6" />
              Edit Event
            </>
          ) : (
            <>
              <Calendar className="w-6 h-6" />
              Create Event
            </>
          )}
        </h1>
        {isEditMode && (
          <Button
            variant="default"
            disabled={
              eventData?.result?.status === "PUBLISHED" ||
              isPublishing ||
              publishEvent.isPending
            }
            onClick={handlePublish}
          >
            {isPublishing || publishEvent.isPending ? "Publishing..." : "Publish Event"}
          </Button>
        )}
      </div>

      {/* Mobile step tiles */}
      <div className="sm:hidden grid grid-cols-3 gap-2 mb-4">
        {[
          { key: "event-details", label: "Details", icon: Calendar },
          { key: "tickets", label: "Tickets", icon: Ticket },
          { key: "team", label: "Team", icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <TooltipProvider key={key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label={`Go to ${label}`}
                  aria-pressed={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  className={
                    `flex flex-col items-center justify-center rounded-xl p-3 border transition ${
                      activeTab === key ? "bg-primary text-primary-foreground border-transparent shadow" : "bg-card text-foreground hover:border-primary/40"
                    }`
                  }
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="event-details"
        className="space-y-6"
      >
        <TabsList className="hidden sm:grid w-full grid-cols-3 bg-muted p-1 rounded-lg">
          <TabsTrigger
            value="event-details"
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-2"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Event Information</span>
            <span className="sm:hidden">Details</span>
          </TabsTrigger>
          <TabsTrigger
            value="tickets"
            disabled={activeTab === "event-details" && !isEditMode}
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-2"
            aria-label={`Ticket Options  ${
              activeTab === "event-details" && !isEditMode
                ? "(Create event first)"
                : ""
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">Event Tickets</span>
            <span className="sm:hidden">Tickets</span>
          </TabsTrigger>
          <TabsTrigger
            value="team"
            disabled={
              (activeTab === "event-details" || activeTab === "tickets") &&
              !isEditMode
            }
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-2"
            aria-label={`Team & Publishing ${
              (activeTab === "event-details" || activeTab === "tickets") &&
              !isEditMode
                ? "(Create event first)"
                : ""
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Event Team</span>
            <span className="sm:hidden">Team</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="event-details" className="space-y-6">
          <EventForm onFormSubmitSuccess={handleNext} eventId={finalEventId} />
        </TabsContent>

        <TabsContent value="tickets">
          <TicketForm onFormSubmitSuccess={handleNext} eventId={finalEventId} />
        </TabsContent>

        <TabsContent value="team">
          <TeamMembersForm onFormSubmitSuccess={handleNext} eventId={finalEventId} />
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        {activeTab !== "team" && isEditMode && (
          <Button onClick={handleNext}>
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
