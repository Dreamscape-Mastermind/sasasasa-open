const routePermissions: Record<string, string[]> = {
  // Dashboard routes
  "/dashboard": ["ADMIN", "EVENT_ORGANIZER", "EVENT_TEAM", "CUSTOMER"],
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

export { routePermissions, publicRoutes };
