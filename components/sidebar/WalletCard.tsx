'use client'
import React, { useState } from 'react';
import { Wallet, ChevronDown, ChevronUp, Plus, ArrowUpRight } from 'lucide-react';
import AddressDisplay from '../AddressDisplay';

interface WalletCardProps {
  address: string;
  ethBalance: number;
  usdcBalance: number;
  isWalletConnected: boolean;
  onConnectWallet: () => void;
  onCreateWallet: () => void;
  onDeposit: (token: 'ETH' | 'USDC', amount: number) => void;
  onTransfer: (token: 'ETH' | 'USDC', destination: string, amount: number) => void;
}

export default function WalletCard({
  address,
  ethBalance,
  usdcBalance,
  isWalletConnected,
  onConnectWallet,
  onCreateWallet,
  onDeposit,
  onTransfer,
}: WalletCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);

  // State for forms
  const [depositToken, setDepositToken] = useState<'ETH' | 'USDC'>('USDC');
  const [depositAmount, setDepositAmount] = useState('10.0');

  const [transferToken, setTransferToken] = useState<'ETH' | 'USDC'>('USDC');
  const [transferAddress, setTransferAddress] = useState('0x9aF8...cC28');
  const [transferAmount, setTransferAmount] = useState('5.0');

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;
    onDeposit(depositToken, amt);
    setShowDepositForm(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0 || !transferAddress) return;
    onTransfer(transferToken, transferAddress, amt);
    setShowTransferForm(false);
  };

  return (
    <div id="sidebar-wallet-card" className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-white dark:bg-zinc-950 shadow-sm transition-all">
      {/* Upper Collapsible row */}
      <div
        id="wallet-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none pb-2"
      >
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Agent Wallet</span>
        </div>
        <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded transition-colors focus:outline-none">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div id="wallet-card-content" className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex flex-col gap-3">
          {!isWalletConnected ? (
            <div className="flex flex-col gap-3 py-1">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                AI Agent 托管金库处于未连接状态。请连接钱包或创建钱包以开始。
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  id="wallet-connect-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConnectWallet();
                  }}
                  className="w-full flex items-center justify-center text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 py-2 rounded border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
                >
                  连接钱包
                </button>
                <button
                  id="wallet-create-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateWallet();
                  }}
                  className="w-full flex items-center justify-center text-xs font-bold bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 py-2 rounded transition-colors cursor-pointer"
                >
                  创建钱包
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Main Address */}
              <div className="flex items-center justify-between py-1 bg-zinc-50 dark:bg-zinc-900/40 rounded px-2">
                <span className="text-xs text-zinc-400">Address</span>
                <AddressDisplay address={address} />
              </div>

              {/* Token balances */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded p-2 border border-zinc-100 dark:border-zinc-900">
                  <span className="text-[10px] text-zinc-400 block uppercase font-medium">ETH Balance</span>
                  <span className="text-sm font-mono font-bold mt-0.5 block">{ethBalance.toFixed(4)}</span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded p-2 border border-zinc-100 dark:border-zinc-900">
                  <span className="text-[10px] text-zinc-400 block uppercase font-medium">USDC Balance</span>
                  <span className="text-sm font-mono font-bold mt-0.5 block text-emerald-600 dark:text-emerald-400">
                    ${usdcBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Control Triggers */}
              <div className="flex gap-2">
                <button
                  id="deposit-trigger-btn"
                  onClick={() => {
                    setShowDepositForm(!showDepositForm);
                    setShowTransferForm(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 py-1.5 px-2 rounded border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Deposit</span>
                </button>
                <button
                  id="transfer-trigger-btn"
                  onClick={() => {
                    setShowTransferForm(!showTransferForm);
                    setShowDepositForm(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-955 py-1.5 px-2 rounded transition-colors cursor-pointer"
                >
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Transfer</span>
                </button>
              </div>

              {/* Deposit Interactive Form */}
              {showDepositForm && (
                <form onSubmit={handleDepositSubmit} className="bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2 mt-1">
                  <div className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">Deposit Mock Funds</div>
                  <div className="flex gap-1.5">
                    <select
                      value={depositToken}
                      onChange={(e) => setDepositToken(e.target.value as 'ETH' | 'USDC')}
                      className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs rounded p-1 font-mono outline-none focus:border-zinc-800 dark:focus:border-zinc-200"
                    >
                      <option value="USDC">USDC</option>
                      <option value="ETH">ETH</option>
                    </select>
                    <input
                      type="number"
                      step="any"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs rounded p-1 flex-1 font-mono outline-none focus:border-zinc-800 dark:focus:border-zinc-200"
                      placeholder="Amount"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setShowDepositForm(false)}
                      className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-[10px] font-semibold px-2.5 py-1 rounded transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                </form>
              )}

              {/* Transfer Interactive Form */}
              {showTransferForm && (
                <form onSubmit={handleTransferSubmit} className="bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2 mt-1">
                  <div className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">On-Chain Transfer</div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-400 uppercase">To Address</label>
                    <input
                      type="text"
                      value={transferAddress}
                      onChange={(e) => setTransferAddress(e.target.value)}
                      className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs rounded p-1 font-mono outline-none focus:border-zinc-800 dark:focus:border-zinc-200"
                      required
                    />
                  </div>

                  <div className="flex gap-1.5">
                    <div className="flex flex-col gap-1 w-20">
                      <label className="text-[9px] text-zinc-400 uppercase">Token</label>
                      <select
                        value={transferToken}
                        onChange={(e) => setTransferToken(e.target.value as 'ETH' | 'USDC')}
                        className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs rounded p-1 font-mono outline-none"
                      >
                        <option value="USDC">USDC</option>
                        <option value="ETH">ETH</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-[9px] text-zinc-400 uppercase">Amount</label>
                      <input
                        type="number"
                        step="any"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs rounded p-1 font-mono outline-none focus:border-zinc-800 dark:focus:border-zinc-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setShowTransferForm(false)}
                      className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-[10px] font-semibold px-2.5 py-1 rounded transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
