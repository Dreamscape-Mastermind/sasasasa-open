import {
  BarChart2,
  Calendar,
  CreditCard,
  FileText,
  Layout,
  MessageSquare,
  Percent,
  Settings,
} from "lucide-react";

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

  // Dashboard Blog routes
  DASHBOARD_BLOG: "/dashboard/blog",
  DASHBOARD_BLOG_ANALYTICS: "/dashboard/blog/analytics",
  DASHBOARD_BLOG_POSTS: "/dashboard/blog/posts",
  DASHBOARD_BLOG_POST: (id: string) => `/dashboard/blog/posts/${id}`,
  DASHBOARD_BLOG_POST_EDIT: (id: string) => `/dashboard/blog/posts/${id}/edit`,
  DASHBOARD_BLOG_POST_CREATE: "/dashboard/blog/posts/create",
  DASHBOARD_BLOG_COMMENTS: "/dashboard/blog/comments",
  // Dashboard Event routes
  DASHBOARD_EVENT_DETAILS: (id: string) => `/dashboard/events/${id}/details`,
  DASHBOARD_EVENT_ATTENDEES: (id: string) =>
    `/dashboard/events/${id}/attendees`,
  DASHBOARD_EVENT_ANALYTICS: (id: string) =>
    `/dashboard/events/${id}/analytics`,
  DASHBOARD_EVENT_PAYMENTS: (id: string) => `/dashboard/events/${id}/payments`,
  DASHBOARD_EVENT_PROMOTIONS: (id: string) =>
    `/dashboard/events/${id}/promotions`,
  DASHBOARD_EVENT_TICKETS: (id: string) => `/dashboard/events/${id}/tickets`,
};

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
    { label: "Events", href: ROUTES.EVENTS, icon: Calendar },
    { label: "Settings", href: ROUTES.DASHBOARD_SETTINGS, icon: Settings },
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
      label: "Event Payments",
      href: ROUTES.DASHBOARD_EVENT_PAYMENTS("{eventId}"),
      icon: CreditCard,
    },
    {
      label: "Event Promotions",
      href: ROUTES.DASHBOARD_EVENT_PROMOTIONS("{eventId}"),
      icon: Percent,
    },
    {
      label: "Event Tickets",
      href: ROUTES.DASHBOARD_EVENT_TICKETS("{eventId}"),
      icon: CreditCard,
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
