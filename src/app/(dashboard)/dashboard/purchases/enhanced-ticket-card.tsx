"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  QrCode,
  Shield,
  Sparkles,
  Tag,
  Ticket as TicketIcon,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TicketMediaCarousel from "./ticket-media-carousel";

interface TicketCardProps {
  id: string;
  eventName: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  section: string;
  row: string;
  seat: string;
  isBlockchainVerified: boolean;
  transferLimit: number;
  transfersUsed: number;
  tokenId?: string;
  qrCode?: string | null;
  paymentStatus?: string;
  paymentReference?: string;
  images?: string[];
}

export default function EnhancedTicketCard({
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
  qrCode = null,
  paymentStatus = "COMPLETED",
  paymentReference = "",
  images = [
    "/placeholder.svg?height=200&width=400&text=Event+Image+1",
    "/placeholder.svg?height=200&width=400&text=Event+Image+2",
    "/placeholder.svg?height=200&width=400&text=Event+Image+3",
  ],
}: TicketCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Micro-animation for ticket ID
  const [ticketIdPulse, setTicketIdPulse] = useState(false);

  useEffect(() => {
    // Pulse the ticket ID every 30 seconds
    const interval = setInterval(() => {
      setTicketIdPulse(true);
      setTimeout(() => setTicketIdPulse(false), 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full min-w-[350px]"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Card
          className={`overflow-hidden border border-border bg-background text-foreground transition-all duration-300 ${
            expanded
              ? "shadow-lg shadow-primary/20"
              : "shadow-md hover:shadow-primary/10"
          }`}
        >
          <CardContent className="p-0 flex flex-col min-h-[600px]">
            {/* Media Carousel */}
            <div className="h-[200px] sm:h-[250px] flex-shrink-0 bg-background">
              <TicketMediaCarousel images={images} />
            </div>

            {/* Main content wrapper with fixed height */}
            <div className="h-[340px] sm:h-[300px] flex flex-col">
              {/* Header with blockchain verification */}
              <div className="relative p-4 pb-2 sm:p-6 sm:pb-3 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-base sm:text-xl font-medium text-foreground line-clamp-1">
                    {eventName}
                  </h3>
                  {isBlockchainVerified && (
                    <BlockchainBadge tokenId={tokenId} />
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      scale: ticketIdPulse ? 1.05 : 1,
                      backgroundColor: ticketIdPulse
                        ? "var(--primary)"
                        : "var(--muted)",
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-sm font-mono bg-muted text-foreground px-2 py-1 rounded-full"
                  >
                    ID: {id}
                  </motion.span>
                </div>

                <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="line-clamp-1">{date}</span>
                  <span className="text-muted">•</span>
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="line-clamp-1">{time}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                  {venue}
                </p>
              </div>

              {/* Main ticket info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 pt-2 pb-4 border-b border-slate-800 gap-4 flex-shrink-0">
                <div className="grid grid-cols-3 sm:flex sm:items-center gap-4 sm:gap-8">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Section
                    </span>
                    <span className="text-base sm:text-lg font-medium text-foreground">
                      {section}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Row</span>
                    <span className="text-base sm:text-lg font-medium text-foreground">
                      {row}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Seat</span>
                    <span className="text-base sm:text-lg font-medium text-foreground">
                      {seat}
                    </span>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                  <span className="text-xs text-muted-foreground">Price</span>
                  <span className="text-xl sm:text-2xl font-semibold text-foreground">
                    ${price}
                  </span>
                </div>
              </div>

              {/* Blockchain features preview */}
              <div className="p-6 sm:p-6 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto">
                <TransferLimitIndicator
                  limit={transferLimit}
                  used={transfersUsed}
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-initial text-primary2 border-border hover:bg-muted/50 rounded-full h-8 px-3"
                    onClick={() => setShowQrCode(!showQrCode)}
                  >
                    <QrCode className="h-3.5 w-3.5 mr-1" />
                    <span className="text-muted-foreground">
                      {showQrCode ? "Hide" : "QR"}
                    </span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 sm:flex-initial text-primary2 hover:text-primary hover:bg-muted/50 p-0 h-8 px-3 rounded-full"
                    onClick={() => setExpanded(!expanded)}
                  >
                    <span className="mr-1 text-muted-foreground">
                      {expanded ? "Less" : "Details"}
                    </span>
                    <motion.div
                      animate={{ rotate: expanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Expandable content */}
            <AnimatePresence>
              {(showQrCode || expanded) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-slate-800 mt-8"
                >
                  {showQrCode && (
                    <div className="bg-slate-900/50 flex justify-center py-4">
                      <div className="relative">
                        <motion.div
                          className="absolute inset-0 rounded-lg bg-primary/10"
                          animate={{
                            scale: [1, 1.02, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "loop",
                          }}
                        />
                        <div className="bg-white p-2 rounded-lg relative">
                          <img
                            src={
                              qrCode ||
                              `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${id}-${tokenId}`
                            }
                            alt="Ticket QR Code"
                            width={150}
                            height={150}
                            className="rounded"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {expanded && (
                    <div className="bg-background border-t border-muted">
                      <TicketDetails
                        tokenId={tokenId}
                        isBlockchainVerified={isBlockchainVerified}
                        transferLimit={transferLimit}
                        transfersUsed={transfersUsed}
                        paymentStatus={paymentStatus}
                        paymentReference={paymentReference}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}

function BlockchainBadge({ tokenId }: { tokenId?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative scale-90 sm:scale-100">
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-sm"
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
            className="relative border-primary/50 text-primary px-2 py-0.5 h-6 bg-background/80 backdrop-blur-sm rounded-full"
          >
            <motion.div
              className="absolute inset-0 bg-primary/10 rounded-full"
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
            <TicketIcon className="h-3 w-3 mr-1" />
            <span className="text-xs">Verified</span>
          </Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-background border-border text-foreground"
      >
        <p className="text-xs">Blockchain Verified Ticket</p>
        {tokenId && (
          <p className="text-xs text-muted-foreground mt-1">Token: {tokenId}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

function TransferLimitIndicator({
  limit,
  used,
}: {
  limit: number;
  used: number;
}) {
  const remaining = limit - used;
  const percentage = (used / limit) * 100;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full"
              style={{
                background:
                  "linear-gradient(to right, var(--primary) 0%, hsl(var(--primary)) 50%, var(--primary) 100%)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {remaining}/{limit}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-background border-border text-foreground"
      >
        <p className="text-xs">Transfer Protection</p>
        <p className="text-xs text-muted-foreground mt-1">
          {remaining} transfers remaining
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

function TicketDetails({
  tokenId,
  isBlockchainVerified,
  transferLimit,
  transfersUsed,
  paymentStatus,
  paymentReference,
}: {
  tokenId?: string;
  isBlockchainVerified: boolean;
  transferLimit: number;
  transfersUsed: number;
  paymentStatus?: string;
  paymentReference?: string;
}) {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <h4 className="text-xs uppercase text-primary flex items-center gap-1">
            <Shield className="h-3.5 w-3.5" /> Scalp Protection
          </h4>
          <div className="bg-muted/30 rounded-md p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">
                Transfer Limit
              </span>
              <span className="text-sm font-medium text-foreground">
                {transferLimit}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Transfers Used
              </span>
              <span className="text-sm font-medium text-foreground">
                {transfersUsed}
              </span>
            </div>
            <div className="mt-3 w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full"
                style={{
                  background:
                    "linear-gradient(to right, var(--primary) 0%, hsl(var(--primary)) 50%, var(--primary) 100%)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(transfersUsed / transferLimit) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="text-xs uppercase text-primary flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" /> Blockchain Details
          </h4>
          <div className="bg-muted/30 rounded-md p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">Status</span>
              <Badge
                variant="outline"
                className="border-primary/50 text-primary px-2 py-0 h-5 text-xs bg-background/80 rounded-full"
              >
                {isBlockchainVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            {tokenId && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Token ID</span>
                <motion.span
                  className="text-xs font-mono text-foreground"
                  whileHover={{
                    color: "var(--primary)",
                    x: 2,
                  }}
                >
                  {tokenId}
                </motion.span>
              </div>
            )}
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Network</span>
              <span className="text-xs text-foreground">Ethereum</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-xs uppercase text-primary flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> Ownership History
        </h4>
        <div className="bg-muted/30 rounded-md p-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span className="text-xs text-foreground">Current Owner</span>
              </div>
              <motion.span
                className="text-xs font-mono text-muted-foreground"
                whileHover={{
                  color: "var(--primary)",
                  x: 2,
                }}
              >
                0x71...3e4f
              </motion.span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                <span className="text-xs text-muted-foreground">
                  Previous Transfer
                </span>
              </div>
              <motion.span
                className="text-xs font-mono text-muted-foreground"
                whileHover={{
                  color: "var(--primary)",
                  x: 2,
                }}
              >
                0x8a...2c1d
              </motion.span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                <span className="text-xs text-muted-foreground">
                  Original Mint
                </span>
              </div>
              <motion.span
                className="text-xs font-mono text-muted-foreground"
                whileHover={{
                  color: "var(--primary)",
                  x: 2,
                }}
              >
                0x9f...7b2e
              </motion.span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 space-y-2">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-full flex items-center justify-center gap-1"
          onClick={() =>
            window.open(`https://etherscan.io/token/${tokenId}`, "_blank")
          }
        >
          <Sparkles className="h-4 w-4 mr-1" />
          View on Blockchain
          <ExternalLink className="h-3.5 w-3.5 ml-1" />
        </Button>

        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs border-border text-foreground hover:bg-muted/20 rounded-full"
            onClick={() =>
              window.open(
                `https://opensea.io/assets/ethereum/${tokenId}`,
                "_blank"
              )
            }
          >
            <span>OpenSea</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs border-border text-foreground hover:bg-muted/20 rounded-full"
            onClick={() =>
              window.open(
                `https://rarible.com/token/ethereum/${tokenId}`,
                "_blank"
              )
            }
          >
            <span>Rarible</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Payment Information */}
      {(paymentStatus || paymentReference) && (
        <div className="space-y-1">
          <h4 className="text-xs uppercase text-primary flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" /> Payment Details
          </h4>
          <div className="bg-muted/30 rounded-md p-3">
            {paymentStatus && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={`px-2 py-0 h-5 text-xs bg-background/80 rounded-full ${
                    paymentStatus === "COMPLETED"
                      ? "border-green-500/50 text-green-500"
                      : "border-yellow-500/50 text-yellow-500"
                  }`}
                >
                  {paymentStatus}
                </Badge>
              </div>
            )}
            {paymentReference && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Reference</span>
                <motion.span
                  className="text-xs font-mono text-foreground"
                  whileHover={{
                    color: "var(--primary)",
                    x: 2,
                  }}
                >
                  {paymentReference}
                </motion.span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
