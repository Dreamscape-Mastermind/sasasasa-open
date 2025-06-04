"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Calendar, Clock, Shield, Tag, Ticket, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TicketCardProps {
  id: string
  eventName: string
  date: string
  time: string
  venue: string
  price: number
  section: string
  row: string
  seat: string
  isBlockchainVerified: boolean
  transferLimit: number
  transfersUsed: number
  tokenId?: string
}

export default function TicketCard({
  id = "T-12345",
  eventName = "Future Music Festival",
  date = "March 15, 2025",
  time = "8:00 PM",
  venue = "Tech Arena",
  price = 150,
  section = "A",
  row = "10",
  seat = "15",
  isBlockchainVerified = true,
  transferLimit = 2,
  transfersUsed = 1,
  tokenId = "0x7a69...4e21",
}: TicketCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <TooltipProvider>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-auto"
      >
        <Card
          className={`overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-100 transition-all duration-300 ${
            expanded ? "shadow-lg shadow-cyan-900/20" : "shadow-md hover:shadow-cyan-900/10"
          }`}
        >
          <CardContent className="p-0">
            {/* Header with blockchain verification */}
            <div className="relative p-4 pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">{eventName}</h3>
                {isBlockchainVerified && <BlockchainBadge tokenId={tokenId} />}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-mono bg-slate-800/70 px-2 py-0.5 rounded-full"
                >
                  ID: {id}
                </motion.span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>{date}</span>
                <span className="text-slate-600">•</span>
                <Clock className="h-3.5 w-3.5" />
                <span>{time}</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{venue}</p>
            </div>

            {/* Main ticket info */}
            <div className="flex items-center justify-between p-4 pt-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Section</span>
                  <span className="font-medium">{section}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Row</span>
                  <span className="font-medium">{row}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Seat</span>
                  <span className="font-medium">{seat}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-500">Price</span>
                <span className="text-lg font-semibold text-white">${price}</span>
              </div>
            </div>

            {/* Blockchain features preview */}
            <div className="p-4 pt-3 flex items-center justify-between">
              <TransferLimitIndicator limit={transferLimit} used={transfersUsed} />

              <Button
                variant="ghost"
                size="sm"
                className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/50 p-0 h-8 px-3 rounded-full"
                onClick={() => setExpanded(!expanded)}
              >
                <span className="mr-1">{expanded ? "Less" : "Details"}</span>
                <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </Button>
            </div>

            {/* Expandable details */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-slate-800 bg-slate-900/50"
                >
                  <TicketDetails
                    tokenId={tokenId}
                    isBlockchainVerified={isBlockchainVerified}
                    transferLimit={transferLimit}
                    transfersUsed={transfersUsed}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}

function BlockchainBadge({ tokenId }: { tokenId?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-cyan-500/20 blur-sm"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          />
          <Badge
            variant="outline"
            className="relative border-cyan-500/50 text-cyan-400 px-2 py-0.5 h-6 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div
              className="absolute inset-0 bg-cyan-500/10 rounded-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
            />
            <Ticket className="h-3 w-3 mr-1" />
            <span className="text-xs">Verified</span>
          </Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-slate-900 border-slate-800 text-slate-200">
        <p className="text-xs">Blockchain Verified Ticket</p>
        {tokenId && <p className="text-xs text-slate-400 mt-1">Token: {tokenId}</p>}
      </TooltipContent>
    </Tooltip>
  )
}

function TransferLimitIndicator({ limit, used }: { limit: number; used: number }) {
  const remaining = limit - used
  const percentage = (used / limit) * 100

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-cyan-500" />
          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          <span className="text-xs text-slate-400">
            {remaining}/{limit}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-slate-900 border-slate-800 text-slate-200">
        <p className="text-xs">Transfer Protection</p>
        <p className="text-xs text-slate-400 mt-1">{remaining} transfers remaining</p>
      </TooltipContent>
    </Tooltip>
  )
}

function TicketDetails({
  tokenId,
  isBlockchainVerified,
  transferLimit,
  transfersUsed,
}: {
  tokenId?: string
  isBlockchainVerified: boolean
  transferLimit: number
  transfersUsed: number
}) {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <h4 className="text-xs uppercase text-slate-500 flex items-center gap-1">
            <Shield className="h-3.5 w-3.5" /> Scalp Protection
          </h4>
          <div className="bg-slate-800/50 rounded-md p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">Transfer Limit</span>
              <span className="text-sm font-medium">{transferLimit}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Transfers Used</span>
              <span className="text-sm font-medium">{transfersUsed}</span>
            </div>
            <div className="mt-3 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${(transfersUsed / transferLimit) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="text-xs uppercase text-slate-500 flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" /> Blockchain Details
          </h4>
          <div className="bg-slate-800/50 rounded-md p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">Status</span>
              <Badge
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 px-2 py-0 h-5 text-xs bg-slate-900/80"
              >
                {isBlockchainVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            {tokenId && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Token ID</span>
                <span className="text-xs font-mono">{tokenId}</span>
              </div>
            )}
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs text-slate-400">Network</span>
              <span className="text-xs">Ethereum</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-xs uppercase text-slate-500 flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> Ownership History
        </h4>
        <div className="bg-slate-800/50 rounded-md p-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                <span className="text-xs">Current Owner</span>
              </div>
              <span className="text-xs font-mono">0x71...3e4f</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                <span className="text-xs text-slate-400">Previous Transfer</span>
              </div>
              <span className="text-xs font-mono text-slate-400">0x8a...2c1d</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                <span className="text-xs text-slate-400">Original Mint</span>
              </div>
              <span className="text-xs font-mono text-slate-400">0xf5...9a7b</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 space-y-2">
        <Button
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 rounded-full"
          onClick={() => window.open(`https://etherscan.io/token/${tokenId}`, "_blank")}
        >
          View on Blockchain
        </Button>

        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs border-slate-700 text-slate-300 hover:bg-slate-800 rounded-full"
            onClick={() => window.open(`https://opensea.io/assets/ethereum/${tokenId}`, "_blank")}
          >
            View on OpenSea
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs border-slate-700 text-slate-300 hover:bg-slate-800 rounded-full"
            onClick={() => window.open(`https://rarible.com/token/ethereum/${tokenId}`, "_blank")}
          >
            View on Rarible
          </Button>
        </div>
      </div>
    </div>
  )
}

