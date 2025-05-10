import { AUTH_TOKEN_NAMES, ROUTES } from "@/lib/constants";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { userApi } from "@/lib/api/userApiService";

// Define which paths need authentication
const protectedPaths = ["/dashboard"];

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp ? decoded.exp < currentTime : true;
  } catch {
    return true;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path is protected
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // If path is not protected, allow access
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // Get the access & refresh token from cookies
  const accessToken = request.cookies.get(AUTH_TOKEN_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = request.cookies.get(
    AUTH_TOKEN_NAMES.REFRESH_TOKEN
  )?.value;

  // If no access & refresh token, redirect to login
  if (!accessToken && !refreshToken) {
    const url = new URL(ROUTES.LOGIN, request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Check if access token is expired or missing
  const isAccessTokenExpired =
    !accessToken || (accessToken && isTokenExpired(accessToken));

  // check if refresh token has expired.
  const isRefreshTokenExpired =
    !refreshToken || (refreshToken && isTokenExpired(refreshToken));

  // If access token is expired and we have a refresh token, try to refresh
  if (isAccessTokenExpired && !isRefreshTokenExpired) {
    try {
      await userApi.refreshToken({
        refresh: refreshToken,
      });
      return NextResponse.next();
    } catch (error) {
      // If refresh fails for any reason, redirect to login
      const url = new URL(ROUTES.LOGIN, request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // If access token is expired and no refresh token, redirect to login
  if (isAccessTokenExpired || isRefreshTokenExpired) {
    const url = new URL(ROUTES.LOGIN, request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Token is valid, continue
  return NextResponse.next();
}

// Configure matching paths for middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
