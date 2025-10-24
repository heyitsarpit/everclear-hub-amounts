export const EverclearHubABI = [
  {
    inputs: [
      { name: '_tickerHash', type: 'bytes32' },
      { name: '_domain', type: 'uint32' }
    ],
    name: 'assetHash',
    outputs: [{ name: '_assetHash', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_assetHash', type: 'bytes32' }],
    name: 'custodiedAssets',
    outputs: [{ name: '_amount', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const
