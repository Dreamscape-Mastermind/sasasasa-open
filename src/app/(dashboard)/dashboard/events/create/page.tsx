'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Control, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadtab"
import { EventForm, TicketForm, TeamMembersForm } from "@/components/dashboard/LazyDashboardComponents"
import { format } from "date-fns";
import { useSearchParams } from "next/navigation"

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
  const eventId = searchParams.get('eventId');

  const [activeTab, setActiveTab] = useState("event-details"); // State for active tab
 
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


  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="event-details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-zinc-800 rounded-none">
            <TabsTrigger 
              value="event-details"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900"
            >
              Event Details
            </TabsTrigger>
            <TabsTrigger 
              value="tickets"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900"
              disabled={!eventId}
            >
              Ticket Types
            </TabsTrigger>
            <TabsTrigger 
              value="team"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900"
              disabled={!eventId}
            >
              Team & Publishing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="event-details" className="space-y-6">
            <EventForm/>
          </TabsContent>

          <TabsContent value="tickets">
            <TicketForm/>
          </TabsContent>

          <TabsContent value="team">
            <TeamMembersForm/>
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
        </div>
      </div>
    </div>
  );
}
