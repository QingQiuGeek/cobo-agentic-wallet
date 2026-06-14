'use client';
import { useState, useEffect } from 'react';
import { Droplets, ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react';

interface FaucetToken {
  chainId: string;
  tokenId: string;
  depositAmount: string;
  dailyLimit: string;
}

interface FaucetCardProps {
  isWalletConnected: boolean;
  onClaimSuccess?: () => void;
}

export default function FaucetCard({ isWalletConnected, onClaimSuccess }: FaucetCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [tokens, setTokens] = useState<FaucetToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [claimingToken, setClaimingToken] = useState<string | null>(null);
  const [claimedTokens, setClaimedTokens] = useState<Set<string>>(new Set());

  const fetchTokens = async () => {
    try {
      setIsLoading(true);

      // Get available faucet tokens
      const response = await fetch('/api/wallet/faucet/tokens');
      const data = await response.json();
      if (data.success && data.tokens) {
        // Only show SETH tokens (SOLDEV faucet is unreliable)
        const supported = data.tokens.filter((t: FaucetToken) =>
          t.tokenId.startsWith('SETH')
        );
        setTokens(supported);
      }
    } catch (error) {
      console.error('Failed to fetch faucet tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleClaim = async (tokenId: string) => {
    try {
      setClaimingToken(tokenId);
      const response = await fetch('/api/wallet/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId }),
      });
      const data = await response.json();
      if (data.success) {
        setClaimedTokens((prev) => new Set([...prev, tokenId]));
        if (onClaimSuccess) onClaimSuccess();
      } else {
        alert(`领取失败: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to claim tokens:', error);
      alert('领取测试币失败');
    } finally {
      setClaimingToken(null);
    }
  };

  if (!isWalletConnected) return null;

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-white dark:bg-zinc-950 shadow-sm">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none pb-2"
      >
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            CoBo Faucet
          </span>
          <span className="text-[10px] text-zinc-400">测试币水龙头</span>
        </div>
        <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded transition-colors">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900">
          {isLoading ? (
            <div className="flex items-center justify-center py-4 text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-xs">Loading tokens...</span>
            </div>
          ) : tokens.length === 0 ? (
            <div className="text-xs text-zinc-400 text-center py-4">
              No faucet tokens available
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {tokens.map((token) => {
                const isClaimed = claimedTokens.has(token.tokenId);
                const isClaiming = claimingToken === token.tokenId;

                return (
                  <button
                    key={token.tokenId}
                    onClick={() => handleClaim(token.tokenId)}
                    disabled={isClaiming || isClaimed}
                    className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg border text-[10px] transition-all ${
                      isClaimed
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                        : isClaiming
                        ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer'
                    }`}
                  >
                    {isClaiming ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isClaimed ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Droplets className="h-4 w-4 text-blue-400" />
                    )}
                    <span className="font-mono font-bold text-[11px]">
                      {token.tokenId}
                    </span>
                    <span className="text-[9px] text-zinc-400">
                      +{token.depositAmount}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="text-[9px] text-zinc-400 text-center mt-2">
            每日领取限制，超限返回 429
          </div>
        </div>
      )}
    </div>
  );
}
