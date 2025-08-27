"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/services/api.service";
import { cookieService } from "@/services/cookie.service";
import { type AuthResponse } from "@/types/user";
import { useAuth } from "@/contexts/AuthContext";

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { applySession } = useAuth();

  useEffect(() => {
    const run = async () => {
      const token = params?.token as string | undefined;
      if (!token) return;
      try {
        const res = await apiClient.post<AuthResponse>(
          "/api/v1/events/accept-invite",
          { token }
        );
        const result = res.result;
        if (result?.tokens && result?.user) {
          const access = result.tokens?.result?.access ?? "";
          const refresh = result.tokens?.result?.refresh ?? "";
          applySession({ access, refresh, user: result.user });
          const redirect = search?.get("redirect") || "/dashboard";
          router.replace(redirect);
          return;
        }
        setError("Invalid response from server");
      } catch (e: any) {
        setError(e?.message || "Failed to accept invite");
      }
    };
    run();
  }, [params?.token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {!error ? (
          <>
            <h1 className="text-2xl font-semibold">Joining your team…</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Verifying your invite and signing you in
            </p>
            <div className="mt-8 animate-pulse h-2 bg-muted rounded-full" />
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Invite issue</h1>
            <p className="mt-2 text-sm text-red-500">{error}</p>
          </>
        )}
      </div>
    </div>
  );
}


