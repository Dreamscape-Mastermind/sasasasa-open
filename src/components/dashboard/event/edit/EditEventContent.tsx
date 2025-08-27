"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Calendar, Edit3, Ticket, Users } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/shadtab";
import { Button } from "@/components/ui/button";
import EventForm from "@/components/forms/event-form";
import TeamMembersForm from "@/components/forms/team-members-form";
import TicketForm from "@/components/forms/ticket-form";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";
import { EventStatus } from "@/types/event";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/lib/constants";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  params: Promise<{ id: string }>;
};

export function EditEventContent({ params }: Props) {
  const router = useRouter();
  const { id: eventId } = use(params);
  
  const isEditMode = Boolean(eventId);
  const [isPublishing, setIsPublishing] = useState(false);
  const { useEvent: useEventQuery, usePublishEvent } = useEvent();
  const publishEvent = usePublishEvent();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("event-details");
  const {
    data: eventData,
    error: eventError,
    isLoading,
  } = useEventQuery(eventId || "");

  const handleNext = () => {
    if (activeTab === "event-details") {
      setActiveTab("tickets");
    } else if (activeTab === "tickets") {
      setActiveTab("team");
    }
  };

  const handlePublish = async () => {
    if (!eventId) {
      toast.error("Event must be created before publishing");
      return;
    }

    setIsPublishing(true);
    try {
      await publishEvent.mutateAsync(eventId);
      toast.success("Event published successfully!");
      
      // Navigate to event details page after publishing
      router.push(ROUTES.DASHBOARD_EVENT_DETAILS(eventId));
    } catch (err) {
      toast.error("Failed to publish event");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRevertToDraft = undefined as unknown as () => Promise<void>;

  return (
    <div className="max-w-6xl mx-auto rounded-lg">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Edit3 className="w-6 h-6" />
          Edit Event
        </h1>
        <div className="flex gap-2">
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
          {false}
        </div>
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
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-2"
          >
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">Event Tickets</span>
            <span className="sm:hidden">Tickets</span>
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-2"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Event Team</span>
            <span className="sm:hidden">Team</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="event-details" className="space-y-6">
          <EventForm onFormSubmitSuccess={handleNext} eventId={eventId} />
        </TabsContent>

        <TabsContent value="tickets">
          <TicketForm onFormSubmitSuccess={handleNext} eventId={eventId} />
        </TabsContent>

        <TabsContent value="team">
          <TeamMembersForm onFormSubmitSuccess={handleNext} eventId={eventId} />
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        {activeTab !== "team" && (
          <Button onClick={handleNext}>
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
