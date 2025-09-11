"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Ticket as TicketIcon,
  Download,
  Share2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Smartphone,
  Heart,
  Sparkles,
  Zap,
  Shield,
  Crown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { TicketStatus } from "@/types/ticket";
import Image from "next/image";

interface ModernTicketCardProps {
  id: string;
  eventName: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  section: string;
  row: string;
  seat: string;
  status: TicketStatus;
  qrCode?: string | null;
  paymentStatus?: string;
  paymentReference?: string;
  paymentMethod?: string;
  eventImage?: string;
  ticketNumber: string;
  isFavorite?: boolean;
  onFavorite?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  isSharing?: boolean;
}

export default function ModernTicketCard({
  id,
  eventName,
  date,
  time,
  venue,
  price,
  section,
  row,
  seat,
  status,
  qrCode,
  paymentStatus,
  paymentReference,
  paymentMethod,
  eventImage,
  ticketNumber,
  isFavorite = false,
  onFavorite,
  onShare,
  onDownload,
  isSharing = false,
}: ModernTicketCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Format date and time
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timeString;
    }
  };

  // Enhanced status styling with 3D effects
  const getStatusConfig = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.VALID:
        return {
          color: "bg-gradient-to-r from-emerald-500 to-green-500",
          textColor: "text-emerald-400",
          icon: Shield,
          label: "Valid",
          glow: "shadow-emerald-500/50",
          border: "border-emerald-400/30",
        };
      case TicketStatus.USED:
        return {
          color: "bg-gradient-to-r from-blue-500 to-cyan-500",
          textColor: "text-blue-400",
          icon: CheckCircle,
          label: "Used",
          glow: "shadow-blue-500/50",
          border: "border-blue-400/30",
        };
      case TicketStatus.INVALID:
        return {
          color: "bg-gradient-to-r from-red-500 to-rose-500",
          textColor: "text-red-400",
          icon: XCircle,
          label: "Invalid",
          glow: "shadow-red-500/50",
          border: "border-red-400/30",
        };
      case TicketStatus.CANCELLED:
        return {
          color: "bg-gradient-to-r from-gray-500 to-slate-500",
          textColor: "text-gray-400",
          icon: XCircle,
          label: "Cancelled",
          glow: "shadow-gray-500/50",
          border: "border-gray-400/30",
        };
      case TicketStatus.REFUNDED:
        return {
          color: "bg-gradient-to-r from-amber-500 to-orange-500",
          textColor: "text-amber-400",
          icon: AlertCircle,
          label: "Refunded",
          glow: "shadow-amber-500/50",
          border: "border-amber-400/30",
        };
      default:
        return {
          color: "bg-gradient-to-r from-gray-500 to-slate-500",
          textColor: "text-gray-400",
          icon: AlertCircle,
          label: "Unknown",
          glow: "shadow-gray-500/50",
          border: "border-gray-400/30",
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <TooltipProvider>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Card className="group overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-[1.02] hover:rotate-1 backdrop-blur-sm">
          {/* Event Image Header */}
          <div className="relative h-32 sm:h-40 overflow-hidden">
            {eventImage ? (
              <Image
                src={eventImage}
                alt={eventName}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center relative overflow-hidden">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotateY: [0, 180, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <TicketIcon className="w-12 h-12 text-white/80 drop-shadow-lg" />
                </motion.div>
                <motion.div
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-2 right-2"
                >
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </motion.div>
              </div>
            )}

            {/* Overlay with status and actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    className={`${statusConfig.color} ${statusConfig.glow} ${statusConfig.border} text-white border shadow-lg backdrop-blur-sm relative overflow-hidden`}
                  >
                    <motion.div
                      animate={{
                        x: [-100, 100],
                        opacity: [0, 0.3, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <StatusIcon className="w-3 h-3 mr-1 relative z-10" />
                    <span className="relative z-10 font-semibold">
                      {statusConfig.label}
                    </span>
                  </Badge>
                </motion.div>

                <div className="flex gap-2">
                  {onFavorite && (
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
                        onClick={onFavorite}
                      >
                        <motion.div
                          animate={
                            isFavorite
                              ? {
                                  scale: [1, 1.2, 1],
                                  rotate: [0, -10, 10, 0],
                                }
                              : {}
                          }
                          transition={{ duration: 0.5 }}
                        >
                          <Heart
                            className={`w-4 h-4 transition-all duration-300 ${
                              isFavorite
                                ? "fill-red-500 text-red-500 drop-shadow-lg"
                                : "text-white hover:text-red-400"
                            }`}
                          />
                        </motion.div>
                      </Button>
                    </motion.div>
                  )}
                  {onShare && (
                    <motion.div
                      whileHover={!isSharing ? { scale: 1.1, rotate: -5 } : {}}
                      whileTap={!isSharing ? { scale: 0.9 } : {}}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-8 w-8 p-0 backdrop-blur-sm transition-all duration-300 ${
                          isSharing
                            ? "bg-blue-500/30 cursor-not-allowed"
                            : "bg-white/20 hover:bg-white/30"
                        }`}
                        onClick={onShare}
                        disabled={isSharing}
                      >
                        <motion.div
                          animate={isSharing ? { rotate: 360 } : {}}
                          transition={
                            isSharing
                              ? {
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }
                              : {}
                          }
                        >
                          <Share2
                            className={`w-4 h-4 transition-colors duration-300 ${
                              isSharing
                                ? "text-blue-300"
                                : "text-white hover:text-blue-400"
                            }`}
                          />
                        </motion.div>
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-4 sm:p-6">
            {/* Event Title */}
            <div className="mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2">
                {eventName}
              </h3>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(time)}</span>
                </div>
              </div>
              {venue && (
                <div className="flex items-center gap-1 mt-1 text-sm text-white/80">
                  <MapPin className="w-4 h-4" />
                  <span>{venue}</span>
                </div>
              )}
            </div>

            {/* Ticket Details */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-3 h-3 text-yellow-400" />
                  <p className="text-xs text-white/60 uppercase tracking-wide">
                    Section
                  </p>
                </div>
                <p className="text-sm font-semibold text-white">{section}</p>
              </motion.div>
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TicketIcon className="w-3 h-3 text-blue-400" />
                  <p className="text-xs text-white/60 uppercase tracking-wide">
                    Ticket #
                  </p>
                </div>
                <p className="text-sm font-semibold text-white font-mono">
                  {ticketNumber}
                </p>
              </motion.div>
            </div>

            {/* Price and Payment Info */}
            <div className="flex justify-between items-center mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <p className="text-xs text-white/60 uppercase tracking-wide">
                    Price
                  </p>
                </div>
                <motion.p
                  className="text-xl font-bold text-white"
                  animate={{
                    textShadow: [
                      "0 0 0px rgba(255,255,255,0)",
                      "0 0 10px rgba(255,255,255,0.3)",
                      "0 0 0px rgba(255,255,255,0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  KES {price.toLocaleString()}
                </motion.p>
              </motion.div>
              {paymentStatus && (
                <motion.div
                  className="text-right"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3 h-3 text-green-400" />
                    <p className="text-xs text-white/60 uppercase tracking-wide">
                      Payment
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {paymentMethod === "MOBILE_MONEY" ? (
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Smartphone className="w-4 h-4 text-green-400" />
                      </motion.div>
                    ) : (
                      <CreditCard className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="text-sm font-semibold text-green-400">
                      {paymentStatus}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-gradient-to-r from-white/10 to-white/5 border-white/20 text-white hover:from-white/20 hover:to-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                  </motion.div>
                  {isExpanded ? "Hide" : "View"} Details
                </Button>
              </motion.div>

              {qrCode && (
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-white hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-400/50 transition-all duration-300 backdrop-blur-sm"
                    onClick={() => setShowQR(!showQR)}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <QrCode className="w-4 h-4" />
                    </motion.div>
                  </Button>
                </motion.div>
              )}

              {onDownload && (
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30 text-white hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400/50 transition-all duration-300 backdrop-blur-sm"
                    onClick={onDownload}
                  >
                    <motion.div
                      animate={{ y: [0, -2, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </motion.div>
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-white/20"
                >
                  <div className="space-y-3">
                    {/* Payment Reference */}
                    {paymentReference && (
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/60 uppercase tracking-wide mb-1">
                          Payment Reference
                        </p>
                        <p className="text-sm font-mono text-white/90">
                          {paymentReference}
                        </p>
                      </div>
                    )}

                    {/* Ticket ID */}
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-white/60 uppercase tracking-wide mb-1">
                        Ticket ID
                      </p>
                      <p className="text-sm font-mono text-white/90">{id}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* QR Code Modal */}
            <AnimatePresence>
              {showQR && qrCode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setShowQR(false)}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-white rounded-2xl p-6 max-w-sm w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Your Ticket QR Code
                      </h3>
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                        <Image
                          src={qrCode}
                          alt="Ticket QR Code"
                          width={200}
                          height={200}
                          className="mx-auto"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Show this QR code at the event entrance
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setShowQR(false)}
                        className="w-full"
                      >
                        Close
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}
