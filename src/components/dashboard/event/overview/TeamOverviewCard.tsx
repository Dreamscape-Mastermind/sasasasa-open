"use client";

import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/lib/constants";
import { useEvent } from "@/hooks/useEvent";
import { TeamMemberStatus, type EventTeamMember } from "@/types/event";

type Props = {
  eventId: string;
};

export function TeamOverviewCard({ eventId }: Props) {
  const { useTeamMembers, useResendTeamInvite, useRemoveTeamMember } = useEvent();
  const [actingId, setActingId] = useState<string | null>(null);

  const {
    data: pendingData,
    isLoading: isLoadingPending,
    error: pendingError,
  } = useTeamMembers(eventId, { status: TeamMemberStatus.PENDING, page: 1, page_size: 3 });

  const {
    data: acceptedData,
    isLoading: isLoadingAccepted,
    error: acceptedError,
  } = useTeamMembers(eventId, { status: TeamMemberStatus.ACCEPTED, page: 1, page_size: 1 });

  const resendInvite = useResendTeamInvite(eventId);
  const removeMember = useRemoveTeamMember(eventId);

  const pendingCount = pendingData?.result?.count ?? 0;
  const acceptedCount = acceptedData?.result?.count ?? 0;
  const pendingResults: EventTeamMember[] = pendingData?.result?.results ?? [];

  return (
    <div className="rounded-xl bg-card p-4 sm:p-6 shadow ring-1 ring-border/40">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm text-muted-foreground">Team</div>
          <div className="mt-2 text-lg sm:text-xl font-semibold">
            {acceptedCount} accepted
            <span className="text-muted-foreground"> • {pendingCount} pending</span>
          </div>
        </div>
        <Link
          href={ROUTES.DASHBOARD_EVENT_EDIT(eventId)}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Manage team
        </Link>
      </div>

      <div className="mt-4">
        {isLoadingPending || isLoadingAccepted ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (pendingError || acceptedError) ? (
          <div className="text-sm text-red-500">Failed to load team data</div>
        ) : pendingResults.length > 0 ? (
          <div>
            <div className="text-xs text-muted-foreground">Pending invites</div>
            <ul className="mt-2 space-y-2">
              {pendingResults.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="truncate text-sm block" title={m.email}>{m.email}</span>
                    <span className="text-xs rounded-full bg-muted px-2 py-1">{m.role}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      aria-label={`Resend invite to ${m.email}`}
                      disabled={actingId === m.id || resendInvite.isPending || removeMember.isPending}
                      onClick={async () => {
                        try {
                          setActingId(m.id);
                          await resendInvite.mutateAsync(m.id);
                        } finally {
                          setActingId(null);
                        }
                      }}
                      className="text-xs rounded-lg px-2 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-60"
                    >
                      Resend
                    </button>
                    <button
                      aria-label={`Cancel invite for ${m.email}`}
                      disabled={actingId === m.id || resendInvite.isPending || removeMember.isPending}
                      onClick={async () => {
                        try {
                          setActingId(m.id);
                          await removeMember.mutateAsync(m.id);
                        } finally {
                          setActingId(null);
                        }
                      }}
                      className="text-xs rounded-lg px-2 py-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No pending invites</div>
        )}
      </div>
    </div>
  );
}

export default TeamOverviewCard;


