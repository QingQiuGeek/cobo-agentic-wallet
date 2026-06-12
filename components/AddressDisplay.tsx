'use client'
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface AddressDisplayProps {
  address: string;
  isHash?: boolean;
}

export default function AddressDisplay({ address, isHash = false }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

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
      id={`address-display-${address.slice(0, 6)}`} 
      className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 dark:text-zinc-400"
    >
      <span className="cursor-help transition-colors hover:text-zinc-800 dark:hover:text-zinc-200" title={address}>
        {truncateAddress(address)}
      </span>
      <button
        id={`copy-btn-${address.slice(0, 6)}`}
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
    </div>
  );
}
