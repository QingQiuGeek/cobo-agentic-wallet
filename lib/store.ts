import { create } from 'zustand';
import { Transaction, ActivityLog } from './types';

// Helper: Format ISO timestamp to YYYY-MM-DD HH:mm:ss
function formatTime(isoString: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch {
    return isoString;
  }
}

// Helper: Get token symbol from token_id
function getTokenSymbol(tokenId: string): string {
  if (!tokenId) return '?';
  if (tokenId.includes('USDC')) return 'USDC';
  if (tokenId.includes('USDT')) return 'USDT';
  if (tokenId.includes('ETH')) return 'ETH';
  if (tokenId.includes('SOL')) return 'SOL';
  return tokenId.split('_').pop() || tokenId;
}

// Helper: Map audit action to category
function getAuditCategory(action: string): 'pay' | 'transfer' | 'register' | 'query' | 'discover' {
  if (!action) return 'query';
  if (action.includes('transfer') || action.includes('payment')) return 'pay';
  if (action.includes('contract')) return 'register';
  if (action.includes('address') || action.includes('balance')) return 'query';
  return 'query';
}

// Helper: Format audit action to human-readable
function formatAuditAction(action: string): string {
  if (!action) return 'Operation';
  const map: Record<string, string> = {
    'wallet.read': '查询钱包信息',
    'wallet.address.list': '查询钱包地址',
    'wallet.balances': '查询余额',
    'user_transaction.list': '查询交易记录',
    'transfer.initiate': '发起转账',
    'contract_call.initiate': '调用合约',
    'payment.initiate': '发起支付',
  };
  return map[action] || action;
}

interface WalletInfo {
  uuid: string;
  name: string;
  evmAddress: string;
  solAddress: string;
  status: string;
}

interface BalanceInfo {
  token: string;
  amount: string;
  chain: string;
}

interface AppState {
  // Wallet state
  isWalletConnected: boolean;
  walletUuid: string;
  walletAddress: string;
  agentId: string;
  walletInfo: WalletInfo | null;
  balances: BalanceInfo[];

  // Data
  transactions: Transaction[];
  logs: ActivityLog[];

  // Actions
  setIsWalletConnected: (connected: boolean) => void;
  setWalletUuid: (uuid: string) => void;
  setWalletAddress: (address: string) => void;
  setAgentId: (id: string) => void;
  setWalletInfo: (info: WalletInfo | null) => void;
  setBalances: (balances: BalanceInfo[]) => void;
  setTransactions: (txs: Transaction[]) => void;
  setLogs: (logs: ActivityLog[]) => void;

  // Refresh actions
  refreshWalletStatus: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshAuditLogs: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  isWalletConnected: false,
  walletUuid: '',
  walletAddress: process.env.NEXT_PUBLIC_AGENT_WALLET_EVM_ADDRESS || '',
  agentId: process.env.NEXT_PUBLIC_AGENT_ID || '',
  walletInfo: null,
  balances: [],
  transactions: [],
  logs: [],

  // Setters
  setIsWalletConnected: (connected) => set({ isWalletConnected: connected }),
  setWalletUuid: (uuid) => set({ walletUuid: uuid }),
  setWalletAddress: (address) => set({ walletAddress: address }),
  setAgentId: (id) => set({ agentId: id }),
  setWalletInfo: (info) => set({ walletInfo: info }),
  setBalances: (balances) => set({ balances }),
  setTransactions: (txs) => set({ transactions: txs }),
  setLogs: (logs) => set({ logs }),

  // Refresh wallet status
  refreshWalletStatus: async () => {
    try {
      const resp = await fetch('/api/wallet/status');
      const data = await resp.json();
      if (data.success && data.connected) {
        set({
          isWalletConnected: true,
          walletUuid: data.wallet?.uuid || '',
          walletAddress: data.wallet?.evmAddress || '',
          walletInfo: data.wallet,
          balances: data.balances || [],
        });
      } else {
        set({ isWalletConnected: false });
      }
    } catch (e) {
      console.error('Failed to refresh wallet status:', e);
    }
  },

  // Refresh transactions
  refreshTransactions: async () => {
    try {
      const resp = await fetch('/api/wallet/transactions?limit=20');
      const data = await resp.json();
      const txList = Array.isArray(data.result) ? data.result : [];
      if (data.success && txList.length > 0) {
        const realTransactions = txList.map((tx: any, idx: number) => ({
          id: idx + 1,
          time: formatTime(tx.created_at),
          type: tx.type === 'transfer' ? 'Transfer' : tx.type === 'deposit' ? 'Deposit' : 'x402',
          from: tx.src_address || '—',
          to: tx.dst_address || '—',
          token: getTokenSymbol(tx.token_id),
          amount: parseFloat(tx.amount || '0'),
          status: tx.status_display === 'Success' ? 'success' : tx.status_display === 'Pending' ? 'pending' : 'failed',
          txHash: tx.transaction_hash || tx.id,
        }));
        set({ transactions: realTransactions });
      }
    } catch (e) {
      console.error('Failed to refresh transactions:', e);
    }
  },

  // Refresh audit logs
  refreshAuditLogs: async () => {
    try {
      const resp = await fetch('/api/wallet/audit?limit=20');
      const data = await resp.json();
      const auditItems = data.result?.items || [];
      if (data.success && auditItems.length > 0) {
        const realLogs = auditItems.map((log: any, idx: number) => ({
          id: idx + 1,
          time: formatTime(log.created_at),
          category: getAuditCategory(log.action),
          description: `${formatAuditAction(log.action)}: ${log.result || 'completed'}`,
          status: log.result === 'allowed' ? 'success' : log.result === 'denied' ? 'failed' : 'pending',
        }));
        set({ logs: realLogs });
      }
    } catch (e) {
      console.error('Failed to refresh audit logs:', e);
    }
  },

  // Refresh all data
  refreshAll: async () => {
    const state = get();
    await Promise.all([
      state.refreshWalletStatus(),
      state.refreshTransactions(),
      state.refreshAuditLogs(),
    ]);
  },
}));
