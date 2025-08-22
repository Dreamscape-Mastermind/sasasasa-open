"use client";

import { ArrowRight, Calendar, Edit3, Ticket, Users } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/shadtab";
import { use, useState } from "react";

import { Button } from "@/components/ui/button";
import EventForm from "@/components/forms/event-form";
import TeamMembersForm from "@/components/forms/team-members-form";
import TicketForm from "@/components/forms/ticket-form";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";

type Props = {
  params: Promise<{ id: string }>;
};

export default function CreateEvent({ params }: Props) {
  const { id: eventId } = use(params);
  const isEditMode = Boolean(eventId);
  const [isPublishing, setIsPublishing] = useState(false);
  const { useEvent: useEventQuery, usePublishEvent } = useEvent();
  const publishEvent = usePublishEvent();

  const [activeTab, setActiveTab] = useState("event-details");
  const {
    data: eventData,
    error: eventError,
    isLoading,
  } = useEventQuery(eventId);

  const handleNext = () => {
    if (activeTab === "event-details") {
      setActiveTab("tickets");
    } else if (activeTab === "tickets") {
      setActiveTab("team");
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
        <Button
          variant="default"
          disabled={
            eventData?.result?.status === "PUBLISHED" ||
            isPublishing ||
            publishEvent.isPending
          }
          onClick={async () => {
            setIsPublishing(true);
            try {
              await publishEvent.mutateAsync(eventId);
              toast.success("Event published successfully!");
            } catch (err) {
              toast.error("Failed to publish event");
            } finally {
              setIsPublishing(false);
            }
          }}
        >
          Publish Event
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="event-details"
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-lg">
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
            {/* <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Event Team</span>
            <span className="sm:hidden">Team</span> */}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="event-details" className="space-y-6">
          <EventForm onFormSubmitSuccess={handleNext} eventId={eventId} />
        </TabsContent>

        <TabsContent value="tickets">
          <TicketForm onFormSubmitSuccess={handleNext} eventId={eventId} />
        </TabsContent>

        {/* <TabsContent value="team">
          <TeamMembersForm onFormSubmitSuccess={handleNext} eventId={eventId} />
        </TabsContent> */}
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
