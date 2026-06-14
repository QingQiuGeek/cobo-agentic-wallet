export interface Transaction {
  id: number;
  time: string;
  type: 'x402' | 'Transfer' | 'Deposit' | 'Register' | 'Payment';
  from: string;
  to: string;
  token: 'USDC' | 'ETH' | string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  txHash: string;
}

export interface ActivityLog {
  id: number;
  time: string;
  category: 'discover' | 'pay' | 'transfer' | 'query' | 'register' | 'a2a' | 'error' | 'success';
  description: string;
  status: 'success' | 'failed' | 'pending';
}

export interface PaidService {
  id: string;
  name: string;
  url: string;
  price: string;
  pricingToken: 'USDC' | 'ETH';
  provider: string;
  description: string;
  icon: string;
}

export interface ChainStatus {
  chainId: string;
  name: string;
  registered: boolean;
  tokenId?: string;
  registryAddress: string;
  status: 'active' | 'inactive' | 'loading' | 'upcoming';
}

export interface ToolCall {
  key?: any;
  id: string;
  name: string;
  parameters: Record<string, any>;
  result: Record<string, any>;
  status: 'running' | 'success' | 'failed';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  time: string;
  content: string;
  toolCalls?: ToolCall[];
}
