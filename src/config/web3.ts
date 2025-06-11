import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { AppKitNetwork, scrollSepolia } from "@reown/appkit/networks";

let currentProjectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || ''

if (!currentProjectId) {
  throw new Error('Project ID is not defined')
}

export const projectId = currentProjectId

export const networks = [scrollSepolia] as [AppKitNetwork, ...AppKitNetwork[]]

export const ethersAdapter = new EthersAdapter();