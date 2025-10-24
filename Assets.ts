import assetsData from './assets.json'

export const Assets = assetsData as Asset[]

const assetCache = new Map<string, Asset>()

type FindAssetArgs = {
  tickerHash?: string
  symbol?: string
  id?: string
}

export function findAsset({
  id,
  tickerHash,
  symbol
}: FindAssetArgs): undefined | Asset {
  if (!id && !tickerHash && !symbol) {
    throw new Error('id or tickerHash or symbol is required')
  }

  const cacheKey = (id || tickerHash || symbol?.toLowerCase()) as string

  if (assetCache.has(cacheKey)) {
    return assetCache.get(cacheKey)
  }

  const asset = Assets.find(
    (a) =>
      (id && a.id === id) ||
      (tickerHash && a.tickerHash === tickerHash) ||
      (symbol && a.symbol === symbol)
  )

  if (asset) {
    assetCache.set(cacheKey, asset)
  }

  return asset
}

export type AssetOnChain = {
  contract: Contract
} & Omit<Asset, 'contracts'>

const assetOnChainCache = new Map<string, AssetOnChain>()

type FindAssetOnChainArgs =
  | {
      contractAddress: string
      chainId: number
    }
  | {
      tickerHash: string
      chainId: number
    }
  | {
      symbol: string
      chainId: number
    }

export function findAssetOnChain(
  args: FindAssetOnChainArgs
): AssetOnChain | undefined {
  const cacheKey = JSON.stringify(args)

  if (assetOnChainCache.has(cacheKey)) {
    return assetOnChainCache.get(cacheKey)
  }

  for (const asset of Assets) {
    let contract: undefined | Contract

    if ('contractAddress' in args) {
      contract = asset.contracts.find(
        (c) =>
          c.chain_id === args.chainId &&
          c.contract_address.toLowerCase() ===
            args.contractAddress.toLowerCase()
      )
    } else if ('tickerHash' in args) {
      if (asset.tickerHash === args.tickerHash) {
        contract = asset.contracts.find((c) => c.chain_id === args.chainId)
      }
    } else if ('symbol' in args) {
      if (asset.symbol === args.symbol) {
        contract = asset.contracts.find((c) => c.chain_id === args.chainId)
      }
    }

    if (contract) {
      const assetOnChain = {
        ...asset,
        contract,
        contracts: undefined
      } as AssetOnChain

      assetOnChainCache.set(cacheKey, assetOnChain)
      return assetOnChain
    }
  }

  return undefined
}

export type Asset = {
  contracts: Contract[]
  coingecko_id: string
  tickerHash: string
  isXERC20?: boolean
  wrappedToken?: string
  symbol: string
  image: string
  name: string
  id: string
}

export type Contract = {
  contract_address: string
  isNative?: boolean
  network: 'evm' | 'svm' | 'tvm'
  decimals: number
  chain_id: number
}
