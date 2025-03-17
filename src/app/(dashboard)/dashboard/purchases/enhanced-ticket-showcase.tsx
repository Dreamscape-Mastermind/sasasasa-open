"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import EnhancedTicketCard from "./enhanced-ticket-card"

const tickets = [
  {
    id: "T-12345",
    eventName: "Future Music Festival",
    date: "March 15, 2025",
    time: "8:00 PM",
    venue: "Tech Arena",
    price: 150,
    section: "A",
    row: "10",
    seat: "15",
    isBlockchainVerified: true,
    transferLimit: 2,
    transfersUsed: 1,
    tokenId: "0x7a69...4e21",
    images: [
      "/placeholder.svg?height=200&width=400&text=Music+Festival+1",
      "/placeholder.svg?height=200&width=400&text=Music+Festival+2",
      "/placeholder.svg?height=200&width=400&text=Music+Festival+3",
    ],
  },
  {
    id: "T-67890",
    eventName: "Digital Art Exhibition",
    date: "April 22, 2025",
    time: "6:30 PM",
    venue: "Nexus Gallery",
    price: 85,
    section: "B",
    row: "5",
    seat: "8",
    isBlockchainVerified: true,
    transferLimit: 3,
    transfersUsed: 0,
    tokenId: "0x3b42...9f78",
    images: [
      "/placeholder.svg?height=200&width=400&text=Digital+Art+1",
      "/placeholder.svg?height=200&width=400&text=Digital+Art+2",
      "/placeholder.svg?height=200&width=400&text=Digital+Art+3",
    ],
  },
  {
    id: "T-24680",
    eventName: "Blockchain Summit",
    date: "May 10, 2025",
    time: "9:00 AM",
    venue: "Innovation Center",
    price: 250,
    section: "VIP",
    row: "2",
    seat: "4",
    isBlockchainVerified: true,
    transferLimit: 1,
    transfersUsed: 1,
    tokenId: "0x5d31...2c9a",
    images: [
      "/placeholder.svg?height=200&width=400&text=Blockchain+Summit+1",
      "/placeholder.svg?height=200&width=400&text=Blockchain+Summit+2",
      "/placeholder.svg?height=200&width=400&text=Blockchain+Summit+3",
    ],
  },
]

export default function EnhancedTicketShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const nextTicket = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % tickets.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const prevTicket = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + tickets.length) % tickets.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-primary">
                Blockchain-Verified Tickets
              </span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Secure, transferable digital tickets with anti-scalping protection
            </p>
          </motion.div>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevTicket}
              className="rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-muted h-10 w-10"
              disabled={isAnimating}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <EnhancedTicketCard {...tickets[currentIndex]} />
            </motion.div>
          </AnimatePresence>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={nextTicket}
              className="rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-muted h-10 w-10"
              disabled={isAnimating}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex justify-center mt-6 gap-1.5">
          {tickets.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true)
                  setCurrentIndex(index)
                  setTimeout(() => setIsAnimating(false), 500)
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-muted hover:bg-muted/80"
              }`}
              aria-label={`View ticket ${index + 1}`}
              disabled={isAnimating}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

