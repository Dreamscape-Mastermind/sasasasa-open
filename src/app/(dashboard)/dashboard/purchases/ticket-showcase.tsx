"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import TicketCard from "./ticket-card"

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
  },
]

export default function TicketShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTicket = () => {
    setCurrentIndex((prev) => (prev + 1) % tickets.length)
  }

  const prevTicket = () => {
    setCurrentIndex((prev) => (prev - 1 + tickets.length) % tickets.length)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Blockchain-Verified
          </span>{" "}
          Tickets
        </h1>

        <div className="relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevTicket}
              className="rounded-full bg-slate-900/80 backdrop-blur-sm text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TicketCard {...tickets[currentIndex]} />
          </motion.div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={nextTicket}
              className="rounded-full bg-slate-900/80 backdrop-blur-sm text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex justify-center mt-6 gap-1.5">
          {tickets.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-cyan-500 w-4" : "bg-slate-700 hover:bg-slate-600"
              }`}
              aria-label={`View ticket ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

