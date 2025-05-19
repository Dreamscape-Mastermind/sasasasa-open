'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { AuthTokens, StorageKey } from '@/utils/dataStructures';
import { CombinedProvider, useAppKitAccount, useAppKitProvider, useWalletInfo } from '@reown/appkit/react';
import { BrowserProvider, Eip1193Provider } from 'ethers';

// Use Sets for O(1) lookup performance
const ROUTE_SETS = {
  PROTECTED: new Set([
    '/dashboard',
    '/dashboard/events/new',
    '/create',
    
    '/dash',
  ]),
  AUTH: new Set([
    '/login',
    '/signup',
  ])
} as const;





// Optimize the User interface with specific types
interface User {
  id: string;
  email: string;
  phone: string | null;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  avatar: string | null;
  bio: string | null;
  preferences: Record<string, unknown>;
  notification_settings: Record<string, boolean>;
  social_handles: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
  };
  website: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, tokens: AuthTokens) => void;
  logout: () => void;
  isAuthenticated: boolean;
  getAccessToken: () => string | null;
  isLoading: boolean;
  onSignAndVerifyMessage: (message: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Add a type for route categories
type RouteCategory = 'PROTECTED' | 'AUTH' | 'PUBLIC' | 'NOT_FOUND';

// Add valid routes Set for existence checking
const VALID_ROUTES = new Set([
  '/dashboard',
  '/dashboard/events/new',
  '/create',
  '/login',
  '/signup',
  '/verify-otp',
  '/',
  '/about',
  // Add all valid routes here
]);

// Optimize route checking functions with default behavior
const getRouteCategory = (path: string): RouteCategory => {
  // First check if route exists
  if (!VALID_ROUTES.has(path)) return 'NOT_FOUND';
  
  if (ROUTE_SETS.PROTECTED.has(path)) return 'PROTECTED';
  if (ROUTE_SETS.AUTH.has(path)) return 'AUTH';
  return 'PUBLIC';
};

// Memoize token validation function
const memoizedTokenValidation = (() => {
  const cache = new Map<string, { isValid: boolean; timestamp: number }>();
  const CACHE_DURATION = 60 * 1000; // 1 minute

  return (token: string): boolean => {
    const now = Date.now();
    const cached = cache.get(token);

    if (cached && (now - cached.timestamp < CACHE_DURATION)) {
      return cached.isValid;
    }

    try {
      const decoded = jwtDecode(token);
      const isValid = decoded.exp ? decoded.exp * 1000 > now : false;
      
      cache.set(token, { isValid, timestamp: now });
      
      if (process.env.NODE_ENV === 'development') {
        const timeLeft = decoded.exp ? decoded.exp * 1000 - now : 0;
        console.log(`Token expires in: ${Math.floor(timeLeft / 60000)}m ${Math.floor((timeLeft % 60000) / 1000)}s`);
      }
      
      return isValid;
    } catch {
      cache.set(token, { isValid: false, timestamp: now });
      return false;
    }
  };
})();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { address } = useAppKitAccount()

  const { walletProvider } = useAppKitProvider('eip155')



  async function getNonceMessage(address: string, chainId= 534351) {
    const messageData = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/web3/nonce`, {
      method: 'POST',
      body: JSON.stringify({ address, chain_id: chainId  })
    })
    const message = await messageData.json()
    return message as { message: string, data: any }
  }

  const onSignAndVerifyMessage = useCallback(async (message: string) => {
    if(!address) {
      throw new Error('No address found')
    }

    // But now we need to see what One Click login version of this is like
    
    const signAndVerifyMessage = async () => {
      const provider = new BrowserProvider(walletProvider as CombinedProvider)
      const messageData = await getNonceMessage(address)
      console.log(messageData)
      const signer = await provider.getSigner()
      const signature = await signer?.signMessage(messageData.data)
      console.log(signature)
      const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/v1/web3/verify`, {
        method: 'POST',
        body: JSON.stringify({ message_data: messageData.data, signature })
      })
      const data = await response.json()
      console.log(data)
    }
    await signAndVerifyMessage()
  }, [address])

  // Optimize route checking with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleRouteCheck = () => {
      const path = window.location.pathname;
      
      if (isLoading) return;

      const routeCategory = getRouteCategory(path);
      
      switch (routeCategory) {
        case 'AUTH':
          if (isAuthenticated) {
            router.push('/dashboard');
          }
          break;
        
        case 'PROTECTED':
          if (!isAuthenticated) {
            const returnUrl = encodeURIComponent(path);
            router.push(`/login?redirect=${returnUrl}`);
          }
          break;
        
        case 'NOT_FOUND':
          // Let Next.js handle 404s naturally
          break;
        
        case 'PUBLIC':
          // Public routes are accessible to everyone
          break;
      }
    };

    const debouncedRouteCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleRouteCheck, 100);
    };

    debouncedRouteCheck();
    window.addEventListener('popstate', debouncedRouteCheck);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('popstate', debouncedRouteCheck);
    };
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem(StorageKey.USER);
        const tokens = localStorage.getItem(StorageKey.TOKENS);
        
        if (storedUser && tokens) {
          const parsedTokens: AuthTokens = JSON.parse(tokens);
          if (memoizedTokenValidation(parsedTokens.access)) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else {
            await logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        await logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback((userData: User, tokens: AuthTokens) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem(StorageKey.USER, JSON.stringify(userData));
    localStorage.setItem(StorageKey.TOKENS, JSON.stringify(tokens));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(StorageKey.USER);
    localStorage.removeItem(StorageKey.TOKENS);
    await router.push('/login');
  }, [router]);

  const getAccessToken = useCallback((): string | null => {
    const tokens = localStorage.getItem(StorageKey.TOKENS);
    if (!tokens) return null;

    const parsedTokens: AuthTokens = JSON.parse(tokens);
    return memoizedTokenValidation(parsedTokens.access) ? parsedTokens.access : null;
  }, []);

  const contextValue = useMemo(() => ({
    user,
    login,
    logout,
    isAuthenticated,
    getAccessToken,
    isLoading,
    onSignAndVerifyMessage
  }), [user, login, logout, isAuthenticated, getAccessToken, isLoading, onSignAndVerifyMessage]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 