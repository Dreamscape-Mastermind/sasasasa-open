'use client'

import { Button } from "@/components/ui/button"
import { createAppKit, useAppKit } from "@reown/appkit/react";
import { ethersAdapter, networks, projectId } from "@/config/web3";
import colors from "tailwindcss/colors";

const metadata = {
    name: "Sasasasa",
    description: "Community to Commerce, now now",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://sasasasa.co", // origin must match your domain & subdomain
    icons: ["https://sasasasa.co/images/sasasasaLogo.png"],
};

// Create the AppKit instance outside of the component
createAppKit({
    adapters: [ethersAdapter],
    metadata,
    networks,
    projectId,
    features: {
      email: true, // default to true
      socials: ["google", "github", "discord", "x", "farcaster"],
      emailShowWallets: true, // default to true,
      analytics: true,
    },
    themeVariables: {
      "--w3m-color-mix": colors.pink[500],
      "--w3m-color-mix-strength": 40,
      "--w3m-accent": "#CC322D",
    },
    allWallets: "SHOW", // default to SHOW
});

export function AppKit({children}: {children?: React.ReactNode} ) {
  const { open } = useAppKit();
  
  return (
    <>
    <Button onClick={() => open({ view: "Connect" })}>Connect Wallet</Button>
    {children}
    </>
  )
}