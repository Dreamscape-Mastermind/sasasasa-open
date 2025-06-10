// TODO: Add useWeb3 hook

import { ethersAdapter, networks, projectId } from "@/config/web3";
import { createAppKit } from "@reown/appkit/react";
import colors from "tailwindcss/colors";

export const useWeb3 = () => {
  // 2. Create a metadata object
  const metadata = {
    name: "Sasasasa",
    description: "Community to Commerce, now now",
    url: "https://beta.sasasasa.co", // origin must match your domain & subdomain
    icons: ["https://beta.sasasasa.co/images/sasasasaLogo.png"],
  };

  const initializeAppKitButton = () => {
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
  };

  return {
    initializeAppKitButton,
  }
};
