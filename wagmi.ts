import { createConfig, http } from 'wagmi'
import { mainnet, arbitrum, optimism, polygon, avalanche, linea, bsc, base, blast, zircuit, scroll, taiko, apeChain, mode, unichain, zksync, ronin, gnosis, ink, berachain, mantle, sonic, tron } from 'wagmi/chains'
import { defineChain } from 'viem'

// Define Everclear chain
export const everclear = defineChain({
  id: 25327,
  name: 'Everclear',
  network: 'everclear',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.everclear.raas.gelato.cloud'],
      webSocket: ['wss://ws.everclear.raas.gelato.cloud']
    },
    public: {
      http: ['https://rpc.everclear.raas.gelato.cloud'],
      webSocket: ['wss://ws.everclear.raas.gelato.cloud']
    }
  },
  blockExplorers: {
    default: {
      name: 'Everclear Explorer',
      url: 'https://scan.everclear.org'
    }
  }
})

export const wagmiConfig = createConfig({
  chains: [
    mainnet,
    arbitrum,
    optimism,
    polygon,
    avalanche,
    linea,
    bsc,
    base,
    blast,
    zircuit,
    scroll,
    taiko,
    apeChain,
    mode,
    unichain,
    zksync,
    ronin,
    gnosis,
    ink,
    berachain,
    mantle,
    sonic,
    tron,
    everclear
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [avalanche.id]: http(),
    [linea.id]: http(),
    [bsc.id]: http(),
    [base.id]: http(),
    [blast.id]: http(),
    [zircuit.id]: http(),
    [scroll.id]: http(),
    [taiko.id]: http(),
    [apeChain.id]: http(),
    [mode.id]: http(),
    [unichain.id]: http(),
    [zksync.id]: http(),
    [ronin.id]: http(),
    [gnosis.id]: http(),
    [ink.id]: http(),
    [berachain.id]: http(),
    [mantle.id]: http(),
    [sonic.id]: http(),
    [tron.id]: http(),
    [everclear.id]: http()
  }
})
