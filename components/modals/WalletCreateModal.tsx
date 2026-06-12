'use client'
import React, { useState } from 'react';
import { Sparkles, KeyRound, Radio, ShieldAlert } from 'lucide-react';

interface WalletCreateModalProps {
  onClose: () => void;
  onCreate: (name: string, type: 'standalone' | 'paired', pairedCode?: string) => void;
}

export default function WalletCreateModal({ onClose, onCreate }: WalletCreateModalProps) {
  const [name, setName] = useState('CoboAgent');
  const [walletType, setWalletType] = useState<'standalone' | 'paired'>('standalone');
  const [pairedCode, setPairedCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (walletType === 'paired' && !pairedCode.trim()) return;
    onCreate(name.trim(), walletType, walletType === 'paired' ? pairedCode.trim() : undefined);
  };

  return (
    <div id="wallet-create-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 animate-in fade-in duration-200">
      <form 
        id="wallet-create-form"
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 font-sans shadow-xl animate-in zoom-in-95 duration-200 text-zinc-900 dark:text-zinc-100"
      >
        {/* Title row */}
        <div className="flex items-center gap-2 mb-3.5">
          <KeyRound className="h-4.5 w-4.5 text-zinc-800 dark:text-zinc-200" />
          <span className="text-sm font-bold uppercase tracking-wider font-mono">Setup Agentic Vault</span>
        </div>

        {/* Input Name field */}
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500">Agent Name / ID</label>
          <input
            id="modal-agent-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 outline-none focus:border-zinc-800 dark:focus:border-zinc-300 font-mono"
            placeholder="e.g. CoboAgent"
            required
          />
        </div>

        {/* Wallet type option selectors */}
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 mb-1">Vault Mode type</label>
          <div className="flex flex-col gap-2">
            {/* Standalone Radio Option */}
            <div 
              id="radio-standalone-trigger"
              onClick={() => setWalletType('standalone')}
              className={`border rounded p-2.5 flex items-start gap-2.5 cursor-pointer transition-all ${
                walletType === 'standalone' 
                  ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900/60' 
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50'
              }`}
            >
              <input
                type="radio"
                name="walletType"
                checked={walletType === 'standalone'}
                onChange={() => setWalletType('standalone')}
                className="mt-0.5 pointer-events-none accent-zinc-950 dark:accent-white"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-semibold">Autonomous Private Vault (Recommended)</span>
                <span className="text-[9px] text-zinc-400 mt-0.5">Agent owns custodial keys and authorizes gas independently.</span>
              </div>
            </div>

            {/* Paired Radio Option */}
            <div 
              id="radio-paired-trigger"
              onClick={() => setWalletType('paired')}
              className={`border rounded p-2.5 flex items-start gap-2.5 cursor-pointer transition-all ${
                walletType === 'paired' 
                  ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900/60' 
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50'
              }`}
            >
              <input
                type="radio"
                name="walletType"
                checked={walletType === 'paired'}
                onChange={() => setWalletType('paired')}
                className="mt-0.5 pointer-events-none accent-zinc-950 dark:accent-white"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-semibold">Paired Custody Pipeline</span>
                <span className="text-[9px] text-zinc-400 mt-0.5">Couple with your mobile/desktop Cobo key via secure pairing protocol.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pairing token input */}
        <div className="flex flex-col gap-1 mb-5">
          <label className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500">Pairing Code (Optional)</label>
          <input
            id="modal-pairing-code-input"
            type="text"
            value={pairedCode}
            onChange={(e) => setPairedCode(e.target.value)}
            disabled={walletType === 'standalone'}
            placeholder={walletType === 'standalone' ? 'Not required in Autonomous mode' : 'e.g. CAW-8b92-911a'}
            className="bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 text-xs rounded px-2.5 py-1.5 outline-none font-mono text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
            required={walletType === 'paired'}
          />
        </div>

        {/* Action Button layout */}
        <div className="flex justify-end gap-2 text-xs font-mono font-bold">
          <button
            id="wallet-create-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-zinc-250 dark:border-zinc-850 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-zinc-650 dark:text-zinc-300"
          >
            Cancel
          </button>
          <button
            id="wallet-create-submit-btn"
            type="submit"
            className="px-3.5 py-1.5 bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-850 dark:hover:bg-zinc-200 bg-zinc-900 text-white dark:text-zinc-950 rounded transition-colors cursor-pointer font-bold"
          >
            Create Vault
          </button>
        </div>
      </form>
    </div>
  );
}
