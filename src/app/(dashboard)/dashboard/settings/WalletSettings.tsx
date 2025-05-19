// File: src/app/(dashboard)/dashboard/settings/WalletSettings.tsx
"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from 'contexts/AuthContext';
import { useAppKitAccount } from "@reown/appkit/react";
import { AppKit } from 'contexts/AppKit';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { Wallet } from '@/utils/dataStructures';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Wallet as WalletIcon } from 'lucide-react';
import { WalletAddress } from '@/components/ui/wallet-address';

export default function WalletSettings() {
  const { getAccessToken, linkWallet } = useAuth();
  const { address, isConnected } = useAppKitAccount();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [primaryWallet, setPrimaryWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [isWalletVerified, setIsWalletVerified] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    // Check if the connected wallet is already verified
    if (address && wallets.length > 0) {
      const isVerified = wallets.some(
        wallet => wallet.address.toLowerCase() === address.toLowerCase() && wallet.is_verified
      );
      setIsWalletVerified(isVerified);
    }
  }, [address, wallets]);

  const fetchWallets = async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/web3/wallets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWallets(data.result.wallets || []);
        setPrimaryWallet(data.result.primary_wallet);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
      toast.error('Failed to fetch wallets');
    }
  };

  const handleLinkWallet = async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (isWalletVerified) {
      toast.error('This wallet is already verified and linked');
      return;
    }

    setLoading(true);
    try {
      const success = await linkWallet(address as `0x${string}`);
      if (success) {
        await fetchWallets();
        toast.success('Wallet linked successfully');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletIcon className="w-5 h-5" />
            Connected Wallets
          </CardTitle>
          <CardDescription>
            Manage wallets linked to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {wallets.length > 0 ? (
            <div className="space-y-4">
              {wallets.map((wallet, index) => (
                <motion.div
                  key={wallet.address}
                  variants={listItemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <WalletAddress
                    address={wallet.address}
                    isVerified={wallet.is_verified}
                    isPrimary={wallet.is_primary}
                    chainId={wallet.chain_id}
                    showChainId={true}
                    size="md"
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No wallets linked yet</p>
          )}

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Link a New Wallet</h3>
            {!isConnected ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Connect your wallet to link it to your account</p>
                <AppKit />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <WalletAddress
                    address={address || ''}
                    isVerified={isWalletVerified}
                    showChainId={false}
                    size="md"
                  />
                  {isWalletVerified && (
                    <Badge variant="destructive" className="animate-in fade-in">
                      <XCircle className="w-4 h-4 mr-1" />
                      Already Verified
                    </Badge>
                  )}
                </div>
                <Button 
                  className="w-full group"
                  onClick={handleLinkWallet}
                  disabled={loading || isWalletVerified}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                      />
                      Linking...
                    </span>
                  ) : isWalletVerified ? (
                    'Wallet Already Verified'
                  ) : (
                    'Link This Wallet'
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}