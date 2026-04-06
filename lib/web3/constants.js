export const MINIMUM_USD = 25;

export const USDC_ETHEREUM_ADDRESS =
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

export const USDT_ETHEREUM_ADDRESS =
  '0xdAC17F958D2ee523a2206206994597C13D831ec7';

export const ERC20_TRANSFER_ABI = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
];