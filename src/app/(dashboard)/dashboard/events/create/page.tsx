'use client'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Circle, ImagePlus, Loader2, MapPin, Check, CircleDot, X, Facebook, Twitter, Instagram, Linkedin, Globe } from 'lucide-react'
import { useForm, Control, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { useEffect, useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import Image from "next/image"
import { VenueSearchResult } from "utils/dataStructures"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadtab"
import EventForm from "@/components/forms/event-form"
import { format } from "date-fns";
import TicketForm from "@/components/forms/ticket-form"
import SocialLinksForm from "@/components/forms/social-links-form"
import { 
  Users, 
  UserCircle, 
  Store, 
  User, 
  Plus,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TeamMembersForm from "@/components/forms/team-members-form"
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
  const [venueSearchResults, setVenueSearchResults] = useState<VenueSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1);
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
            {/* <TabsTrigger 
              value="social"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900"
              disabled={!eventId}
            >
              Social Links
            </TabsTrigger> */}
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
            {/* <TicketForm/> */}
          </TabsContent>

          {/* <TabsContent value="social">
            <SocialLinksForm/>
          </TabsContent> */}

          <TabsContent value="team">
            {/* <TeamMembersForm/> */}
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          {/* <Button 
            type="submit"
            className="dark:bg-zinc-900"
          >
            Create Event
          </Button> */}
          {/* <Button 
            onClick={handlePrevious}
            disabled={currentStep === 1} // Disable if on the first step
            className="dark:bg-zinc-900"
          >
            Previous
          </Button>
          <Button 
            onClick={handleNext} // Assuming 4 is the last step
            disabled={!eventId || currentStep === 3} // Disable if eventId is not available
            className="dark:bg-zinc-900"
          >
            Next
          </Button> */}
        </div>
      </div>
    </div>
  );
}
