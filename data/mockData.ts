import { ChainStatus, PaidService, Transaction, ActivityLog, ChatMessage } from '@/lib/types';

export const INITIAL_CHAINS: ChainStatus[] = [
  {
    chainId: 'base-sepolia',
    name: 'Base Sepolia',
    registered: true,
    tokenId: '#14298',
    registryAddress: '0x80049fD2da59d28003fBceA1eBa6f8fe9E34BD9e',
    status: 'active',
  },
  {
    chainId: 'eth-sepolia',
    name: 'ETH Sepolia',
    registered: false,
    registryAddress: '0x80041696Fe9a7fFeB9fE895521789C4Ac79D67Ea',
    status: 'inactive',
  },
  {
    chainId: 'polygon-amoy',
    name: 'Polygon Amoy',
    registered: false,
    registryAddress: '0x8004b3cfc234a9ff5986fe7f03bc18080c6576da',
    status: 'upcoming',
  }
];

export const INITIAL_SERVICES: PaidService[] = [
  {
    id: 'eth-analyzer',
    name: 'ETH Chain Analysis',
    url: '/api/data/eth-analysis',
    price: '0.001',
    pricingToken: 'USDC',
    provider: 'BlockIntelligence',
    description: 'High-density historical wallet analysis & gas patterns.',
    icon: 'Search',
  },
  {
    id: 'mkt-prediction',
    name: 'Market Prediction',
    url: '/api/data/mkt-prediction',
    price: '0.005',
    pricingToken: 'USDC',
    provider: 'AlphaOracle',
    description: 'Statistical price boundaries & sentiment insights.',
    icon: 'TrendingUp',
  },
  {
    id: 'gas-tracker',
    name: 'Gas Optimization API',
    url: '/api/data/gas-optimizer',
    price: '0.0002',
    pricingToken: 'ETH',
    provider: 'GasSaver DAO',
    description: 'Predictive gas thresholds for high-speed transactions.',
    icon: 'Cpu',
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    time: '14:02',
    type: 'x402',
    counterparty: '0xABC...DEF (BlockIntelligence)',
    token: 'USDC',
    amount: 0.001,
    status: 'success',
    txHash: '0x12a9ea...cf83',
  },
  {
    id: 2,
    time: '13:45',
    type: 'Transfer',
    counterparty: '0x1a83...492b (Liquidity Pool)',
    token: 'ETH',
    amount: 0.05,
    status: 'success',
    txHash: '0xea39df...392f',
  },
  {
    id: 3,
    time: '13:12',
    type: 'Deposit',
    counterparty: 'User Wallet (Cobo Custody)',
    token: 'USDC',
    amount: 15.0,
    status: 'success',
    txHash: '0x8f27ab...49ba',
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 1,
    time: '14:02',
    category: 'pay',
    description: 'Paid 0.001 USDC to BlockIntelligence for ETH Chain Analysis',
    status: 'success',
  },
  {
    id: 2,
    time: '14:02',
    category: 'discover',
    description: 'Agent searched for "ETH analysis" and matched 3 services',
    status: 'success',
  },
  {
    id: 3,
    time: '13:45',
    category: 'transfer',
    description: 'Transferred 0.05 ETH to 0x1a83...492b successfully',
    status: 'success',
  },
  {
    id: 4,
    time: '13:12',
    category: 'query',
    description: 'Queried multi-chain balance: ETH 0.50, USDC 15.00',
    status: 'success',
  },
  {
    id: 5,
    time: '13:00',
    category: 'register',
    description: 'Registered CoboAgenticWallet on Base Sepolia, minted token #14298',
    status: 'success',
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'agent',
    time: '13:00',
    content: 'Wallet activated. ERC-8004 identifier registered on Base Sepolia. Ready to securely scan network endpoints, query ledger states, and settle high-frequency micro-payments via our multi-chain vault.',
  }
];
