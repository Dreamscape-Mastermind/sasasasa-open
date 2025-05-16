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
import { useInviteTeamMember, useTeamMembers } from "@/lib/hooks/useEvents";
import { usePublishEvent } from "@/lib/hooks/useEvents"; // Import the usePublish hook
import { useParams, useSearchParams } from "next/navigation";
// import { useTeamMembers } from "@/services/events-team/queries"; // Import the query hook
import { zodResolver } from "@hookform/resolvers/zod";

// import { useMyEvents } from '@/lib/hooks/useEvents';useInviteTeamMember

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
      role: teamForm.getValues("role"),
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
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Card to display current team members */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              Current Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers?.results?.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr className="my-4 border-gray-300 dark:border-gray-700" />
            <h3 className="text-lg font-bold">Invite Team Members</h3>
            {/* Form to invite a new team member */}
            <Form {...teamForm}>
              <form
                onSubmit={teamForm.handleSubmit(handleInvite)}
                className="flex items-center space-x-4 mt-4"
              >
                {/* Input for team member email */}
                <FormField
                  control={teamForm.control}
                  name="user_email" // Updated to match the new schema
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="team@example.com"
                          className="dark:bg-zinc-900 dark:border-gray-700 mt-2 rounded-full"
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
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-40 rounded-full">
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
                  variant="outline"
                  size="sm"
                  className=" dark:bg-zinc-900 dark:border-gray-700 rounded-full"
                >
                  Invite Team Member
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Publish Event</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span>Is everything set?</span>
            <Button variant="default" className="ml-4" onClick={handlePublish}>
              Publish Event
            </Button>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
