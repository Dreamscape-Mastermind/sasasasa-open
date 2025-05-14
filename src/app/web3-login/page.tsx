// File: src/app/web3-login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from 'contexts/AuthContext'
import { useAppKitAccount } from '@reown/appkit/react'
import { Button } from '@/components/ui/button'
import { WalletAddress } from '@/components/ui/wallet-address'
import Image from 'next/image'
import { AppKit } from 'contexts/AppKit'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs2'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Web3Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'standard' | 'recap'>('standard')
  const { loginWithWallet, loginWithSIWEReCap } = useAuth()
  const { isConnected, address } = useAppKitAccount()

  // Default capabilities - customize as needed
  const defaultCapabilities = {
    'https://sasasasa.com/api': {
      'events': {
        'read': [{}],
        'create': [{ max_count: 10 }]
      },
      'tickets': {
        'purchase': [{ max_value: '1000' }]
      }
    }
  }

  const handleStandardLogin = async () => {
    if (!address || !isConnected) return
    
    setLoading(true)
    try {
      await loginWithWallet(address)
      // Router will be handled in loginWithWallet
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecapLogin = async () => {
    if (!address || !isConnected) return
    
    setLoading(true)
    try {
      await loginWithSIWEReCap(address as `0x${string}`, defaultCapabilities)
      // Router will be handled in loginWithSIWEReCap
    } catch (error) {
      console.error('ReCap login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/images/sasasasaLogo.png"
            alt="Sasasasa Logo"
            width={150}
            height={50}
            className="mx-auto mb-4"
          />
          <h2 className="mt-6 text-3xl font-bold">Web3 Login</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
            Connect your wallet to sign in
          </p>
          <div className="mt-2">
            <Link href="/login" className="inline-flex items-center text-blue-500 text-sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to email login
            </Link>
          </div>
        </div>

        {!isConnected ? (
          <div className='mt-8 flex justify-center'>
            <AppKit />
          </div>
        ) : (
          <>
            <div className="mt-4">
              <WalletAddress 
                address={address || ''} 
                showChainId={false}
                showIcon={true}
                size="md"
              />
            </div>
            
            <Tabs defaultValue="standard" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="standard"
                  onClick={() => setActiveTab('standard')}
                >
                  Standard Login
                </TabsTrigger>
                <TabsTrigger 
                  value="recap"
                  onClick={() => setActiveTab('recap')}
                >
                  Enhanced Login
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="standard" className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">
                  Sign in with your wallet to access your account.
                </p>
                <Button
                  className="w-full"
                  onClick={handleStandardLogin}
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In with Wallet'}
                </Button>
              </TabsContent>
              
              <TabsContent value="recap" className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">
                  Enhanced login with granular permissions for better security.
                </p>
                <Button
                  className="w-full"
                  onClick={handleRecapLogin}
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In with Enhanced Security'}
                </Button>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}