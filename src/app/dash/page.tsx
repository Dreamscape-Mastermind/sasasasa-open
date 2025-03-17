'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Globe,
  LogOut,
  Edit,
} from 'lucide-react'
import { Tabs } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/ShadCard"
import Link from 'next/link'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const OrdersContent = () => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Orders</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {/* Placeholder for orders - will be replaced with real data */}
        <p className="text-muted-foreground">No orders found.</p>
      </div>
    </CardContent>
  </Card>
)

const ProfileContent = () => (
  <Card>
    <CardHeader>
      <CardTitle>Profile Details</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {/* Profile details will go here */}
        <p className="text-muted-foreground">Profile information will be displayed here.</p>
      </div>
    </CardContent>
  </Card>
)

const SettingsContent = () => (
  <Card>
    <CardHeader>
      <CardTitle>Account Settings</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {/* Settings will go here */}
        <p className="text-muted-foreground">Account settings will be displayed here.</p>
      </div>
    </CardContent>
  </Card>
)

export default function Dashboard() {
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (!user) return null

  const socialLinks = [
    { icon: Instagram, handle: user.instagram_handle, url: `https://instagram.com/${user.instagram_handle}` },
    { icon: Twitter, handle: user.twitter_handle, url: `https://twitter.com/${user.twitter_handle}` },
    { icon: Linkedin, handle: user.linkedin_handle, url: `https://linkedin.com/in/${user.linkedin_handle}` },
    { icon: Youtube, handle: user.youtube_handle, url: `https://youtube.com/@${user.youtube_handle}` },
    { icon: Globe, handle: user.website, url: user.website }
  ].filter(link => link.handle)

  const tabs = [
    {
      title: "Orders",
      value: "orders",
      content: <OrdersContent />
    },
    {
      title: "Profile",
      value: "profile",
      content: <ProfileContent />
    },
    {
      title: "Settings",
      value: "settings",
      content: <SettingsContent />
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <motion.div 
        className="max-w-6xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-[#CC322D] to-[#a71712] rounded-t-lg" />
            <div className="absolute -bottom-16 left-8">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 bg-gray-100">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={`${user.first_name}'s avatar`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <span className="text-3xl font-bold text-gray-500">
                      {user.first_name[0]}{user.last_name[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute top-4 right-4 space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-800"
                onClick={() => router.push('/profile/edit')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white dark:bg-gray-800"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{user.email}</p>
            
            {user.bio && (
              <p className="mt-4 text-gray-700 dark:text-gray-200">
                {user.bio}
              </p>
            )}

            {socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-4">
                {socialLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || ''}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-[#CC322D] dark:hover:text-[#CC322D] transition-colors"
                  >
                    <link.icon className="w-5 h-5 mr-2" />
                    <span>{link.handle}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* New Tabs Implementation */}
        <div className="mt-8">
          <Tabs 
            tabs={tabs}
            containerClassName="mb-8"
            tabClassName="font-medium"
            activeTabClassName="bg-white dark:bg-gray-800"
            contentClassName="mt-6"
          />
        </div>
      </motion.div>
    </div>
  )
} 