'use client'

import { motion } from 'framer-motion'
import { Instagram, Twitter, Linkedin, Youtube, Globe, LogOut, Edit } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function ProfileHeader({ user, logout }: { 
  user: any, 
  logout: () => void 
}) {
  const router = useRouter()
  
  const socialLinks = [
    { icon: Instagram, handle: user.instagram_handle, url: `https://instagram.com/${user.instagram_handle}` },
    { icon: Twitter, handle: user.twitter_handle, url: `https://twitter.com/${user.twitter_handle}` },
    { icon: Linkedin, handle: user.linkedin_handle, url: `https://linkedin.com/in/${user.linkedin_handle}` },
    { icon: Youtube, handle: user.youtube_handle, url: `https://youtube.com/@${user.youtube_handle}` },
    { icon: Globe, handle: user.website, url: user.website }
  ].filter(link => link.handle)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6"
    >
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-[#CC322D] to-[#a71712] rounded-t-lg" />
        <div className="absolute -bottom-16 left-8">
          {/* Avatar section */}
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
    </motion.div>
  )
} 