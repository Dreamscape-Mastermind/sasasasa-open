import type { TokenResponse, UserProfile } from "@/types/user";

import { AUTH_STORAGE } from "@/lib/constants";
import Cookies from "js-cookie";

class CookieService {
  private static instance: CookieService;

  private constructor() {}

  public static getInstance(): CookieService {
    if (!CookieService.instance) {
      CookieService.instance = new CookieService();
    }
    return CookieService.instance;
  }

  public setUser(user: UserProfile): void {
    Cookies.set(AUTH_STORAGE.KEYS.USER, JSON.stringify(user), AUTH_STORAGE.COOKIE_OPTIONS);
  }

  public getUser(): UserProfile | null {
    const user = Cookies.get(AUTH_STORAGE.KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  public setTokens(tokens: TokenResponse): void {
    Cookies.set(AUTH_STORAGE.KEYS.TOKENS, JSON.stringify(tokens), AUTH_STORAGE.COOKIE_OPTIONS);
  }

  public getTokens(): TokenResponse | null {
    const tokens = Cookies.get(AUTH_STORAGE.KEYS.TOKENS);
    return tokens ? JSON.parse(tokens) : null;
  }

  public clearAuth(): void {
    Cookies.remove(AUTH_STORAGE.KEYS.USER, { path: "/" });
    Cookies.remove(AUTH_STORAGE.KEYS.TOKENS, { path: "/" });
  }
}

export const cookieService = CookieService.getInstance();
