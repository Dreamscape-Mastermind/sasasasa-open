import { AUTH_TOKEN_NAMES, ROLES_CACHE_DURATION } from "./constants";

import Cookies from "js-cookie";

// Set auth cookies
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  // Set access token cookie
  Cookies.set(AUTH_TOKEN_NAMES.ACCESS_TOKEN, accessToken, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  // Set refresh token cookie
  Cookies.set(AUTH_TOKEN_NAMES.REFRESH_TOKEN, refreshToken, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}

// Clear auth cookies
export async function clearAuthCookies(): Promise<void> {
  Cookies.remove(AUTH_TOKEN_NAMES.ACCESS_TOKEN, { path: "/" });
  Cookies.remove(AUTH_TOKEN_NAMES.REFRESH_TOKEN, { path: "/" });
}

// Set user roles in localStorage
export async function setUserRoles(roles: any[]): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "userRoles",
      JSON.stringify({
        roles,
        timestamp: Date.now(),
      })
    );
  }
}

// Get user roles from localStorage
export function getUserRoles(): any[] | null {
  if (typeof window === "undefined") return null;

  const rolesData = localStorage.getItem("userRoles");
  if (!rolesData) return null;

  const { roles, timestamp } = JSON.parse(rolesData);
  const now = Date.now();

  // Check if roles cache has expired
  if (now - timestamp > ROLES_CACHE_DURATION) {
    localStorage.removeItem("userRoles");
    return null;
  }

  return roles;
}

// Clear user roles from localstorage
export function clearUserRoles(): void {
  localStorage.removeItem("userRoles");
}

// Check if user has required role
export function hasRole(requiredRole: string): boolean {
  const roles = getUserRoles();
  if (!roles) return false;

  return roles.some((role) => role.name === requiredRole);
}

export function hasPermission(requiredPermission: string): boolean {
  const roles = getUserRoles();
  if (!roles) return false;

  return roles.some((role) =>
    role.permissions.some(
      (permission: string) => permission === requiredPermission
    )
  );
}
