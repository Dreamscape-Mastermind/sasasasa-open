'use client'

import { useEffect } from 'react'
import { useSidebar } from '@/components/providers/SidebarContext'
import { X } from 'lucide-react'
import Cart from './Cart'

export function Sidebar() {
  const { isOpen: isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar()

  useEffect(() => {
    if (isSidebarOpen) {
      // Disable scrolling on the body
      document.body.classList.add('overflow-hidden')
    } else {
      // Enable scrolling on the body
      document.body.classList.remove('overflow-hidden')
    }

    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isSidebarOpen])

  if (!isSidebarOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={closeSidebar}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-4/12 bg-white dark:bg-zinc-900 shadow-lg z-50 transform transition-transform">
        <div className="p-4">
          <button 
            onClick={closeSidebar}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Your sidebar content here */}
          <div className="mt-8">
            <Cart />
          </div>
        </div>
      </div>
    </>
  )
}