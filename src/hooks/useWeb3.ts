import { ethersAdapter, networks, projectId } from "@/config/web3";

import colors from "tailwindcss/colors";
import { createAppKit, useAppKit } from "@reown/appkit/react";

export const useWeb3 = () => {
  // 2. Create a metadata object
  const metadata = {
    name: "Sasasasa",
    description: "Community to Commerce, now now",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://sasasasa.co", // origin must match your domain & subdomain
    icons: ["https://sasasasa.co/images/sasasasaLogo.png"],
  };

  // 3. Create the AppKit instance
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

  const { open , close} = useAppKit();

  const initializeAppKitButton = () => {
    try {
      open({ view: "Connect" });
    } catch (error) {
      console.log("error with appkit", error);
      console.error(error);
    }
  };

  return {
    initializeAppKitButton,
  };
};
