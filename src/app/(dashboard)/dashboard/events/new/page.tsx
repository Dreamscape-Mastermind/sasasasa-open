"use client";

import * as z from "zod";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/shadtab";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { EventForm, TicketForm, TeamMembersForm } from "@/components/dashboard/LazyDashboardComponents";
import { Loader2, CheckCircle, AlertCircle, Ticket, Users, FileText } from "lucide-react";
import { Suspense } from "react";
// import { VenueSearchResult } from "@/types/venue";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEvent } from "@/hooks/useEvent";
import { useTicket } from "@/hooks/useTicket";

// First, define the role type and schema
const ROLES = {
  EVENT_ORGANIZER: "EVENT_ORGANIZER",
  EVENT_TEAM: "EVENT_TEAM",
  SELLER: "SELLER",
  CUSTOMER: "CUSTOMER",
} as const;

type Role = keyof typeof ROLES;

const teamSchema = z.object({
  team: z
    .array(
      z.object({
        user_email: z.string().email("Please enter a valid email address"),
        role: z.enum(["EVENT_ORGANIZER", "EVENT_TEAM", "SELLER", "CUSTOMER"], {
          required_error: "Please select a role",
        }),
      })
    )
    .min(1, "At least one team member is required"),
});

export default function NewEventPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewEventContent />
    </Suspense>
  );
}

function NewEventContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") || searchParams.get("id");

  const [activeTab, setActiveTab] = useState("event-details");

  // Hook into existing API calls to track state
  const { useTeamMembers } = useEvent();
  const { useTicketTypes } = useTicket();
  
  // Get real-time data about tickets and team members
  const { data: ticketsData } = useTicketTypes(eventId || "");
  const { data: teamMembersData } = useTeamMembers(eventId || "");

  // Calculate state based on real data
  const hasTickets = ticketsData?.result?.results && ticketsData.result.results.length > 0;
  const hasTeamMembers = teamMembersData?.result?.results && teamMembersData.result.results.length > 0;

  // Initialize the form
  const teamForm = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      team: [{ user_email: "", role: "EVENT_TEAM" }],
    },
  });

  // Setup field array for dynamic team members
  const { fields, append, remove } = useFieldArray({
    control: teamForm.control,
    name: "team",
  });

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login?redirect=/create");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Auto-advance to next tab when eventId becomes available
  useEffect(() => {
    if (eventId && activeTab === "event-details") {
      // Small delay to allow user to see the success state
      const timer = setTimeout(() => {
        setActiveTab("tickets");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [eventId, activeTab]);

  // Navigation handlers
  const handleNext = () => {
    if (activeTab === "event-details" && eventId) {
      setActiveTab("tickets");
    } else if (activeTab === "tickets") {
      setActiveTab("team");
    }
  };

  const handlePrevious = () => {
    if (activeTab === "team") {
      setActiveTab("tickets");
    } else if (activeTab === "tickets") {
      setActiveTab("event-details");
    }
  };

  const canProceedToNext = () => {
    if (activeTab === "event-details") {
      return !!eventId; // Can only proceed if event is created
    }
    return true;
  };

  const getTabStatus = (tab: string) => {
    switch (tab) {
      case "event-details":
        return eventId ? "complete" : "current";
      case "tickets":
        if (!eventId) return "disabled";
        return hasTickets ? "complete" : activeTab === "tickets" ? "current" : "pending";
      case "team":
        if (!eventId) return "disabled";
        return hasTeamMembers ? "complete" : activeTab === "team" ? "current" : "pending";
      default:
        return "pending";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "current":
        return <div className="w-4 h-4 rounded-full bg-blue-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    if (eventId) completed += 1;
    if (hasTickets) completed += 1;
    if (hasTeamMembers) completed += 0.5; // Team is optional, so worth less
    return Math.round((completed / 2.5) * 100);
  };

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Don't render the page content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Create New Event</h1>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getCompletionPercentage()}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {getCompletionPercentage()}%
              </span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Complete all steps to publish your event successfully
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          defaultValue="event-details"
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-zinc-800 rounded-none">
            <TabsTrigger
              value="event-details"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 flex items-center gap-2"
            >
              {getStatusIcon(getTabStatus("event-details"))}
              <FileText className="w-4 h-4" />
              Event Details
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 flex items-center gap-2"
              disabled={!eventId}
            >
              {getStatusIcon(getTabStatus("tickets"))}
              <Ticket className="w-4 h-4" />
              Ticket Options
              {!hasTickets && eventId && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  Required
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 flex items-center gap-2"
              disabled={!eventId}
            >
              {getStatusIcon(getTabStatus("team"))}
              <Users className="w-4 h-4" />
              Team & Publishing
              {!hasTeamMembers && eventId && (
                <Badge variant="outline" className="ml-1 text-xs">
                  Optional
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="event-details" className="space-y-6">
            <EventForm />
            {!eventId && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Start with the basics
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Once you save your event details, you'll be able to add ticket types and team members.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {eventId && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Great! Event details saved
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Now let's add some ticket types to make your event bookable.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tickets">
            <TicketForm />
            {!hasTickets && (
              <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <Ticket className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      Tickets required for publication
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                      Your event needs at least one ticket type before it can be published. Create different ticket tiers, pricing, and availability.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {hasTickets && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Excellent! Tickets configured
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Your event is ready to accept bookings. You can add team members or proceed to publish.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="team">
            <TeamMembersForm />
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Almost ready to publish!
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Add team members to help manage your event, or proceed to publish if you're managing it solo.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dynamic Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <div>
            {activeTab !== "event-details" && (
              <Button
                onClick={handlePrevious}
                variant="outline"
                className="dark:border-zinc-700"
              >
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {activeTab === "event-details" && (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className="dark:bg-zinc-900"
              >
                {eventId ? "Next: Add Tickets" : "Save Event First"}
              </Button>
            )}
            
            {activeTab === "tickets" && (
              <Button
                onClick={handleNext}
                className="dark:bg-zinc-900"
              >
                Next: Team & Publish
              </Button>
            )}
            
            {activeTab === "team" && (
              <Button
                type="submit"
                disabled={!hasTickets}
                className={`dark:bg-zinc-900 ${hasTickets ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
              >
                {hasTickets ? "🚀 Publish Event" : "Add Tickets First"}
              </Button>
            )}
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Progress Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-zinc-900">
              {getStatusIcon(getTabStatus("event-details"))}
              <FileText className="w-4 h-4" />
              <span>Event Details {eventId ? "✓" : ""}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-zinc-900">
              {getStatusIcon(getTabStatus("tickets"))}
              <Ticket className="w-4 h-4" />
              <span>Tickets {hasTickets ? "✓" : "(Required)"}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-zinc-900">
              {getStatusIcon(getTabStatus("team"))}
              <Users className="w-4 h-4" />
              <span>Team {hasTeamMembers ? "✓" : "(Optional)"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
