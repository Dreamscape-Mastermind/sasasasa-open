import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const routePermissions: Record<string, string[]> = {
  // Dashboard routes
  "/dashboard/analytics": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/events/new": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/team": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/settings": ["ADMIN", "EVENT_ORGANIZER", "EVENT_TEAM", "CUSTOMER"],

  // Event management routes
  "/dashboard/events/[id]/edit": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/events/[id]/team": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/events/[id]/analytics": ["ADMIN", "EVENT_ORGANIZER"],

  // Ticket management routes
  "/dashboard/events/[id]/tickets": ["ADMIN", "EVENT_ORGANIZER", "EVENT_TEAM"],
  "/dashboard/events/[id]/tickets/new": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/events/[id]/tickets/[ticketId]/edit": [
    "ADMIN",
    "EVENT_ORGANIZER",
  ],
  "/dashboard/events/[id]/tickets/export": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/events/[id]/tickets/refunds": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/events/[id]/tickets/check-in": [
    "ADMIN",
    "EVENT_ORGANIZER",
    "EVENT_TEAM",
  ],

  // Flash sale management routes
  "/dashboard/events/[id]/flash-sales": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/events/[id]/flash-sales/new": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/events/[id]/flash-sales/[flashSaleId]/edit": [
    "ADMIN",
    "EVENT_ORGANIZER",
  ],
  "/dashboard/events/[id]/flash-sales/[flashSaleId]/stats": [
    "ADMIN",
    "EVENT_ORGANIZER",
  ],
  "/dashboard/events/[id]/flash-sales/[flashSaleId]/activate": [
    "ADMIN",
    "EVENT_ORGANIZER",
  ],
  "/dashboard/events/[id]/flash-sales/[flashSaleId]/cancel": [
    "ADMIN",
    "EVENT_ORGANIZER",
  ],

  // Discount management routes
  "/dashboard/events/[id]/discounts": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/events/[id]/discounts/new": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/events/[id]/discounts/[discountId]/edit": [
    "ADMIN",
    "EVENT_ORGANIZER",
  ],
  "/dashboard/events/[id]/discounts/[discountId]/usage": [
    "ADMIN",
    "EVENT_ORGANIZER",
  ],
  "/dashboard/events/[id]/discounts/[discountId]/analytics": [
    "ADMIN",
    "EVENT_ORGANIZER",
  ],

  // Payment management routes
  "/dashboard/payments": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/payments/[paymentId]": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/payments/[paymentId]/retry": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/payments/verify": ["ADMIN", "EVENT_ORGANIZER", "CUSTOMER"],
  "/dashboard/payment-providers": ["ADMIN", "EVENT_ORGANIZER"],
  "/dashboard/payment-providers/[providerId]": ["ADMIN", "EVENT_ORGANIZER"],

  // Waitlist management routes
  "/dashboard/waitlist": ["ADMIN"],
  "/dashboard/waitlist/[entryId]": ["ADMIN"],

  // Customer ticket routes
  "/tickets": ["CUSTOMER", "ADMIN", "EVENT_ORGANIZER", "EVENT_TEAM"],
  "/tickets/[ticketId]": ["CUSTOMER", "ADMIN", "EVENT_ORGANIZER", "EVENT_TEAM"],
  "/tickets/[ticketId]/refund": ["CUSTOMER", "ADMIN", "EVENT_ORGANIZER"],
};

const publicRoutes = [
  "/",
  "/about",
  "/login",
  "/register",
  "/checkout",
  "/checkout/callback",
  "/terms",
  "/privacy",
  "/e/[slug]",
];
const protectedRoutes = Object.keys(routePermissions);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication
  const token = request.cookies.get("accessToken");

  if (
    !token &&
    (protectedRoutes.includes(pathname) ||
      Object.keys(routePermissions).some((route) => {
        // Convert route pattern to regex to match dynamic routes
        const pattern = route.replace(/\[.*?\]/g, "[^/]+");
        return new RegExp(`^${pattern}$`).test(pathname);
      }))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For routes that require specific roles
  const matchedRoute = Object.entries(routePermissions).find(([route]) => {
    const pattern = route.replace(/\[.*?\]/g, "[^/]+");
    return new RegExp(`^${pattern}$`).test(pathname);
  });

  if (matchedRoute && token) {
    try {
      const rolesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/accounts/me/roles`,
        {
          headers: {
            Authorization: `Bearer ${token?.value}`,
          },
        }
      );

      if (!rolesResponse.ok) {
        throw new Error("Failed to fetch user roles");
      }

      const { result } = await rolesResponse.json();
      const userRoles = result.roles.map((role: { name: string }) => role.name);

      // Allow SUPER_ADMIN access to all routes
      if (userRoles.includes("SUPER_ADMIN")) {
        return NextResponse.next();
      }

      const hasRequiredRole = matchedRoute[1].some((role) =>
        userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
