'use client';
import { useState } from 'react';
import { X, ArrowUpRight, Loader2 } from 'lucide-react';

interface BalanceInfo {
  token: string;
  amount: string;
  chain: string;
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  balances: BalanceInfo[];
  onSuccess?: () => void;
}

export default function TransferModal({ isOpen, onClose, balances, onSuccess }: TransferModalProps) {
  const [selectedToken, setSelectedToken] = useState('SETH');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Get balance for selected token
  const tokenBalance = balances.find(b => b.token === selectedToken);
  const balance = tokenBalance ? parseFloat(tokenBalance.amount) : 0;

  // Filter available tokens (only show SETH for now)
  const availableTokens = balances.filter(b =>
    b.token.startsWith('SETH') && parseFloat(b.amount) > 0
  );

  const getTokenSymbol = (tokenId: string) => {
    if (tokenId.includes('USDC')) return 'USDC';
    if (tokenId.includes('ETH')) return 'ETH';
    return tokenId.split('_').pop() || tokenId;
  };

  const validate = (): string | null => {
    if (!toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return '收款地址格式无效（需要 0x 开头的 42 位地址）';
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return '金额必须大于 0';
    }
    if (numAmount > balance) {
      return `余额不足：需要 ${numAmount} ${getTokenSymbol(selectedToken)}，当前余额 ${balance.toFixed(4)}`;
    }
    return null;
  };

  const handleSend = async () => {
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: selectedToken,
          dstAddr: toAddress,
          amount: amount,
        }),
      });
      const data = await response.json();
      if (data.success) {
        if (onSuccess) onSuccess();
        onClose();
        alert('转账成功！');
      } else {
        setError(data.error || '转账失败');
      }
    } catch (e) {
      setError('转账请求失败');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5" />
            转账
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Token selector */}
        <div className="mb-4">
          <label className="text-[10px] text-zinc-400 uppercase font-medium mb-1.5 block">代币</label>
          <div className="flex gap-2">
            {availableTokens.length > 0 ? (
              availableTokens.map((t) => {
                const symbol = getTokenSymbol(t.token);
                const isTestnet = t.token.startsWith('S') || t.token.startsWith('T');
                return (
                  <button
                    key={t.token}
                    onClick={() => { setSelectedToken(t.token); setError(''); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold border transition-colors ${
                      selectedToken === t.token
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span>{symbol}</span>
                      {isTestnet && (
                        <span className="text-[8px] font-normal opacity-70">测试网</span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-xs text-zinc-400">无可用代币</div>
            )}
          </div>
          {tokenBalance && (
            <div className="text-[10px] text-zinc-400 mt-1">
              余额: <span className="font-mono font-bold text-zinc-600 dark:text-zinc-300">{parseFloat(tokenBalance.amount).toFixed(4)} {getTokenSymbol(selectedToken)}</span>
            </div>
          )}
        </div>

        {/* To address */}
        <div className="mb-4">
          <label className="text-[10px] text-zinc-400 uppercase font-medium mb-1.5 block">收款地址</label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => { setToAddress(e.target.value); setError(''); }}
            placeholder="0x..."
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-800 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Amount */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-zinc-400 uppercase font-medium">金额</label>
            {tokenBalance && (
              <button
                onClick={() => setAmount(tokenBalance.amount)}
                className="text-[10px] text-blue-500 hover:text-blue-600 font-medium"
              >
                最大
              </button>
            )}
          </div>
          <input
            type="number"
            step="any"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(''); }}
            placeholder="0.0"
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm font-mono text-zinc-800 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isSending || !toAddress || !amount}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> 发送中...</>
          ) : (
            <><ArrowUpRight className="h-4 w-4" /> 发送</>
          )}
        </button>
      </div>
    </div>
  );
}
