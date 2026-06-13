'use client'
import { useState, useEffect } from 'react';
import { Wallet, ChevronDown, ChevronUp, Plus, ArrowUpRight, Copy, Check, RefreshCw } from 'lucide-react';
import AddressDisplay from '../AddressDisplay';

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

interface WalletCardProps {
  onWalletSwitch?: (walletUuid: string) => void;
}

export default function WalletCard({ onWalletSwitch }: WalletCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [currentWallet, setCurrentWallet] = useState<WalletInfo | null>(null);
  const [balances, setBalances] = useState<BalanceInfo[]>([]);
  const [walletList, setWalletList] = useState<WalletInfo[]>([]);
  const [showWalletList, setShowWalletList] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch wallet status on mount
  useEffect(() => {
    fetchWalletStatus();
  }, []);

  const fetchWalletStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/wallet/status');
      const data = await response.json();

      if (data.success && data.connected) {
        setIsConnected(true);
        setCurrentWallet(data.wallet);
        setBalances(data.balances || []);
      } else {
        setIsConnected(false);
        setCurrentWallet(null);
        setBalances([]);
      }
    } catch (error) {
      console.error('Failed to fetch wallet status:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalletList = async () => {
    try {
      const response = await fetch('/api/wallet/list');
      const data = await response.json();
      if (data.success) {
        setWalletList(data.wallets || []);
      }
    } catch (error) {
      console.error('Failed to fetch wallet list:', error);
    }
  };

  const handleCreateWallet = async () => {
    if (!newWalletName.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWalletName.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateForm(false);
        setNewWalletName('');
        await fetchWalletStatus();
        if (onWalletSwitch) {
          onWalletSwitch(data.wallet.uuid);
        }
      } else {
        alert(`创建失败: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create wallet:', error);
      alert('创建钱包失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchWallet = async (walletUuid: string) => {
    try {
      setIsLoading(true);
      // Call API to switch wallet
      const response = await fetch('/api/wallet/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletUuid }),
      });

      const data = await response.json();
      if (data.success) {
        setShowWalletList(false);
        await fetchWalletStatus();
        if (onWalletSwitch) {
          onWalletSwitch(walletUuid);
        }
      }
    } catch (error) {
      console.error('Failed to switch wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchWalletStatus();
  };

  const getBalance = (token: string) => {
    const balance = balances.find(b => b.token === token);
    return balance ? parseFloat(balance.amount).toFixed(4) : '0.0000';
  };

  // Extract token symbol from token_id (e.g., "SETH" -> "ETH", "SETH_USDC" -> "USDC")
  const getTokenSymbol = (tokenId: string) => {
    if (!tokenId) return '?';
    if (tokenId.includes('USDC')) return 'USDC';
    if (tokenId.includes('USDT')) return 'USDT';
    if (tokenId.includes('ETH')) return 'ETH';
    if (tokenId.includes('SOL')) return 'SOL';
    return tokenId.split('_').pop() || tokenId;
  };

  // Claim testnet tokens from faucet
  const handleClaimTokens = async (tokenId: string = 'SETH') => {
    try {
      setIsClaiming(true);
      const response = await fetch('/api/wallet/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId }),
      });
      const data = await response.json();
      if (data.success) {
        // Refresh wallet status to show new balance
        await fetchWalletStatus();
        alert(`Testnet ${tokenId} claimed successfully!`);
      } else {
        alert(`Failed to claim: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to claim tokens:', error);
      alert('Failed to claim testnet tokens');
    } finally {
      setIsClaiming(false);
    }
  };

  // Format balance for display
  const formatBalance = (amount: string) => {
    const num = parseFloat(amount || '0');
    if (num === 0) return '0.00';
    if (num < 0.001) return '<0.001';
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <div id="sidebar-wallet-card" className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-white dark:bg-zinc-950 shadow-sm transition-all">
      {/* Header */}
      <div
        id="wallet-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none pb-2"
      >
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Agent Wallet</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded transition-colors">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div id="wallet-card-content" className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex flex-col gap-3">
          {!isConnected ? (
            /* Not connected - show create wallet */
            <div className="flex flex-col gap-3 py-1">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                尚未创建钱包。点击下方按钮创建一个新的 Agent 钱包。
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center justify-center gap-1 text-xs font-bold bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 py-2 rounded transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>创建钱包</span>
              </button>
            </div>
          ) : (
            /* Connected - show wallet info */
            <>
              {/* Wallet selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowWalletList(!showWalletList);
                    if (!showWalletList) fetchWalletList();
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 text-xs"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {currentWallet?.name || 'Unknown'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </button>

                {/* Wallet list dropdown */}
                {showWalletList && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {walletList.map((wallet) => (
                      <button
                        key={wallet.uuid}
                        onClick={() => handleSwitchWallet(wallet.uuid)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                          wallet.uuid === currentWallet?.uuid ? 'bg-zinc-100 dark:bg-zinc-800' : ''
                        }`}
                      >
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{wallet.name}</span>
                        {wallet.uuid === currentWallet?.uuid && (
                          <Check className="h-3 w-3 text-emerald-500" />
                        )}
                      </button>
                    ))}
                    <button
                      onClick={() => { setShowWalletList(false); setShowCreateForm(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-800"
                    >
                      <Plus className="h-3 w-3" />
                      <span>创建新钱包</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Addresses - EVM and Solana */}
              {currentWallet?.evmAddress && (
                <div className="flex items-center justify-between py-1 bg-zinc-50 dark:bg-zinc-900/40 rounded px-2">
                  <span className="text-xs text-zinc-400">ETH</span>
                  <AddressDisplay address={currentWallet.evmAddress} />
                </div>
              )}
              {currentWallet?.solAddress && (
                <div className="flex items-center justify-between py-1 bg-zinc-50 dark:bg-zinc-900/40 rounded px-2">
                  <span className="text-xs text-zinc-400">SOL</span>
                  <AddressDisplay address={currentWallet.solAddress} />
                </div>
              )}

              {/* Balances - dynamic from CAW API */}
              <div className="grid grid-cols-2 gap-2">
                {balances.length > 0 ? (
                  balances.slice(0, 4).map((b, idx) => (
                    <div key={idx} className="bg-zinc-50 dark:bg-zinc-900/40 rounded p-2 border border-zinc-100 dark:border-zinc-900">
                      <span className="text-[10px] text-zinc-400 block uppercase font-medium">
                        {getTokenSymbol(b.token)}
                      </span>
                      <span className={`text-sm font-mono font-bold mt-0.5 block ${
                        b.token?.includes('USDC') ? 'text-emerald-600 dark:text-emerald-400' : ''
                      }`}>
                        {formatBalance(b.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded p-2 border border-zinc-100 dark:border-zinc-900">
                      <span className="text-[10px] text-zinc-400 block uppercase font-medium">ETH</span>
                      <span className="text-sm font-mono font-bold mt-0.5 block">0.0000</span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded p-2 border border-zinc-100 dark:border-zinc-900">
                      <span className="text-[10px] text-zinc-400 block uppercase font-medium">USDC</span>
                      <span className="text-sm font-mono font-bold mt-0.5 block text-emerald-600 dark:text-emerald-400">$0.00</span>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleClaimTokens('SETH')}
                  disabled={isClaiming}
                  className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 py-1.5 px-2 rounded border border-emerald-200 dark:border-emerald-800 transition-colors disabled:opacity-50"
                >
                  <Plus className="h-3 w-3" />
                  <span>{isClaiming ? '领取中...' : '领测试币'}</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 py-1.5 px-2 rounded transition-colors">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>转账</span>
                </button>
              </div>
            </>
          )}

          {/* Create wallet form */}
          {showCreateForm && (
            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded border border-zinc-200 dark:border-zinc-800">
              <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-2">创建新钱包</div>
              <input
                type="text"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                placeholder="钱包名称"
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs rounded p-2 mb-2 outline-none focus:border-zinc-800 dark:focus:border-zinc-200"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 text-xs text-zinc-500 py-1.5 rounded border border-zinc-200 dark:border-zinc-800"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateWallet}
                  disabled={isLoading || !newWalletName.trim()}
                  className="flex-1 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 py-1.5 rounded disabled:opacity-50"
                >
                  {isLoading ? '创建中...' : '创建'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
