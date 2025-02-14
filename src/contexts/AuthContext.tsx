'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'

interface User {
  id: string
  email: string
  phone: string | null
  first_name: string
  last_name: string
  is_verified: boolean
  avatar: string | null
  bio: string | null
  preferences: any
  notification_settings: any
  instagram_handle: string | null
  twitter_handle: string | null
  linkedin_handle: string | null
  tiktok_handle: string | null
  youtube_handle: string | null
  website: string | null
}

interface AuthContextType {
  user: User | null
  login: (userData: User, tokens: { access: string; refresh: string }) => void
  logout: () => void
  isAuthenticated: boolean
  getAccessToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token)
    const timeLeft = decoded.exp ? decoded.exp * 1000 - Date.now() : 0
    
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      const minutes = Math.floor(timeLeft / 60000)
      const seconds = Math.floor((timeLeft % 60000) / 1000)
      console.log(`Token expires in: ${minutes}m ${seconds}s`)
      console.log('Token decoded:', decoded)
    }
    
    return decoded.exp ? decoded.exp * 1000 > Date.now() : false
  } catch {
    return false
  }
}

// Add storage key constants at the top level
const STORAGE_KEYS = {
  USER: 'SS_USER_DATA',
  TOKENS: 'SS_AUTH_TOKENS'
} as const

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
    const tokens = localStorage.getItem(STORAGE_KEYS.TOKENS)
    
    if (storedUser && tokens) {
      const parsedTokens = JSON.parse(tokens)
      if (process.env.NODE_ENV === 'development') {
        console.log('Checking stored tokens:', parsedTokens)
      }
      if (isTokenValid(parsedTokens.access)) {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('Token invalid or expired, logging out')
        }
        logout()
      }
    }
  }, [])

  const login = (userData: User, tokens: { access: string; refresh: string }) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens))
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.TOKENS)
    router.push('/')
  }

  const getAccessToken = () => {
    const tokens = localStorage.getItem(STORAGE_KEYS.TOKENS)
    if (tokens) {
      const parsedTokens = JSON.parse(tokens)
      return isTokenValid(parsedTokens.access) ? parsedTokens.access : null
    }
    return null
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 