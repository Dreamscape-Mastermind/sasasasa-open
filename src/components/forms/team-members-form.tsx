"use client";

import * as z from "zod";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import { TeamMemberRole } from "@/types/event";
import toast from "react-hot-toast";
import { useEvent } from "@/hooks/useEvent";
import { useParams, useSearchParams } from "next/navigation";

const teamSchema = z.object({
  user_email: z.string().email("Please enter a valid email address"),
  role: z.nativeEnum(TeamMemberRole, {
    required_error: "Please select a role",
  }),
});

interface TeamMemberFormData {
  email: string;
  role: TeamMemberRole;
}

export default function TeamMembersForm({ onFormSubmitSuccess, eventId }: { onFormSubmitSuccess?: () => void, eventId?: string }) {
  const searchParams = useSearchParams();
  let eventIdd = eventId ? eventId : searchParams.get("id") as string;

  const [teamMembers, setTeamMembers] = useState<TeamMemberFormData[]>([
    { email: "", role: TeamMemberRole.EVENT_TEAM },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const { useTeamMembers, useInviteTeamMember, useRemoveTeamMember, usePublishEvent } =
    useEvent();

  const { data: teamMembersData, error: teamMembersError } =
    useTeamMembers(eventIdd);
  const inviteTeamMember = useInviteTeamMember(eventIdd);
  const removeTeamMember = useRemoveTeamMember(eventIdd);
  const publishEvent = usePublishEvent();

  useEffect(() => {
    if (teamMembersData?.result?.results) {
      setTeamMembers(
        teamMembersData.result.results.map((member) => ({
          email: member.email,
          role: member.role,
        }))
      );
    }
  }, [teamMembersData]);

  const handleAddMember = () => {
    setTeamMembers([
      ...teamMembers,
      { email: "", role: TeamMemberRole.EVENT_TEAM },
    ]);
  };

  const handleRemoveMember = async (index: number) => {
    const member = teamMembersData?.result?.results[index];
    if (member) {
      try {
        await removeTeamMember.mutateAsync(member.id);
        toast.success("Team member removed successfully");
      } catch (error) {
        toast.error("Failed to remove team member");
      }
    }
    const newMembers = teamMembers.filter((_, i) => i !== index);
    setTeamMembers(newMembers);
  };

  const handleMemberChange = (
    index: number,
    field: keyof TeamMemberFormData,
    value: string
  ) => {
    const newMembers = [...teamMembers];
    newMembers[index][field] = value as TeamMemberRole;
    setTeamMembers(newMembers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Invite each new team member
      const invitePromises = teamMembers.map((member) =>
        inviteTeamMember.mutateAsync({
          user_email: member.email,
          role: member.role,
        })
      );

      await Promise.all(invitePromises);
      toast.success("Team members invited successfully");
      onFormSubmitSuccess?.();
    } catch (error) {
      toast.error("Failed to invite team members");
    } finally {
      setIsLoading(false);
    }
  };

  if (teamMembersError) {
    return (
      <div className="text-red-500">
        Error loading team members. Please try again.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg"
          >
            <div className="space-y-2">
              <Label htmlFor={`email-${index}`}>Email</Label>
              <Input
                id={`email-${index}`}
                type="email"
                value={member.email}
                onChange={(e) =>
                  handleMemberChange(index, "email", e.target.value)
                }
                placeholder="Enter email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`role-${index}`}>Role</Label>
              <select
                id={`role-${index}`}
                value={member.role}
                onChange={(e) =>
                  handleMemberChange(index, "role", e.target.value)
                }
                className="w-full bg-card p-2 border rounded-md"
                required
              >
                {Object.values(TeamMemberRole).map((role) => (
                  <option key={role} value={role}>
                    {role.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            {index > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="md:col-span-2"
                onClick={() => handleRemoveMember(index)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Member
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddMember}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>

        <div className="flex items-center gap-x-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
