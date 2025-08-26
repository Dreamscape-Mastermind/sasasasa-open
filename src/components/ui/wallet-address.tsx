"use client";

import { Check, Copy, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between rounded-lg border bg-background",
        containerSizes[size],
        className
      )}
    >
      <div className="flex items-center gap-2">
        {showIcon && <Wallet className={iconSizes[size]} />}
        <span className="font-medium">{truncatedAddress}</span>
        <div className="flex gap-1">
          {isPrimary && (
            <Badge variant="secondary" className="animate-in fade-in">
              Primary
            </Badge>
          )}
          {isVerified && (
            <Badge variant="default" className="animate-in fade-in">
              <Check className={iconSizes[size]} />
              Verified
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showChainId && chainId && (
          <span className="text-sm text-muted-foreground">
            Chain ID: {chainId}
          </span>
        )}
        {showCopy && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className={cn(
              "hover:bg-accent/10 transition-colors",
              size === "sm"
                ? "h-6 w-6"
                : size === "lg"
                ? "h-10 w-10"
                : "h-8 w-8"
            )}
          >
            <motion.div
              initial={false}
              animate={{ scale: copied ? 0.8 : 1 }}
              transition={{ duration: 0.1 }}
            >
              {copied ? (
                <Check className={iconSizes[size]} />
              ) : (
                <Copy className={iconSizes[size]} />
              )}
            </motion.div>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
