'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppKitAccount, useAppKitNetworkCore, useAppKitProvider, useDisconnect} from "@reown/appkit/react";

import {
  BrowserProvider,
  Eip1193Provider,
  JsonRpcSigner,
  formatEther,
  parseUnits,
} from "ethers";
import { Provider } from '@radix-ui/react-tooltip';
import { 
  AuthTokens, 
  StorageKey, 
  User, 
  Web3AuthResponse, 
  NonceResponse,
  WalletLinkResponse,
  TokenRefreshResponse 
} from '@/utils/dataStructures';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';


interface AuthContextType {
  user: User | null
  login: (user: User, tokens: AuthTokens) => void
  loginWithWallet: (walletAddress: string) => void
  loginWithSIWEReCap: (address: `0x${string}`, capabilities?: Record<string, any>) => Promise<boolean>
  linkWallet: (address: `0x${string}`) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  getAccessToken: () => string | null
  isLoading: boolean
  refreshAccessToken: () => Promise<void>
}

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

// TODO merge with Alpha's route changes
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



const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // TODO store in cookies for better security and performance
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter()
  const { address, isConnected, embeddedWalletInfo } = useAppKitAccount()
  // AppKit hook to get the chain id
  const { chainId } = useAppKitNetworkCore();
  // AppKit hook to get the wallet provider
  const { walletProvider } = useAppKitProvider("eip155");
  
  const { disconnect } = useDisconnect();

  const handleSignMsg = async (message: any, address: string) => {

    // create the provider and signer
    const provider = new BrowserProvider(walletProvider as Eip1193Provider, chainId);
    const signer = new JsonRpcSigner(provider, address as string);
    // sign the message

    const signature = await signer?.signMessage(message);
    

    return signature
  };

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

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(StorageKey.USER)
    const storedTokens = localStorage.getItem(StorageKey.TOKENS)
    
    if (storedUser ) {
      setUser(JSON.parse(storedUser))
    }
    if (storedTokens) {
      setTokens(JSON.parse(storedTokens))
    }
  }, [])

  // Monitor wallet connection status
  useEffect(() => {
    if (isConnected && address && !user) {
      // Auto-login with wallet if connected
      // loginWithWallet(address)
    } else if (!isConnected && user?.authType === 'web3') {
      // Logout if wallet disconnected
      logout()
    }
  }, [isConnected, address])

  // Set up token refresh interval
  useEffect(() => {
    if (tokens?.access) {
      const refreshInterval = setInterval(() => {
        refreshAccessToken()
      }, 50 * 60 * 1000) // Refresh 10 minutes before expiry (assuming 1-hour tokens)
      
      return () => clearInterval(refreshInterval)
    }
  }, [tokens])

  const login = (newUser: User, newTokens: AuthTokens) => {
    const userWithType = {
      ...newUser,
      authType: 'web2' as const
    }
    setUser(userWithType)
    setTokens(newTokens)
    localStorage.setItem(StorageKey.USER, JSON.stringify(userWithType))
    localStorage.setItem(StorageKey.TOKENS, JSON.stringify(newTokens))
  }



  const logout = async () => {
    if (tokens) {
      await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/accounts/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({
          refresh: tokens.refresh,
        }),
      })
    }

    
    setUser(null)
    setTokens(null)
    localStorage.removeItem(StorageKey.USER)
    localStorage.removeItem(StorageKey.TOKENS)
    disconnect()
    router.push('/')
  }

  const getAccessToken = useCallback((): string | null => {
    const tokens = localStorage.getItem(StorageKey.TOKENS);
    if (!tokens) return null;

    const parsedTokens: AuthTokens = JSON.parse(tokens);
    return memoizedTokenValidation(parsedTokens.access) ? parsedTokens.access : null;
  }, []);

  // TODO create a SIWE login endpoint
  const loginWithSIWE = async (address: `0x${string}`) => {
    // get nonce from server
    const res = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/web3/nonce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
      }),
    })

    const result = await res.json() as NonceResponse;
    const message_data = result.result.message_data;
    const message = result.result.message;

    // sign message with wallet and nonce
    const signature = await handleSignMsg(message as any, address);
    // send message, signature, and nonce to server
    // server verifies signature
    // server returns tokens
    // store tokens
    // set user
    const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/web3/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message_data: message_data,
        signature,
      }),
    })

    
    const resVerify = await response.json() as Web3AuthResponse;

    if (response.ok) {
      const newTokens = {
        access: resVerify.result.tokens.access,
        refresh: resVerify.result.tokens.refresh,
      }
      setTokens(newTokens)
      localStorage.setItem(StorageKey.TOKENS, JSON.stringify(newTokens))
      toast.success('Signed in via Wallet')
      router.push('/dashboard')
    } else {
      console.error('Failed to sign in via SIWE')
      console.error(response)
      throw new Error('Failed to sign in via SIWE')
    }


    return {signature, message_data: message_data, response: resVerify}
  }

  const loginWithWallet = async (walletAddress: `0x${string}`) => {
    if (!walletAddress || !(walletAddress === address) || !isConnected) {
      throw new Error("Wallet address is required");
    }

    const res = (await loginWithSIWE(walletAddress))
      .response as unknown as Web3AuthResponse;

    // Create user object
    const walletUser: User = {
      id: res.result.user.id || address,
      email: res.result.user.email || embeddedWalletInfo?.user?.email || "",
      walletAddress: address as `0x${string}`,
      authType: "web3",
      is_verified: res.result.user.is_verified,
      first_name: res.result.user.first_name || "",
      last_name: res.result.user.last_name || "",
      bio: res.result.user.bio || "",
      avatar: res.result.user.avatar || "",
      is_active: res.result.user.is_active !== false, // Default to true if not provided
      last_online_at: res.result.user.last_online_at || null,
      // Social media handles if available
      social: {
        instagram: res.result.user.instagram_handle || "",
        twitter: res.result.user.twitter_handle || "",
        linkedin: res.result.user.linkedin_handle || "",
        website: res.result.user.website || "",
      },
    };

    setUser(walletUser);
    localStorage.setItem(StorageKey.USER, JSON.stringify(walletUser));
  }

  

  const refreshAccessToken = async () => {
    if (!tokens?.refresh) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/accounts/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: tokens.refresh,
        }),
      })

      if (response.ok) {
        const data = await response.json() as TokenRefreshResponse;
        const newTokens = {
          access: data.result.access,
          refresh: tokens.refresh, // Keep existing refresh token
        }
        setTokens(newTokens)
        localStorage.setItem(StorageKey.TOKENS, JSON.stringify(newTokens))
      } else {
        // If refresh fails, log out user
        logout()
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    }
  }

  // For ReCap authentication
  const loginWithSIWEReCap = async (address: `0x${string}`, capabilities?: Record<string, any>) => {
    try {
      // Get nonce from server with capabilities
      const res = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/web3/recap_nonce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          capabilities: capabilities || {},
        }),
      });

      const result = await res.json() as NonceResponse;
      if (!result.result) {
        throw new Error('Failed to get nonce');
      }
      
      const message_data = result.result.message_data;
      const message = result.result.message;
      const recap_data = result.result.recap_data;

      // Sign message with wallet
      const signature = await handleSignMsg(message as any, address);
      
      // Verify signed message with server
      const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/web3/verify_recap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_data: message_data,
          signature,
          recap_data,
        }),
      });

      if (response.ok) {
        const res = await response.json() as Web3AuthResponse;
        const newTokens = {
          access: res.result.tokens.access,
          refresh: res.result.tokens.refresh,
        };
        
        // Store tokens
        setTokens(newTokens);
        localStorage.setItem(StorageKey.TOKENS, JSON.stringify(newTokens));
        
        // Create user object
        const walletUser: User = {
          id: res.result.user.id || address,
          email: res.result.user.email || embeddedWalletInfo?.user?.email || '',
          walletAddress: address as `0x${string}`,
          authType: 'web3',
          is_verified: res.result.user.is_verified,
          first_name: res.result.user.first_name || '',
          last_name: res.result.user.last_name || '',
          bio: res.result.user.bio || '',
          avatar: res.result.user.avatar || '',
          is_active: res.result.user.is_active !== false, // Default to true if not provided
          last_online_at: res.result.user.last_online_at || null,
          // Social media handles if available
          social: {
            instagram: res.result.user.instagram_handle || '',
            twitter: res.result.user.twitter_handle || '',
            linkedin: res.result.user.linkedin_handle || '',
            website: res.result.user.website || '',
          },
          // Store capabilities if using ReCap
          capabilities: res.result.capabilities || {}
        };
        setUser(walletUser);
        localStorage.setItem(StorageKey.USER, JSON.stringify(walletUser));
        
        // Check if we need to proceed to email verification
        if (res.result.requires_email) {
          router.push('/dashboard/settings/?tab=account&action=link-email');
        } else {
          toast.success('Signed in via Wallet');
          router.push('/dashboard');
        }
        
        return true;
      } else {
        console.error('Failed to sign in via SIWE with ReCap');
        toast.error('Failed to authenticate wallet');
        return false;
      }
    } catch (error) {
      console.error('SIWE with ReCap error:', error);
      toast.error('Authentication failed');
      return false;
    }
  };

  // Method to link wallet to existing account
  const linkWallet = async (address: `0x${string}`) => {
    try {
      // User must be logged in first to link wallet
      if (!user || !getAccessToken()) {
        toast.error('You must be logged in to link a wallet');
        return false;
      }
      
      // Request linking nonce
      const res = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/web3/link_wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({
          address,
          chain_id: chainId
        }),
      });
      
      const result = await res.json() as WalletLinkResponse;
      if (!result.result) {
        toast.error(result.message || 'Failed to generate linking request');
        return false;
      }
      
      const message_data = result.result.message_data;
      const message = result.result.message;
      
      // Sign message with wallet
      const signature = await handleSignMsg(message as any, address);
      
      // Verify signature and complete linking
      const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/web3/verify_link_wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({
          message_data,
          signature,
        }),
      });
      
      if (verifyRes.ok) {
        toast.success('Wallet linked successfully');
        return true;
      } else {
        const error = await verifyRes.json();
        toast.error(error.message || 'Failed to link wallet');
        return false;
      }
    } catch (error) {
      console.error('Wallet linking error:', error);
      toast.error('Failed to link wallet');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithWallet,
      loginWithSIWEReCap,
      linkWallet,
      logout,
      isAuthenticated: !!user,
      getAccessToken,
      isLoading,
      refreshAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 