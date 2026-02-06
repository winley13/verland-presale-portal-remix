import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, polygon, arbitrum } from '@reown/appkit/networks'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

// 1. Get projectId from https://cloud.reown.com
const projectId = 'b5ca09c8577900b9982fd8c18742880c' 

// 2. Create a metadata object
const metadata = {
  name: 'Verland Presale',
  description: 'Verland Land Presale Portal',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 3. Create Wagmi Adapter
const networks = [mainnet, polygon, arbitrum] as const
const wagmiAdapter = new WagmiAdapter({
  networks: networks as any,
  projectId,
  ssr: false
})

// 4. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: networks as any,
  projectId,
  metadata,
  features: {
    analytics: true
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#B6FE05',
    '--w3m-border-radius-master': '12px'
  }
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
