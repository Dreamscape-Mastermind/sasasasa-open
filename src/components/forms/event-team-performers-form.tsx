"use client";

import * as z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard";
import { Loader2, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamMemberRole } from "@/types/event";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

const teamMemberSchema = z.object({
  team_members: z
    .array(
      z.object({
        email: z.string().email("Invalid email address"),
        role: z.nativeEnum(TeamMemberRole),
      })
    )
    .default([]),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

interface EventTeamMembersFormProps {
  onFormSubmitSuccess: () => void;
  eventId?: string;
  onStepComplete: () => void;
  onSkip?: () => void;
  canSkip?: boolean;
}

export default function EventTeamMembersForm({
  onFormSubmitSuccess,
  eventId,
  onStepComplete,
  onSkip,
  canSkip = false,
}: EventTeamMembersFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    useEvent: useEventQuery,
    useUpdateEvent,
    useInviteTeamMember,
  } = useEvent();
  const { data: eventData, error: eventError } = useEventQuery(eventId || "");
  const updateEvent = useUpdateEvent(eventId || "");
  const inviteTeamMember = useInviteTeamMember(eventId || "");

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      team_members: [],
    },
  });

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

  // Add new performer
  const addPerformer = () => {
    const currentPerformers = form.getValues("performers");
    form.setValue("performers", [
      ...currentPerformers,
      {
        name: "",
        bio: "",
        image_url: "",
        website_url: "",
        social_links: {},
        performance_time: "",
      },
    ]);
  };

  // Remove performer
  const removePerformer = (index: number) => {
    const currentPerformers = form.getValues("performers");
    form.setValue(
      "performers",
      currentPerformers.filter((_, i) => i !== index)
    );
  };

  // Update team member
  const updateTeamMember = (index: number, field: string, value: any) => {
    const currentMembers = form.getValues("team_members");
    const updatedMembers = [...currentMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    form.setValue("team_members", updatedMembers);
  };

  const onSubmit = async (data: TeamMemberFormData) => {
    if (!eventId) {
      toast.error("Event ID is required");
      return;
    }

    setIsLoading(true);
    try {
      // Invite each team member
      for (const member of data.team_members) {
        await inviteTeamMember.mutateAsync({
          user_email: member.email,
          role: member.role,
        });
      }

      toast.success("Event team members invited successfully");
      onStepComplete();
      onFormSubmitSuccess();
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to invite team members");
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
            {teamMembers.map((member, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Team Member {index + 1}</h4>
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
              Add Team Member
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex justify-between pt-4">
        {canSkip && onSkip && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip Step
          </Button>
        )}

        <div className="flex gap-2 ml-auto">
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
