'use client'
import React from 'react';
import { Transaction } from '@/lib/types';
import StatusBadge from '../StatusBadge';
import AddressDisplay from '../AddressDisplay';
import { Code2, ArrowDownLeft, ArrowUpRight, Award, Receipt } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const getTypeBadge = (type: Transaction['type']) => {
    switch (type) {
      case 'x402':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/15">
            <Award className="h-2.5 w-2.5" />
            <span>ERC-8004</span>
          </span>
        );
      case 'Transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15">
            <ArrowUpRight className="h-2.5 w-2.5" />
            <span>Transfer</span>
          </span>
        );
      case 'Deposit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">
            <ArrowDownLeft className="h-2.5 w-2.5" />
            <span>Deposit</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-500/10 text-zinc-650 dark:text-zinc-350 border border-zinc-500/15">
            <Receipt className="h-2.5 w-2.5" />
            <span>{type}</span>
          </span>
        );
    }
  };

  if (transactions.length === 0) {
    return (
      <div id="no-tx-container" className="flex flex-col items-center justify-center py-10 text-zinc-400">
        <Receipt className="h-8 w-8 mb-2 opacity-50 stroke-[1.5]" />
        <span className="text-xs font-mono">No transaction records detected.</span>
      </div>
    );
  }

  return (
    <div id="transaction-table-wrapper" className="overflow-x-auto">
      <table id="transaction-ledger" className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500">
            <th className="py-2.5 px-3 w-10 text-center">#</th>
            <th className="py-2.5 px-3 w-20">Time</th>
            <th className="py-2.5 px-3 w-28">Type</th>
            <th className="py-2.5 px-3">Counterparty Address / Entity</th>
            <th className="py-2.5 px-3 w-16 text-center">Token</th>
            <th className="py-2.5 px-3 w-24 text-right">Amount</th>
            <th className="py-2.5 px-3 w-24 text-center">Status</th>
            <th className="py-2.5 px-3 w-32">Tx Hash</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xs font-mono">
          {transactions.map((tx, idx) => (
            <tr 
              key={tx.id} 
              id={`tx-row-${tx.id}`}
              className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/20 transition-colors"
            >
              <td className="py-2.5 px-3 text-center text-zinc-405">{idx + 1}</td>
              <td className="py-2.5 px-3 text-zinc-500">{tx.time}</td>
              <td className="py-2.5 px-3">{getTypeBadge(tx.type)}</td>
              <td className="py-2.5 px-3 font-semibold text-zinc-800 dark:text-zinc-205 truncate max-w-xs" title={tx.counterparty}>
                {tx.counterparty}
              </td>
              <td className="py-2.5 px-3 text-center">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  tx.token === 'USDC' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-zinc-150 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}>
                  {tx.token}
                </span>
              </td>
              <td className={`py-2.5 px-3 text-right font-bold ${
                tx.type === 'Deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-100'
              }`}>
                {tx.type === 'Deposit' ? '+' : '-'}{tx.amount.toFixed(tx.token === 'ETH' ? 4 : 2)}
              </td>
              <td className="py-2.5 px-3 text-center">
                <StatusBadge status={tx.status} />
              </td>
              <td className="py-2.5 px-3">
                {tx.txHash ? <AddressDisplay address={tx.txHash} /> : <span className="text-zinc-400">-</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
