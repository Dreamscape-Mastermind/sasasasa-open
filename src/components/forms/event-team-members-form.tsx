"use client";

import * as z from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Loader2, Plus, Users, X } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 text-foreground">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Premium Header */}
        <div className="text-center space-y-2 sm:space-y-4 mb-6 sm:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 mb-2 sm:mb-4">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Event Team
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Add team members to help manage your event.
          </p>
        </div>

        {/* Premium Form Grid */}
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <Card className="group border-0 shadow-lg sm:shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
                  <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                    Event Team
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                    Add team members to help manage your event
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-4 sm:space-y-6">
                {topError && (
                  <Alert
                    variant="destructive"
                    className="mb-4 sm:mb-8 border-red-200 bg-red-50 dark:bg-red-950/20"
                  >
                    <AlertTitle className="text-sm sm:text-base text-red-800 dark:text-red-200">
                      Could not save team
                    </AlertTitle>
                    <AlertDescription className="text-sm text-red-700 dark:text-red-300">
                      {topError}
                    </AlertDescription>
                  </Alert>
                )}
                {teamMembers.map((member, index) => (
                  <div
                    key={member.id || index}
                    className="p-4 sm:p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl space-y-4 sm:space-y-6 bg-white/50 dark:bg-gray-800/50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <h4 className="font-medium text-sm sm:text-base text-foreground">
                          Team Member {index + 1}
                        </h4>
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
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2 sm:space-y-3">
                        <Label className="text-xs sm:text-sm font-semibold text-foreground">
                          Email Address *
                        </Label>
                        <Input
                          type="email"
                          placeholder="team@example.com"
                          value={member.email}
                          onChange={(e) =>
                            updateTeamMember(index, "email", e.target.value)
                          }
                          className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <Label className="text-xs sm:text-sm font-semibold text-foreground">
                          Role *
                        </Label>
                        <Select
                          value={member.role || undefined}
                          onValueChange={(value) =>
                            updateTeamMember(index, "role", value)
                          }
                        >
                          <SelectTrigger className="h-8 sm:h-10 border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base">
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

                <Button
                  type="button"
                  variant="outline"
                  onClick={addTeamMember}
                  className="h-8 sm:h-10 px-4 sm:px-6 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 rounded-lg sm:rounded-xl text-sm font-medium"
                >
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
                className="flex items-center gap-2 h-8 sm:h-10 px-4 sm:px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 rounded-lg sm:rounded-xl"
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-8 sm:h-10 px-4 sm:px-6 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 rounded-full text-sm font-medium"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Previous
            </Button>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              {canSkip && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onSkip}
                  disabled={!canGoNext}
                  className="w-full sm:w-auto h-8 sm:h-10 px-4 sm:px-6 text-muted-foreground hover:text-foreground transition-all duration-300 rounded-full text-sm font-medium"
                >
                  Skip
                </Button>
              )}
              <Button
                type="button"
                onClick={onNext}
                disabled={!canGoNext}
                className="w-full sm:w-auto flex items-center justify-center gap-2 h-8 sm:h-10 px-6 sm:px-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-300 rounded-full text-sm font-semibold"
              >
                Next
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
