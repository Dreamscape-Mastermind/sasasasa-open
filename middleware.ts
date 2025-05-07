import { publicRoutes, routePermissions } from "@/lib/roles";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = Object.keys(routePermissions);
const ROLES_CACHE_COOKIE = "user_roles_cache";
const ROLES_CACHE_DURATION = 60 * 30; // 30 minutes in seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Helper function to add security headers
function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
}

// Helper function to handle API errors
async function handleApiError(
  error: unknown,
  request: NextRequest,
  pathname: string
) {
  console.error("API Error:", {
    error: error instanceof Error ? error.message : "Unknown error",
    path: pathname,
    timestamp: new Date().toISOString(),
  });

  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(redirectUrl);
}

// Helper function to fetch roles with retry logic
async function fetchRolesWithRetry(
  token: string,
  retries = MAX_RETRIES
): Promise<string[]> {
  try {
    const rolesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/accounts/me/roles`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!rolesResponse.ok) {
      throw new Error(`Failed to fetch roles: ${rolesResponse.status}`);
    }

    const { result } = await rolesResponse.json();
    return result.roles.map((role: { name: string }) => role.name);
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchRolesWithRetry(token, retries - 1);
    }
    throw error;
  }
}

export async function middleware(request: NextRequest) {
  const startTime = performance.now();
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Check for authentication only on protected routes
  const isProtectedRoute =
    protectedRoutes.includes(pathname) ||
    Object.keys(routePermissions).some((route) => {
      const pattern = route.replace(/\[.*?\]/g, "[^/]+");
      return new RegExp(`^${pattern}$`).test(pathname);
    });

  if (isProtectedRoute) {
    const token = request.cookies.get("accessToken");
    if (!token) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return addSecurityHeaders(NextResponse.redirect(redirectUrl));
    }

    // For routes that require specific roles
    const matchedRoute = Object.entries(routePermissions).find(([route]) => {
      const pattern = route.replace(/\[.*?\]/g, "[^/]+");
      return new RegExp(`^${pattern}$`).test(pathname);
    });

    if (matchedRoute) {
      try {
        // Check for cached roles
        const cachedRoles = request.cookies.get(ROLES_CACHE_COOKIE);
        let userRoles: string[] = [];

        if (cachedRoles) {
          try {
            const { roles, timestamp } = JSON.parse(cachedRoles.value);
            const now = Math.floor(Date.now() / 1000);

            // Use cached roles if they're still valid
            if (now - timestamp < ROLES_CACHE_DURATION) {
              userRoles = roles;
            }
          } catch (e) {
            console.error("Cache parsing error:", {
              error: e instanceof Error ? e.message : "Unknown error",
              path: pathname,
            });
          }
        }

        // Fetch fresh roles if no valid cache exists
        if (userRoles.length === 0) {
          userRoles = await fetchRolesWithRetry(token.value);

          // Cache the roles
          const response = NextResponse.next();
          response.cookies.set(
            ROLES_CACHE_COOKIE,
            JSON.stringify({
              roles: userRoles,
              timestamp: Math.floor(Date.now() / 1000),
            }),
            {
              maxAge: ROLES_CACHE_DURATION,
              path: "/",
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            }
          );
          return addSecurityHeaders(response);
        }

        // Allow SUPER_ADMIN access to all routes
        if (userRoles.includes("SUPER_ADMIN")) {
          return addSecurityHeaders(NextResponse.next());
        }

        const hasRequiredRole = matchedRoute[1].some((role) =>
          userRoles.includes(role)
        );

        if (!hasRequiredRole) {
          return addSecurityHeaders(
            NextResponse.redirect(new URL("/unauthorized", request.url))
          );
        }
      } catch (error) {
        return handleApiError(error, request, pathname);
      }
    }
  }

  const response = NextResponse.next();
  const endTime = performance.now();

  // Add performance metrics header
  response.headers.set("Server-Timing", `total;dur=${endTime - startTime}`);

  return addSecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
