'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Control, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadtab"
import { EventForm, TicketForm, TeamMembersForm } from "@/components/dashboard/LazyDashboardComponents"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Edit3, Users, Ticket, Calendar } from "lucide-react"

// First, define the role type and schema
const ROLES = {
  EVENT_ORGANIZER: "EVENT_ORGANIZER",
  EVENT_TEAM: "EVENT_TEAM",
  SELLER: "SELLER",
  CUSTOMER: "CUSTOMER",
} as const;

type Role = keyof typeof ROLES;

const teamSchema = z.object({
  team: z.array(z.object({
    user_email: z.string().email("Please enter a valid email address"),
    role: z.enum(["EVENT_ORGANIZER", "EVENT_TEAM", "SELLER", "CUSTOMER"], {
      required_error: "Please select a role",
    }),
  })).min(1, "At least one team member is required"),
});

export default function CreateEvent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id') as string;
  const isEditMode = Boolean(eventId);

  const [activeTab, setActiveTab] = useState("event-details");
 
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

  // Load event data if editing
  useEffect(() => {
    if (eventId) {
      // TODO: Fetch event data when editing
      console.log('Loading event data for ID:', eventId);
    }
  }, [eventId]);

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'event-details':
        return <Calendar className="w-4 h-4" />;
      case 'tickets':
        return <Ticket className="w-4 h-4" />;
      case 'team':
        return <Users className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Simple header */}
      <div className="mb-6">
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="event-details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="event-details"
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Event Information</span>
            <span className="sm:hidden">Details</span>
          </TabsTrigger>
          <TabsTrigger 
            value="tickets"
            disabled={!isEditMode}
            className="flex items-center gap-2"
            aria-label={`Ticket Options  ${!isEditMode ? '(Create event first)' : ''}`}
          >
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">Event Tickets</span>
            <span className="sm:hidden">Tickets</span>
          </TabsTrigger>
          <TabsTrigger 
            value="team"
            disabled={!isEditMode}
            className="flex items-center gap-2"
            aria-label={`Team & Publishing ${!isEditMode ? '(Create event first)' : ''}`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Team & Publishing</span>
            <span className="sm:hidden">Team</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="event-details" className="space-y-6">
          <EventForm />
        </TabsContent>

        <TabsContent value="tickets">
          <TicketForm />
        </TabsContent>

        <TabsContent value="team">
          <TeamMembersForm />
        </TabsContent>
      </Tabs>

      {/* Simple helper text */}
      {!isEditMode && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Complete the event details to access ticket and team configuration.
          </p>
        </div>
      )}
    </div>
  );
}
