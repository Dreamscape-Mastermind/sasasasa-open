"use client";

import * as z from "zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard";
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
import { TeamMemberRole } from "@/types/event";
import { useEvent } from "@/hooks/useEvent";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the schema
const teamSchema = z.object({
  user_email: z.string().email("Please enter a valid email address"),
  role: z.nativeEnum(TeamMemberRole, {
    required_error: "Please select a role",
  }),
});

export default function TeamMembersForm() {
  // Initialize the form
  const teamForm = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      user_email: "",
      role: TeamMemberRole.EVENT_TEAM,
    },
  });

  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  // Get hooks from useEvent
  const { useTeamMembers, useInviteTeamMember, usePublishEvent } = useEvent();

  // Fetch current team members
  const { data: teamMembers, refetch } = useTeamMembers(eventId || "");

  const inviteTeamMember = useInviteTeamMember(eventId || "");

  const handleInvite = async () => {
    const memberData = {
      user_email: teamForm.getValues("user_email"),
      role: teamForm.getValues("role"),
    };
    if (eventId) {
      await inviteTeamMember.mutateAsync(memberData);
      teamForm.reset();
      refetch();
    }
  };

  // Initialize the publish mutation
  const publishEvent = usePublishEvent();

  const handlePublish = async () => {
    try {
      if (eventId) {
        await publishEvent.mutateAsync(eventId);
        console.log("Event published successfully!");
      }
    } catch (error) {
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers?.result?.results?.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.status}
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
                  name="user_email"
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
                  name="role"
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
                          <SelectItem value={TeamMemberRole.EVENT_ORGANIZER}>
                            Event Organizer
                          </SelectItem>
                          <SelectItem value={TeamMemberRole.EVENT_TEAM}>
                            Event Team
                          </SelectItem>
                          <SelectItem value={TeamMemberRole.SELLER}>
                            Seller
                          </SelectItem>
                          <SelectItem value={TeamMemberRole.CUSTOMER}>
                            Customer
                          </SelectItem>
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
                  className="dark:bg-zinc-900 dark:border-gray-700 rounded-full"
                  disabled={inviteTeamMember.isPending}
                >
                  {inviteTeamMember.isPending
                    ? "Inviting..."
                    : "Invite Team Member"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Publish Event</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span>Is everything set?</span>
            <Button
              variant="default"
              className="ml-4"
              onClick={handlePublish}
              disabled={publishEvent.isPending}
            >
              {publishEvent.isPending ? "Publishing..." : "Publish Event"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
