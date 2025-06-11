import {
  BarChart2,
  Calendar,
  CreditCard,
  FileText,
  Layout,
  MessageSquare,
  Percent,
  Settings,
  Ticket,
  Users,
} from "lucide-react";

import Cookies from "js-cookie";

export const ROUTES = {
  // Main routes
  HOME: "/",
  EVENTS: "/e",
  EVENT_DETAILS: (slug: string) => `/e/${slug}`,
  BLOG: "/blog",
  BLOG_POST: (slug: string) => `/blog/${slug}`,
  ABOUT: "/about",
  CONTACT: "/contact",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  FEATURES: "/features",
  CHECKOUT: "/checkout",
  CHECKOUT_CALLBACK: "/checkout/callback",

  // Auth routes
  LOGIN: "/login",
  VERIFY_OTP: "/verify-otp",
  UNAUTHORIZED: "/unauthorized",

  // Dashboard routes
  DASHBOARD: "/dashboard",
  DASHBOARD_SETTINGS: "/dashboard/settings",
  DASHBOARD_PURCHASES: "/dashboard/purchases",

  // Dashboard Blog routes
  DASHBOARD_BLOG: "/dashboard/blog",
  DASHBOARD_BLOG_ANALYTICS: "/dashboard/blog/analytics",
  DASHBOARD_BLOG_POSTS: "/dashboard/blog/posts",
  DASHBOARD_BLOG_POST: (id: string) => `/dashboard/blog/posts/${id}`,
  DASHBOARD_BLOG_POST_EDIT: (id: string) => `/dashboard/blog/posts/${id}/edit`,
  DASHBOARD_BLOG_POST_CREATE: "/dashboard/blog/posts/create",
  DASHBOARD_BLOG_COMMENTS: "/dashboard/blog/comments",
  // Dashboard Event routes
  DASHBOARD_EVENTS: "/dashboard/events",
  DASHBOARD_EVENT_CREATE: () => "/dashboard/events/create",
  DASHBOARD_EVENT_ANALYTICS: (id: string) =>
    `/dashboard/events/${id}/analytics`,
  DASHBOARD_EVENT_ATTENDEES: (id: string) =>
    `/dashboard/events/${id}/attendees`,
  DASHBOARD_EVENT_DETAILS: (id: string) => `/dashboard/events/${id}/details`,
  DASHBOARD_EVENT_EDIT: (id: string) => `/dashboard/events/${id}/edit`,
  DASHBOARD_EVENT_OVERVIEW: (id: string) => `/dashboard/events/${id}/overview`,
  DASHBOARD_EVENT_PAYMENTS: (id: string) => `/dashboard/events/${id}/payments`,
  DASHBOARD_EVENT_PROMOTIONS: (id: string) =>
    `/dashboard/events/${id}/promotions`,
  DASHBOARD_EVENT_TICKETS: (id: string) => `/dashboard/events/${id}/tickets`,
};

// Route protection configuration
export const ROUTE_PROTECTION = {
  // Public routes that don't require authentication
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.EVENTS,
    ROUTES.EVENT_DETAILS("*"),
    ROUTES.BLOG,
    ROUTES.BLOG_POST("*"),
    ROUTES.ABOUT,
    ROUTES.CONTACT,
    ROUTES.TERMS,
    ROUTES.PRIVACY,
    ROUTES.FEATURES,
    ROUTES.CHECKOUT,
    ROUTES.CHECKOUT_CALLBACK,
    ROUTES.LOGIN,
    ROUTES.VERIFY_OTP,
    ROUTES.UNAUTHORIZED,
  ],
  // Auth routes (login, register, etc.)
  AUTH: [ROUTES.LOGIN, ROUTES.VERIFY_OTP],
  // Protected routes that require authentication
  PROTECTED: [
    ROUTES.DASHBOARD,
    ROUTES.DASHBOARD_SETTINGS,
    ROUTES.DASHBOARD_BLOG,
    ROUTES.DASHBOARD_BLOG_ANALYTICS,
    ROUTES.DASHBOARD_BLOG_POSTS,
    ROUTES.DASHBOARD_BLOG_POST("*"),
    ROUTES.DASHBOARD_BLOG_POST_EDIT("*"),
    ROUTES.DASHBOARD_BLOG_POST_CREATE,
    ROUTES.DASHBOARD_BLOG_COMMENTS,
    ROUTES.DASHBOARD_EVENT_DETAILS("*"),
    ROUTES.DASHBOARD_EVENT_ATTENDEES("*"),
    ROUTES.DASHBOARD_EVENT_ANALYTICS("*"),
    ROUTES.DASHBOARD_EVENT_PAYMENTS("*"),
    ROUTES.DASHBOARD_EVENT_PROMOTIONS("*"),
    ROUTES.DASHBOARD_EVENT_TICKETS("*"),
    ROUTES.DASHBOARD_PURCHASES,
  ],
} as const;

export const ACCESS_LEVELS = {
  PUBLIC: "PUBLIC",
  AUTHENTICATED: "AUTHENTICATED",
  ADMIN: "ADMIN",
  EVENT_ORGANIZER: "EVENT_ORGANIZER",
  EVENT_TEAM: "EVENT_TEAM",
  CUSTOMER: "CUSTOMER",
};

export const NAV_ITEMS = {
  MAIN: [
    { label: "Home", href: ROUTES.HOME },
    { label: "Events", href: ROUTES.EVENTS },
    { label: "Blog", href: ROUTES.BLOG },
    { label: "About", href: ROUTES.ABOUT },
    // { label: "Contact", href: ROUTES.CONTACT },
    { label: "Features", href: ROUTES.FEATURES },
    // { label: "Checkout", href: ROUTES.CHECKOUT },
  ],
  DASHBOARD_ADMIN: [
    { label: "Dashboard", href: ROUTES.DASHBOARD, icon: Layout },
    { label: "Events", href: ROUTES.DASHBOARD_EVENTS, icon: Calendar },
    { label: "Settings", href: ROUTES.DASHBOARD_SETTINGS, icon: Settings },
    {
      label: "My Purchases",
      icon: Ticket,
      href: "/dashboard/purchases",
    },
  ],
  DASHBOARD_EVENT_ORGANIZER: [
    {
      label: "Event Analytics",
      href: ROUTES.DASHBOARD_EVENT_ANALYTICS("{eventId}"),
      icon: BarChart2,
    },
    {
      label: "Event Details",
      href: ROUTES.DASHBOARD_EVENT_DETAILS("{eventId}"),
      icon: Calendar,
    },
    {
      label: "Event Tickets",
      href: ROUTES.DASHBOARD_EVENT_TICKETS("{eventId}"),
      icon: CreditCard,
    },
    {
      label: "Event Attendees",
      href: ROUTES.DASHBOARD_EVENT_ATTENDEES("{eventId}"),
      icon: Users,
    },
    {
      label: "Event Payments",
      href: ROUTES.DASHBOARD_EVENT_PAYMENTS("{eventId}"),
      icon: CreditCard,
    },
    {
      label: "Event Promotions",
      href: ROUTES.DASHBOARD_EVENT_PROMOTIONS("{eventId}"),
      icon: Percent,
    },
  ],
  DASHBOARD_BLOG_ADMIN: [
    {
      label: "Analytics",
      href: ROUTES.DASHBOARD_BLOG_ANALYTICS,
      icon: BarChart2,
    },
    { label: "Blog Posts", href: ROUTES.DASHBOARD_BLOG_POSTS, icon: FileText },
    {
      label: "Blog Comments",
      href: ROUTES.DASHBOARD_BLOG_COMMENTS,
      icon: MessageSquare,
    },
  ],
};

export const AUTH_TOKEN_NAMES = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
};

export const ROLES_CACHE_COOKIE = "user_roles_cache";
export const ROLES_CACHE_DURATION = 60 * 30; // 30 minutes in seconds
export const MAX_RETRIES = 2;
export const RETRY_DELAY = 1000; // 1 second

// Auth storage configuration
export const AUTH_STORAGE = {
  COOKIE_OPTIONS: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  },
  KEYS: {
    USER: "SS_USER_DATA",
    TOKENS: "SS_AUTH_TOKENS",
  },
} as const;

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
