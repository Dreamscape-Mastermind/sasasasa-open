'use client'

import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/hooks/useWeb3"


export function AppKit({children}: {children?: React.ReactNode} ) {
  const { initializeAppKitButton } = useWeb3()
  

  return (
    <>
    <Button onClick={() => initializeAppKitButton()}>Connect Wallet</Button>
    </>
  )
}