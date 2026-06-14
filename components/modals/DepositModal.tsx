'use client';
import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export default function DepositModal({ isOpen, onClose, walletAddress }: DepositModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">充值</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <QRCodeSVG
              value={walletAddress}
              size={180}
              bgColor="transparent"
              fgColor="#18181b"
              level="M"
            />
          </div>
        </div>

        {/* Address */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3">
          <div className="text-[10px] text-zinc-400 uppercase font-medium mb-1">收款地址 (EVM)</div>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-zinc-800 dark:text-zinc-200 break-all flex-1">
              {walletAddress}
            </code>
            <button
              onClick={copyAddress}
              className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-zinc-400" />}
            </button>
          </div>
        </div>

        {/* Hint */}
        <div className="text-[10px] text-zinc-400 text-center mt-3">
          向此地址发送 ETH 或 ERC-20 代币即可充值
        </div>
      </div>
    </div>
  );
}
