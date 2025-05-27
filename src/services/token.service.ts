import { jwtDecode } from "jwt-decode";

class TokenService {
  private static instance: TokenService;
  private cache: Map<string, { isValid: boolean; timestamp: number }>;
  private readonly CACHE_DURATION = 60 * 1000; // 1 minute

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  public validateToken(token: string): boolean {
    const now = Date.now();
    const cached = this.cache.get(token);

    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.isValid;
    }

    try {
      const decoded = jwtDecode(token);
      const isValid = decoded.exp ? decoded.exp * 1000 > now : false;

      this.cache.set(token, { isValid, timestamp: now });

      if (process.env.NODE_ENV === "development") {
        const timeLeft = decoded.exp ? decoded.exp * 1000 - now : 0;
        console.log(`Token expires in: ${Math.floor(timeLeft / 60000)}m ${Math.floor((timeLeft % 60000) / 1000)}s`);
      }

      return isValid;
    } catch {
      this.cache.set(token, { isValid: false, timestamp: now });
      return false;
    }
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public getTokenExpiration(token: string): number | null {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp ? decoded.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  public getTimeUntilExpiration(token: string): number | null {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return null;
    return Math.max(0, expiration - Date.now());
  }
}

export const tokenService = TokenService.getInstance();
