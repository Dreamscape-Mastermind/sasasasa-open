import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppKitAccount } from "@reown/appkit/react";

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  walletAddress?: string
  authType: 'web2' | 'web3'
}

interface Tokens {
  access: string
  refresh: string
}

interface AuthContextType {
  user: User | null
  login: (user: User, tokens: Tokens) => void
  loginWithWallet: (walletAddress: string) => void
  logout: () => void
  isAuthenticated: boolean
  refreshAccessToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<Tokens | null>(null)
  const router = useRouter()
  const { address, isConnected, embeddedWalletInfo } = useAppKitAccount()

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedTokens = localStorage.getItem('tokens')
    if (storedUser && storedTokens) {
      setUser(JSON.parse(storedUser))
      setTokens(JSON.parse(storedTokens))
    }
  }, [])

  // Monitor wallet connection status
  useEffect(() => {
    if (isConnected && address && !user) {
      // Auto-login with wallet if connected
      loginWithWallet(address)
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

  const login = (newUser: User, newTokens: Tokens) => {
    const userWithType = {
      ...newUser,
      authType: 'web2'
    }
    setUser(userWithType)
    setTokens(newTokens)
    localStorage.setItem('user', JSON.stringify(userWithType))
    localStorage.setItem('tokens', JSON.stringify(newTokens))
  }

  const loginWithWallet = (walletAddress: string) => {
    const walletUser: User = {
      id: walletAddress,
      email: embeddedWalletInfo?.user?.email || '',
      walletAddress,
      authType: 'web3'
    }
    setUser(walletUser)
    localStorage.setItem('user', JSON.stringify(walletUser))
  }

  const logout = () => {
    setUser(null)
    setTokens(null)
    localStorage.removeItem('user')
    localStorage.removeItem('tokens')
    router.push('/')
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
        const data = await response.json()
        const newTokens = {
          access: data.access,
          refresh: tokens.refresh, // Keep existing refresh token
        }
        setTokens(newTokens)
        localStorage.setItem('tokens', JSON.stringify(newTokens))
      } else {
        // If refresh fails, log out user
        logout()
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithWallet,
      logout,
      isAuthenticated: !!user,
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