"use client";

import { ROUTES } from "@/lib/constants";
import { UserRole } from "@/types";
import { hasRole } from "@/lib/auth";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseProtectedRouteOptions {
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

export function useProtectedRoute({
  requiredRoles = [],
  redirectTo = ROUTES.LOGIN,
}: UseProtectedRouteOptions = {}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Skip if still loading
    if (isLoading) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role requirements if specified
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role) => hasRole(role));
      if (!hasRequiredRole) {
        router.push(ROUTES.DASHBOARD);
      }
    }
  }, [isAuthenticated, isLoading, requiredRoles, redirectTo, router, user]);

  return {
    isAuthenticated,
    isLoading,
    user,
    hasRequiredRole: user ? requiredRoles.some((role) => hasRole(role)) : false,
  };
}
