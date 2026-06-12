'use client'
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface AddressDisplayProps {
  address: string;
  isHash?: boolean;
}

export default function AddressDisplay({ address, isHash = false }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    if (addr.startsWith('0x') && addr.length > 12) {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    if (addr.length > 16) {
      return `${addr.slice(0, 8)}...${addr.slice(-4)}`;
    }
    return addr;
  };

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div
      id={`address-display-${address?.slice(0, 6)}`}
      className="relative inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 dark:text-zinc-400"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="cursor-help transition-colors hover:text-zinc-800 dark:hover:text-zinc-200">
        {truncateAddress(address)}
      </span>
      <button
        id={`copy-btn-${address?.slice(0, 6)}`}
        onClick={copyToClipboard}
        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors focus:outline-none"
        title="Copy address"
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>

      {/* Hover tooltip with full address */}
      {showTooltip && address && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in duration-150">
          <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-2 rounded-lg shadow-lg text-[10px] font-mono whitespace-nowrap flex items-center gap-2 max-w-xs">
            <span className="truncate">{address}</span>
            <button
              onClick={copyToClipboard}
              className="p-1 rounded hover:bg-white/20 dark:hover:bg-black/10 transition-colors shrink-0"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100" />
        </div>
      )}
    </div>
  );
}
