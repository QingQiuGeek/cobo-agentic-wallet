'use client'
import { useState } from 'react';
import { Transaction } from '@/lib/types';
import StatusBadge from '../StatusBadge';
import AddressDisplay from '../AddressDisplay';
import { ArrowDownLeft, ArrowUpRight, Award, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
}

const PAGE_SIZE = 20;

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const paginatedTxs = transactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getTypeBadge = (type: Transaction['type']) => {
    switch (type) {
      case 'x402':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/15">
            <Award className="h-2.5 w-2.5" />
            <span>x402</span>
          </span>
        );
      case 'Transfer':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15">
            <ArrowUpRight className="h-2.5 w-2.5" />
            <span>Tx</span>
          </span>
        );
      case 'Deposit':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">
            <ArrowDownLeft className="h-2.5 w-2.5" />
            <span>Dep</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border border-zinc-500/15">
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
    <div id="transaction-table-wrapper" className="flex flex-col h-full">
      <div className="flex-1 overflow-x-auto">
        <table id="transaction-ledger" className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white dark:bg-zinc-950 z-10">
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500">
              <th className="py-2 px-2 w-8 text-center">#</th>
              <th className="py-2 px-2 w-36">Time</th>
              <th className="py-2 px-2 w-16">Type</th>
              <th className="py-2 px-2">From</th>
              <th className="py-2 px-2">To</th>
              <th className="py-2 px-2 w-14 text-center">Token</th>
              <th className="py-2 px-2 w-20 text-right">Amount</th>
              <th className="py-2 px-2 w-16 text-center">Status</th>
              <th className="py-2 px-2 w-28">Tx Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-[11px] font-mono">
            {paginatedTxs.map((tx, idx) => (
              <tr
                key={tx.id}
                id={`tx-row-${tx.id}`}
                className="h-9 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/20 transition-colors"
              >
                <td className="py-1.5 px-2 text-center text-zinc-400 select-text">{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                <td className="py-1.5 px-2 text-zinc-500 select-text whitespace-nowrap">{tx.time}</td>
                <td className="py-1.5 px-2">{getTypeBadge(tx.type)}</td>
                <td className="py-1.5 px-2 font-semibold text-zinc-800 dark:text-zinc-200">
                  {tx.from?.startsWith('0x') ? (
                    <AddressDisplay address={tx.from} />
                  ) : (
                    <span className="select-text" title={tx.from}>{tx.from || '—'}</span>
                  )}
                </td>
                <td className="py-1.5 px-2 font-semibold text-zinc-800 dark:text-zinc-200">
                  {tx.to?.startsWith('0x') ? (
                    <AddressDisplay address={tx.to} />
                  ) : (
                    <span className="select-text" title={tx.to}>{tx.to || '—'}</span>
                  )}
                </td>
                <td className="py-1.5 px-2 text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                      tx.token === 'USDC' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}>
                      {tx.token}
                    </span>
                    <span className="text-[8px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 rounded">测试网</span>
                  </div>
                </td>
                <td className={`py-1.5 px-2 text-right font-bold select-text ${
                  tx.type === 'Deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-100'
                }`}>
                  {tx.type === 'Deposit' ? '+' : '-'}{tx.amount.toFixed(tx.token === 'ETH' ? 4 : 2)}
                </td>
                <td className="py-1.5 px-2 text-center">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="py-1.5 px-2">
                  {tx.txHash ? <AddressDisplay address={tx.txHash} /> : <span className="text-zinc-400">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <span className="text-[10px] font-mono text-zinc-400">
            {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, transactions.length)} of {transactions.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-6 h-6 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                  page === currentPage
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                    : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
