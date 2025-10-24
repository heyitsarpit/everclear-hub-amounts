import 'dotenv/config'

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

const AllTickerHashes = Assets.map((a) => a.tickerHash)
const AllDomains = Chains.map((n) => n.chain_id)

async function execute() {
  for (const tickerHash of AllTickerHashes) {
    const results = await getCustodiedAmountQuery(tickerHash, AllDomains)

    let totalFillAmountNeed = 0n

    const domains: Array<{
      amountCustodied: string
      chainId: string
      chainName: string
    }> = []

    for (const [domain, amount] of Object.entries(results)) {
      if (!amount) continue
  
        domains.push({
          chainId: domain,
          chainName: findChain({ chainId: Number(domain) })?.name || '',
          amountCustodied: amount,
        })
    }

    if(Object.keys(domains).length){
      console.log({
        symbol: findAsset({ tickerHash })?.symbol,
        tickerHash,
        totalFillAmountNeed: formatUnits(totalFillAmountNeed, 18),
        roundedResults: domains
      })
    }
  }
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