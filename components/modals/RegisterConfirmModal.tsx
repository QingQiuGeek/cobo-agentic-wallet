'use client'
import React from 'react';
import { AlertTriangle, Cpu, HelpCircle, ShieldCheck } from 'lucide-react';
import { ChainStatus } from '@/lib/types';

interface RegisterConfirmModalProps {
  chain: ChainStatus | null;
  agentName: string;
  walletAddress: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RegisterConfirmModal({
  chain,
  agentName,
  walletAddress,
  onClose,
  onConfirm,
}: RegisterConfirmModalProps) {
  if (!chain) return null;

  return (
    <div id="register-confirm-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 animate-in fade-in duration-200">
      <div 
        id="register-confirm-box" 
        className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 font-sans shadow-xl animate-in zoom-in-95 duration-200 text-zinc-900 dark:text-zinc-100"
      >
        {/* Title Indicator */}
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-5 w-5 text-purple-500 animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-wider font-mono">Confirm ERC-8004 On-Chain Binding</span>
        </div>

        {/* Warning notification banner */}
        <div className="flex gap-2.5 items-start bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 p-3 rounded-md text-xs leading-relaxed mb-4">
          <AlertTriangle className="h-4.5 w-4.5 mt-0.5 shrink-0" />
          <span>
            <strong>Attention:</strong> Binding is finalized inside smart contract registries and cannot be rescinded, changed, or removed. Complete binding rules persist permanently.
          </span>
        </div>

        {/* Detailed stats grids */}
        <div className="flex flex-col gap-2.5 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-150 dark:border-zinc-850 text-xs font-mono mb-4">
          <div className="flex justify-between py-1 border-b border-zinc-200/50 dark:border-zinc-800/55">
            <span className="text-zinc-400">Agent Identifier:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-100">{agentName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-200/50 dark:border-zinc-800/55">
            <span className="text-zinc-400">Owner Wallet:</span>
            <span className="text-zinc-750 dark:text-zinc-300 font-semibold">{walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-250/50 dark:border-zinc-850">
            <span className="text-zinc-400">Registry Chain:</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">{chain.name}</span>
          </div>
          <div className="flex flex-col gap-0.5 py-1">
            <span className="text-zinc-400">Contract Endpoint:</span>
            <span className="text-[10px] text-zinc-650 dark:text-zinc-350 break-all">{chain.registryAddress}</span>
          </div>
        </div>

        {/* Pre estimated Gas stats */}
        <div className="bg-purple-500/10 text-purple-700 dark:text-purple-300 p-2.5 rounded border border-purple-500/15 text-[10px] uppercase font-mono font-bold flex justify-between items-center mb-5.5">
          <span>Estimated Network Settle Fee:</span>
          <span>~0.0012 ETH</span>
        </div>

        {/* Navigation actions */}
        <div className="flex gap-2.5 justify-end">
          <button
            id="register-confirm-cancel-btn"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-mono font-bold rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="register-confirm-approve-btn"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-mono font-bold bg-zinc-950 hover:bg-zinc-850 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-md transition-colors cursor-pointer"
          >
            Confirm Registry
          </button>
        </div>
      </div>
    </div>
  );
}
