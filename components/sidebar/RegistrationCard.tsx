'use client'
import React, { useState } from 'react';
import { Fingerprint, ChevronDown, ChevronUp, Check, AlertTriangle, ExternalLink } from 'lucide-react';
import { ChainStatus } from '@/lib/types';

interface RegistrationCardProps {
  chains: ChainStatus[];
  onInitiateRegister: (chain: ChainStatus) => void;
}

export default function RegistrationCard({ chains, onInitiateRegister }: RegistrationCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div id="sidebar-registration-card" className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-white dark:bg-zinc-950 shadow-sm transition-all">
      {/* Header collapsible */}
      <div 
        id="registration-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none pb-2"
      >
        <div className="flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">ERC-8004 Registry</span>
        </div>
        <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded transition-colors focus:outline-none">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div id="registration-card-content" className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex flex-col gap-3.5">
          {/* irreversible Warning */}
          <div className="flex gap-2 items-start bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-2.5 rounded text-[11px] leading-relaxed">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              Disclaimer: ERC-8004 Agentic identity binding is irreversible. Registered states persist on-chain indefinitely.
            </span>
          </div>

          {/* List of chains */}
          <div className="flex flex-col gap-3">
            {chains.map((chain) => (
              <div 
                key={chain.chainId} 
                id={`chain-row-${chain.chainId}`}
                className="flex flex-col gap-1.5 border-b border-dashed border-zinc-100 dark:border-zinc-900 pb-2.5 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{chain.name}</span>
                  {chain.registered ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      <Check className="h-2.5 w-2.5" />
                      <span>Registered</span>
                    </span>
                  ) : chain.status === 'upcoming' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                      Soon
                    </span>
                  ) : chain.status === 'loading' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 animate-pulse">
                      Pending
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
                      Inactive
                    </span>
                  )}
                </div>

                {/* Sub details block */}
                {chain.registered && chain.tokenId ? (
                  <div className="flex flex-col gap-1 bg-zinc-50 dark:bg-zinc-900/40 rounded p-1.5 px-2 text-[10px] font-mono text-zinc-500">
                    <div className="flex justify-between">
                      <span>Token ID:</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-bold">{chain.tokenId}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-zinc-400 mt-0.5">
                      <span className="truncate max-w-[140px]">{chain.registryAddress}</span>
                      <a 
                        href={`https://etherscan.io/address/${chain.registryAddress}`} 
                        target="_blank" 
                        referrerPolicy="no-referrer"
                        className="text-blue-500 hover:underline flex items-center gap-0.5"
                      >
                        scan <ExternalLink className="h-2 w-2" />
                      </a>
                    </div>
                  </div>
                ) : (
                  chain.status === 'inactive' && (
                    <button
                      id={`id-register-btn-${chain.chainId}`}
                      onClick={() => onInitiateRegister(chain)}
                      className="w-full text-center bg-zinc-900 dark:bg-zinc-100 font-semibold text-white dark:text-zinc-950 py-1 rounded text-[11px] hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      Register Identifiers
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
