"use client";

import { useUserRoles } from "@/lib/hooks/useAuth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

/**
 * RoleGuard is a component that conditionally renders its children based on user roles.
 * It checks if the current user has any of the allowed roles and displays the children
 * if a match is found. If the user roles are still loading, a loading spinner is shown.
 * If the user does not have the required roles, a fallback component is rendered.
 * Usage for component-level permissions
    {
        <RoleGuard allowedRoles={["ADMIN"]}>
            <AdminOnlyComponent />
        </RoleGuard>
    }
 * @param {React.ReactNode} children - The content to render if the user has an allowed role.
 * @param {string[]} allowedRoles - An array of role names that are permitted to view the children.
 * @param {React.ReactNode} [fallback=null] - The content to render if the user does not have an allowed role.
 * @returns {React.ReactNode} The rendered content based on the user's roles.
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {
  const { data: roles, isLoading } = useUserRoles();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!roles) {
    return fallback;
  }

  const userRoleNames = roles.map((role) => role.name);
  const hasAllowedRole = allowedRoles.some((role) =>
    userRoleNames.includes(role)
  );

  if (!hasAllowedRole) {
    return fallback;
  }

  return <>{children}</>;
}
