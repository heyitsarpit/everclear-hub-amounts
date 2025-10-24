import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'

import { Assets, findAsset } from './Assets'
import { Chains, findChain } from './Chains'
import { Address } from './Address'
import { findAssetOnChain } from './Assets'
import { HubChain } from './Chains'
import { EverclearHubABI } from './EverclearHubABI'
import { encodeAbiParameters, keccak256 } from 'viem'
import { readContract } from 'wagmi/actions'
import { wagmiConfig } from './wagmi'
import { formatUnits } from 'viem'

const AllDomains = Chains.map((n) => n.chain_id)

const AllowedAssets = ["WETH", "USDC", "USDT", "WBTC", "cbBTC", "USDC.E", "EURC"]

// Filter ticker hashes to only include assets where symbol exists in AllowedAssets
const FilteredAssets = Assets.filter(({ tickerHash }) => {
  const asset = findAsset({ tickerHash })
  return asset && AllowedAssets.includes(asset.symbol)
})

async function execute() {
  const allResults: Array<{
    symbol: string | undefined
    tickerHash: string
    results: Array<{
      amountCustodied: string
      chainId: string
      chainName: string
    }>
  }> = []

  // Use Promise.all with .map for parallel execution
  const results = await Promise.all(
    FilteredAssets.map(async ({ tickerHash }) => {
      const queryResults = await getCustodiedAmountQuery(tickerHash, AllDomains)

      const domains: Array<{
        amountCustodied: string
        chainId: string
        chainName: string
      }> = []

      for (const [domain, amount] of Object.entries(queryResults)) {
        if (!amount) continue

        domains.push({
          chainId: domain,
          chainName: findChain({ chainId: Number(domain) })?.name || '',
          amountCustodied: amount,
        })
      }

      if (Object.keys(domains).length) {
        return {
          symbol: findAsset({ tickerHash })?.symbol,
          tickerHash,
          results: domains
        }
      }

      return null
    })
  )

  // Filter out null results
  allResults.push(...results.filter((result): result is NonNullable<typeof result> => result !== null))

  // Write all results to a file
  const outputData = {
    timestamp: new Date().toISOString(),
    totalAssets: allResults.length,
    results: allResults
  }

  const outputPath = path.join(process.cwd(), 'custodied-amounts.json')
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2))

  console.log(`Results written to: ${outputPath}`)
  console.log(`Total assets processed: ${allResults.length}`)
}

execute()

async function getCustodiedAmountQuery(tickerHash: string, domains: number[]) {
  const promises = domains.map((domain) => {
    const asset = findAssetOnChain({
      chainId: domain,
      tickerHash: tickerHash
    })

    if (!asset) {
      //   console.error(`No hub asset found for ${tickerHash} on domain ${domain}`)
      return 0n
    }

    const addressHex32 = Address.any(
      asset.contract.contract_address
    ).toHex32() as `0x${string}`

    const hubAssetHash = keccak256(
      encodeAbiParameters(
        [{ type: 'bytes32' }, { type: 'uint32' }],
        [addressHex32, domain]
      )
    )

    return readContract(wagmiConfig, {
      address: getAddress(),
      abi: EverclearHubABI,
      functionName: 'custodiedAssets',
      // @ts-expect-error
      chainId: HubChain.chain_id,
      args: [hubAssetHash as `0x${string}`]
    })
  })

  const results = await Promise.all(promises)

  return Object.fromEntries(
    domains.map((domain, index) => [domain, String(results[index])])
  )
}

function getAddress() {
  const address = HubChain.deployments?.everclear
  if (!address) throw new Error('No contract address found')
  return address as `0x${string}`
}