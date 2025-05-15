"use client";

import React from "react";
import Spinner from "@/components/ui/spiner";
import { UserRole } from "@/types";
import { useAuth } from "@/context/auth-context";

interface WithAuthProps {
  requiredRoles?: UserRole[];
  LoadingComponent?: React.ComponentType;
  UnauthorizedComponent?: React.ComponentType;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  {
    requiredRoles = [],
    LoadingComponent = () => <Spinner />,
    UnauthorizedComponent = () => (
      <div>You don't have permission to access this page.</div>
    ),
  }: WithAuthProps = {}
) {
  const WithAuthComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading, user, roles } = useAuth();

    if (isLoading) {
      return <LoadingComponent />;
    }

    if (!isAuthenticated) {
      return <UnauthorizedComponent />;
    }

    if (requiredRoles.length > 0 && roles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role) =>
        (roles as unknown as UserRole[]).includes(role)
      );
      if (!hasRequiredRole) {
        return <UnauthorizedComponent />;
      }
    }

    return <Component {...props} />;
  };

  return WithAuthComponent;
}
