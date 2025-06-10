"use client";

import * as z from "zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInviteTeamMember, useTeamMembers } from "@/hooks/useEvent";
import { usePublishEvent } from "@/hooks/useEvent"; // Import the usePublish hook
import { useParams, useSearchParams } from "next/navigation";
// import { useTeamMembers } from "@/services/events-team/queries"; // Import the query hook
import { zodResolver } from "@hookform/resolvers/zod";
import { TeamMemberRole } from "@/types/event";
import { Users } from "lucide-react";

// First, define the role type and schema
const ROLES = {
  EVENT_ORGANIZER: "EVENT_ORGANIZER",
  EVENT_TEAM: "EVENT_TEAM",
  SELLER: "SELLER",
  CUSTOMER: "CUSTOMER",
} as const;

type Role = keyof typeof ROLES;

const teamSchema = z.object({
  user_email: z.string().email("Please enter a valid email address"),
  role: z.enum(["EVENT_ORGANIZER", "EVENT_TEAM", "SELLER", "CUSTOMER"], {
    required_error: "Please select a role",
  }),
});

export default function TeamMembersForm() {

  const params = useParams();
  const eventId = params.id as string;
  // Initialize the form
  const teamForm = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      user_email: "", // Adjusted to match the new schema
      role: "EVENT_TEAM", // Default role
    },
  });

  const searchParams = useSearchParams();
  // const eventId = searchParams.get("eventId");

  // Fetch current team members
  const { data: teamMembers, refetch } = useTeamMembers(eventId);

  const inviteTeamMember = useInviteTeamMember(eventId); // Use the mutation to invite a team member
  console.log({teamMembers})
  const handleInvite = async () => {
    const memberData = {
      user_email: teamForm.getValues("user_email"),
      role: teamForm.getValues("role") as TeamMemberRole,
    }; // Get email and role from form
    if (eventId)
      await inviteTeamMember.mutateAsync(memberData);
    console.log({ memberData });
    refetch(); // Refetch team members after inviting
  };

  // Initialize the publish mutation
  const publishEvent = usePublishEvent(eventId); // Use the publish hook

  const handlePublish = async () => {
    try {
      // Call the publish function (you may need to pass eventId or other data)
      if (eventId) await publishEvent.mutateAsync(); // Adjust as necessary
      // Optionally, handle success (e.g., show a success message)
      console.log("Event published successfully!");
    } catch (error) {
      // Handle error (e.g., show an error message)
      console.error("Error publishing event:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Card to display current team members */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Invite Team Members
          </h2>
          <p className="text-muted-foreground">
            Add team members to help manage your event
          </p>
        </div>
        
        {/* Form to invite a new team member */}
        <Form {...teamForm}>
          <form
            onSubmit={teamForm.handleSubmit(handleInvite)}
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4"
          >
            {/* Input for team member email */}
            <FormField
              control={teamForm.control}
              name="user_email" // Updated to match the new schema
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="team@example.com"
                      className="rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Dropdown for role selection */}
            <FormField
              control={teamForm.control}
              name="role" // Updated to match the new schema
              render={({ field }) => (
                <FormItem className="w-full sm:w-48">
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EVENT_ORGANIZER">
                        Event Organizer
                      </SelectItem>
                      <SelectItem value="EVENT_TEAM">Event Team</SelectItem>
                      <SelectItem value="SELLER">Seller</SelectItem>
                      <SelectItem value="CUSTOMER">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="rounded-xl px-6 py-2 w-full sm:w-auto"
            >
              Invite Team Member
            </Button>
          </form>
        </Form>
      </div>
      
      {/* Current Team Members Section */}
      <div className="space-y-4">
        <div className="border-t border-border pt-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Current Team Members</h3>
          
          {teamMembers?.result?.results && teamMembers.result.results.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground uppercase tracking-wider">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {teamMembers.result.results.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {member.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl border border-dashed border-border">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No team members yet</p>
              <p className="text-sm text-muted-foreground">Invite your first team member to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
