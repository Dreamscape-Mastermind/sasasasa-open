'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import EnhancedTicketCard from '../purchases/enhanced-ticket-card'
import EnhancedTicketShowcase from '../purchases/enhanced-ticket-showcase'
import { motion } from 'framer-motion'
import { Ticket } from '@/utils/dataStructures'

export default function TicketsPage() {
  const { user, getAccessToken } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'showcase'>('grid')

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        const accessToken = getAccessToken()
        
        if (!accessToken) {
          throw new Error('Not authenticated')
        }

        // TODO: Implement API call to fetch tickets
        // This will be implemented once the API endpoint is available
        // For now, using mock data
        const mockTickets: Ticket[] = [
          {
            id: "T-12345",
            event_id: "E-001",
            user_id: "U-001",
            ticket_type: "VIP",
            status: "valid",
            purchase_date: "2024-03-14",
            price: 150,
            eventName: "Future Music Festival",
            date: "March 15, 2025",
            time: "8:00 PM",
            venue: "Tech Arena",
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
            name: "Future Music Festival",
            quantity: 1,
            remaining_tickets: 1,
            sale_start_date: "2024-03-14",
            sale_end_date: "2024-03-15",
            event: "E-001",
            is_active: true,
            flash_sale: null,
            created_at: "2024-03-14",
          },
          // Add more mock tickets as needed
        ]
        
        setTickets(mockTickets)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tickets')
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-cyan-400">Loading your tickets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              My Tickets
            </span>
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('showcase')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'showcase'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Showcase
            </button>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No tickets found</p>
          </div>
        ) : viewMode === 'showcase' ? (
          <div className="flex justify-center">
            <EnhancedTicketShowcase />
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {tickets.map((ticket) => (
              <EnhancedTicketCard
                key={ticket.id}
                {...ticket}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
} 