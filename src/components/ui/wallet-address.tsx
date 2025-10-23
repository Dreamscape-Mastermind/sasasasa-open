"use client";

import { Check, Copy, Wallet, Crown, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

interface WalletAddressProps {
  address: string;
  isVerified?: boolean;
  isPrimary?: boolean;
  chainId?: number;
  showChainId?: boolean;
  showCopy?: boolean;
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function WalletAddress({
  address,
  isVerified = false,
  isPrimary = false,
  chainId,
  showChainId = false,
  showCopy = true,
  showIcon = true,
  className,
  size = "md",
}: WalletAddressProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedAddress = `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;

  const containerSizes = {
    sm: "text-sm py-1 px-2",
    md: "text-base py-2 px-3",
    lg: "text-lg py-3 px-4",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "group relative rounded-xl border bg-background/50 backdrop-blur-sm transition-all duration-200 hover:bg-background/80 hover:border-border/60",
          containerSizes[size],
          className
        )}
      >
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {showIcon && (
              <div className="flex-shrink-0">
                <Wallet className={cn(iconSizes[size], "text-muted-foreground")} />
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium truncate">
                  {truncatedAddress}
                </span>
                <div className="flex items-center gap-1">
                  {isPrimary && (
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div 
                          className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 cursor-help touch-manipulation"
                          role="img"
                          aria-label="Primary wallet indicator"
                        >
                          <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 font-medium">Primary Wallet</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">This is your main wallet for transactions</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {isVerified && (
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div 
                          className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 cursor-help touch-manipulation"
                          role="img"
                          aria-label="Verified wallet indicator"
                        >
                          <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
                        <p className="text-emerald-800 dark:text-emerald-200 font-medium">Verified Wallet</p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">This wallet has been verified and linked to your account</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
              
              {showChainId && chainId && (
                <div className="mt-1">
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <span 
                        className="text-xs text-muted-foreground font-mono cursor-help touch-manipulation"
                        role="text"
                        aria-label="Blockchain network identifier"
                      >
                        {chainId}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                      <p className="text-slate-800 dark:text-slate-200 font-medium">Network ID</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">Blockchain network identifier</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>

          {showCopy && (
            <div className="flex-shrink-0 ml-2">
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className={cn(
                      "h-8 w-8 hover:bg-accent/50 active:bg-accent/70 transition-all duration-200 touch-manipulation",
                      copied && "bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                    )}
                    aria-label={copied ? "Address copied to clipboard" : "Copy wallet address to clipboard"}
                  >
                    <motion.div
                      initial={false}
                      animate={{ scale: copied ? 0.9 : 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </motion.div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className={cn(
                  "transition-colors",
                  copied 
                    ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800" 
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                )}>
                  <p className={cn(
                    "font-medium",
                    copied 
                      ? "text-emerald-800 dark:text-emerald-200" 
                      : "text-slate-800 dark:text-slate-200"
                  )}>
                    {copied ? "Copied!" : "Copy Address"}
                  </p>
                  <p className={cn(
                    "text-xs",
                    copied 
                      ? "text-emerald-700 dark:text-emerald-300" 
                      : "text-slate-700 dark:text-slate-300"
                  )}>
                    {copied ? "Address copied to clipboard" : "Tap to copy wallet address"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
