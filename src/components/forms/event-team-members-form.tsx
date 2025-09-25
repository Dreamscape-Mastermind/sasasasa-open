"use client";

import * as z from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Loader2, Plus, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamMemberRole } from "@/types/event";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const teamMemberSchema = z.object({
  team_members: z
    .array(
      z.object({
        email: z.string().email("Invalid email address"),
        role: z.nativeEnum(TeamMemberRole),
        id: z.string().optional(), // For existing members
        status: z.string().optional(), // For existing members
      })
    )
    .default([]),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

interface EventTeamMembersFormProps {
  onFormSubmitSuccess: () => void;
  eventId?: string;
  onStepComplete: () => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
  onNext?: () => void;
  canGoNext?: boolean;
  onSkip?: () => void;
  canSkip?: boolean;
}

export default function EventTeamMembersForm({
  onFormSubmitSuccess,
  eventId,
  onStepComplete,
  onPrevious,
  canGoPrevious,
  onNext,
  canGoNext,
  onSkip,
  canSkip = false,
}: EventTeamMembersFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  const {
    useEvent: useEventQuery,
    useUpdateEvent,
    useInviteTeamMember,
    useTeamMembers,
  } = useEvent();
  const { data: eventData, error: eventError } = useEventQuery(eventId || "");
  const { data: teamMembersData, isLoading: isLoadingTeamMembers } =
    useTeamMembers(eventId || "");
  const updateEvent = useUpdateEvent(eventId || "");
  const inviteTeamMember = useInviteTeamMember(eventId || "");

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      team_members: [],
    },
  });

  // Populate form with existing team members
  useEffect(() => {
    if (teamMembersData?.result?.results) {
      const existingMembers = teamMembersData.result.results.map(
        (member: any) => ({
          email: member.email,
          role: member.role,
          id: member.id, // Keep track of existing members
          status: member.status,
        })
      );
      form.setValue("team_members", existingMembers);
    }
  }, [teamMembersData, form]);

  // Add new team member
  const addTeamMember = () => {
    const currentMembers = form.getValues("team_members");
    form.setValue("team_members", [
      ...currentMembers,
      { email: "", role: TeamMemberRole.EVENT_TEAM },
    ]);
  };

  // Remove team member
  const removeTeamMember = (index: number) => {
    const currentMembers = form.getValues("team_members");
    form.setValue(
      "team_members",
      currentMembers.filter((_, i) => i !== index)
    );
  };

  // Update team member
  const updateTeamMember = (index: number, field: string, value: any) => {
    const currentMembers = form.getValues("team_members");
    const updatedMembers = [...currentMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    form.setValue("team_members", updatedMembers);
  };

  // Helper function to extract error message from API response
  const extractErrorMessage = (error: any): string => {
    if (error?.response?.data) {
      const errorData = error.response.data;

      // Handle the specific error structure from your API
      if (errorData.status === "error" && errorData.message) {
        // Handle array of error messages
        if (Array.isArray(errorData.message)) {
          return errorData.message.join(", ");
        } else {
          return errorData.message;
        }
      } else if (errorData.result?.errors?.error_details?.detail) {
        // Handle nested error structure
        const detail = errorData.result.errors.error_details.detail;
        if (Array.isArray(detail)) {
          return detail.join(", ");
        } else {
          return detail;
        }
      } else if (errorData.errors) {
        // Handle other error formats
        return JSON.stringify(errorData.errors);
      }
    } else if (error?.message) {
      return error.message;
    }

    return "An unexpected error occurred";
  };

  const onSubmit = async (data: TeamMemberFormData) => {
    if (!eventId) {
      toast.error("Event ID is required");
      return;
    }

    setIsLoading(true);
    setTopError(null);
    try {
      // Only invite new team members (those without an id)
      const newMembers = data.team_members.filter((member) => !member.id);

      if (newMembers.length > 0) {
        const successfulInvites: string[] = [];
        const failedInvites: { email: string; error: string }[] = [];

        for (const member of newMembers) {
          try {
            await inviteTeamMember.mutateAsync({
              user_email: member.email,
              role: member.role,
            });
            successfulInvites.push(member.email);
          } catch (error: any) {
            console.error(`Failed to invite ${member.email}:`, error);

            const errorMessage = extractErrorMessage(error);

            failedInvites.push({
              email: member.email,
              error: errorMessage,
            });
          }
        }

        // Show success message for successful invites
        if (successfulInvites.length > 0) {
          toast.success(
            `${
              successfulInvites.length
            } team member(s) invited successfully: ${successfulInvites.join(
              ", "
            )}`
          );
        }

        // Show error messages for failed invites
        if (failedInvites.length > 0) {
          failedInvites.forEach(({ email, error }) => {
            toast.error(`${email}: ${error}`);
          });
        }

        // If all invites failed, don't proceed to next step
        if (failedInvites.length === newMembers.length) {
          return;
        }
      } else {
        toast.success("No new team members to invite");
      }

      onStepComplete();
      onFormSubmitSuccess();
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      setTopError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (eventError) {
    return (
      <div className="text-red-500">
        Error loading event data. Please try again.
      </div>
    );
  }

  if (isLoadingTeamMembers) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const teamMembers = form.watch("team_members");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Team</CardTitle>
          <CardDescription>
            Add team members to help manage your event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topError && (
              <Alert variant="destructive">
                <AlertTitle>Could not save team</AlertTitle>
                <AlertDescription>{topError}</AlertDescription>
              </Alert>
            )}
            {teamMembers.map((member, index) => (
              <div
                key={member.id || index}
                className="p-4 border rounded-lg space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Team Member {index + 1}</h4>
                    {member.id && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {member.status || "EXISTING"}
                      </span>
                    )}
                    {!member.id && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTeamMember(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      placeholder="team@example.com"
                      value={member.email}
                      onChange={(e) =>
                        updateTeamMember(index, "email", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Select
                      value={member.role || undefined}
                      onValueChange={(value) =>
                        updateTeamMember(index, "role", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addTeamMember}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Team Member
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Team Members Button */}
      {teamMembers.some((member) => !member.id) && (
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting Team Members...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Invite New Team Members
              </>
            )}
          </Button>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between items-center">
        {/* Previous Button - Far Left */}
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        {/* Skip and Next/Submit Buttons - Far Right */}
        <div className="flex gap-2">
          {canSkip && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              disabled={!canGoNext}
            >
              Skip
            </Button>
          )}
          <Button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
