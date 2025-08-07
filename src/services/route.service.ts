import { ROUTES, ROUTE_PROTECTION } from "@/lib/constants";

export type RouteCategory = "PROTECTED" | "AUTH" | "PUBLIC" | "NOT_FOUND";

class RouteService {
  private static instance: RouteService;

  private constructor() {}

  public static getInstance(): RouteService {
    if (!RouteService.instance) {
      RouteService.instance = new RouteService();
    }
    return RouteService.instance;
  }

  public getRouteCategory(path: string): RouteCategory {
    // Check if path matches any protected route pattern
    const isProtected = ROUTE_PROTECTION.PROTECTED.some((route) => {
      if (route.includes("*")) {
        const pattern = route.replace("*", ".*");
        return new RegExp(`^${pattern}$`).test(path);
      }
      return path.startsWith(route);
    });

    if (isProtected) return "PROTECTED";

    // Check if path matches any auth route
    const isAuth = ROUTE_PROTECTION.AUTH.some((route) => path === route);
    if (isAuth) return "AUTH";

    // Check if path matches any public route pattern
    const isPublic = ROUTE_PROTECTION.PUBLIC.some((route) => {
      if (route.includes("*")) {
        const pattern = route.replace("*", ".*");
        return new RegExp(`^${pattern}$`).test(path);
      }
      return path === route;
    });

    return isPublic ? "PUBLIC" : "NOT_FOUND";
  }

  public getRedirectPath(path: string, isAuthenticated: boolean): string | null {
    const category = this.getRouteCategory(path);

    switch (category) {
      case "AUTH":
        return isAuthenticated ? ROUTES.DASHBOARD : null;
      case "PROTECTED":
        return !isAuthenticated ? `${ROUTES.LOGIN}?redirect=${encodeURIComponent(path)}` : null;
      case "NOT_FOUND":
        return ROUTES.UNAUTHORIZED;
      default:
        return null;
    }
  }

  public isProtectedRoute(path: string): boolean {
    return this.getRouteCategory(path) === "PROTECTED";
  }

  public isAuthRoute(path: string): boolean {
    return this.getRouteCategory(path) === "AUTH";
  }

  public isPublicRoute(path: string): boolean {
    return this.getRouteCategory(path) === "PUBLIC";
  }
}

export const routeService = RouteService.getInstance();
