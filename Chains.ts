import chainsData from './chains.json'

export const AllChains = chainsData as Chain[]

export const Chains = AllChains.filter((c) => !c.isHubChain)
export const HubChain = AllChains.find((c) => c.isHubChain) as Chain & {
  chain_id: number
}

export const SolanaId = 1399811149

const chainCache = new Map<number, Chain>(AllChains.map((c) => [c.chain_id, c]))

export function findChain({ chainId }: { chainId: number }) {
  return chainCache.get(chainId)
}

export type Chain = {
  deployments?: { everclear?: string; gateway?: string; XERC20Module?: string }
  isHubChain?: boolean
  network: 'evm' | 'svm' | 'tvm'
  chain_id: number
  image: string
  color: string
  name: string
}
