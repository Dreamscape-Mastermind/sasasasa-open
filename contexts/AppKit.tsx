'use client'

import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, arbitrum, scrollSepolia, scroll } from '@reown/appkit/networks'
import colors from 'tailwindcss/colors'

// 1. Get projectId at https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || ''

// 2. Create a metadata object
const metadata = {
  name: 'Sasasasa',
  description: 'Community to Commerce, now now',
  url: 'https://beta.sasasasa.co', // origin must match your domain & subdomain
  icons: ['https://beta.sasasasa.co/images/sasasasaLogo.png']
}

// 3. Create the AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: [scrollSepolia],
  projectId,
  features: {
    email: true, // default to true
    socials: ['google', 'github', 'discord', 'x', 'farcaster'],
    emailShowWallets: true, // default to true,
    analytics: true
  },
  themeVariables: {
    '--w3m-color-mix': colors.pink[500],
    '--w3m-color-mix-strength': 40
  },
  allWallets: 'SHOW', // default to SHOW
})

export function AppKit({children}: {children?: React.ReactNode} ) {
  return (
    <><w3m-button></w3m-button></>
  )
}