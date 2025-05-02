"use client";

import { useUser, useUserRoles } from "@/lib/hooks/useAuth";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

/**
 * ProtectedRoute is a component that conditionally renders its children based on user authentication and role permissions.
 * It checks if the current user is authenticated and has the required roles to access the content.
 * If the user is not authenticated or does not have the required roles, it redirects to the login page or the unauthorized page.
 *
 * @param {React.ReactNode} children - The content to render if the user is authenticated and has the required roles.
 * @param {string[]} [requiredRoles] - An array of role names that are required to access the content.
 * @returns {React.ReactNode} The rendered content based on the user's authentication and role permissions.
 */
export function ProtectedRoute({
  children,
  requiredRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { data: roles, isLoading: isLoadingRoles } = useUserRoles();

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push("/login");
      return;
    }

    if (requiredRoles && !isLoadingRoles && roles) {
      const userRoleNames = roles.map((role) => role.name);
      const hasRequiredRole = requiredRoles.some((role) =>
        userRoleNames.includes(role)
      );

      if (!hasRequiredRole) {
        router.push("/unauthorized");
      }
    }
  }, [user, roles, isLoadingUser, isLoadingRoles, router, requiredRoles]);

  if (isLoadingUser || (requiredRoles && isLoadingRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRoles && roles) {
    const userRoleNames = roles.map((role) => role.name);
    const hasRequiredRole = requiredRoles.some((role) =>
      userRoleNames.includes(role)
    );

    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}
