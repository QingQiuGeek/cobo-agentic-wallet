'use client'
import React, { useState } from 'react';
import { ActivityLog as LogType } from '@/lib/types';
import { Search, DollarSign, Send, Eye, Fingerprint, AlertTriangle, Check, Radio, ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityLogProps {
  logs: LogType[];
}

const PAGE_SIZE = 20;

export default function ActivityLog({ logs }: ActivityLogProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const paginatedLogs = logs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getCategoryTheme = (category: LogType['category']) => {
    switch (category) {
      case 'discover':
        return {
          icon: <Search className="h-3.5 w-3.5 text-blue-500" />,
          bgColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          label: 'Discovery',
        };
      case 'pay':
        return {
          icon: <DollarSign className="h-3.5 w-3.5 text-emerald-500" />,
          bgColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          label: 'Payment',
        };
      case 'transfer':
        return {
          icon: <Send className="h-3.5 w-3.5 text-purple-500" />,
          bgColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
          label: 'Transfer',
        };
      case 'query':
        return {
          icon: <Eye className="h-3.5 w-3.5 text-zinc-500" />,
          bgColor: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200/50',
          label: 'Query',
        };
      case 'register':
        return {
          icon: <Fingerprint className="h-3.5 w-3.5 text-cyan-500" />,
          bgColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
          label: 'Registry',
        };
      case 'error':
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />,
          bgColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          label: 'Failure',
        };
      default:
        return {
          icon: <Check className="h-3.5 w-3.5 text-zinc-500" />,
          bgColor: 'bg-zinc-100 text-zinc-600',
          label: 'Operation',
        };
    }
  };

  if (logs.length === 0) {
    return (
      <div id="no-logs-wrapper" className="flex flex-col items-center justify-center py-10 text-zinc-400">
        <Radio className="h-8 w-8 mb-2 opacity-50 stroke-[1.5] animate-pulse" />
        <span className="text-xs font-mono">Operations feed currently idle.</span>
      </div>
    );
  }

  return (
    <div id="activity-log-feed" className="flex flex-col h-full">
      {/* Table Header */}
      <div className="grid grid-cols-[1.25rem_8rem_4rem_minmax(0,1fr)] items-center gap-2 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 shrink-0 bg-white dark:bg-zinc-950">
        <span className="w-5 text-right shrink-0">#</span>
        <span>Time</span>
        <span className="text-center">Type</span>
        <span className="flex-1">Description</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {paginatedLogs.map((log, idx) => {
          const theme = getCategoryTheme(log.category);
          const seq = (currentPage - 1) * PAGE_SIZE + idx + 1;
          return (
            <div
              key={log.id}
              id={`log-line-${log.id}`}
              className="grid grid-cols-[1.25rem_8rem_4rem_minmax(0,1fr)] items-center gap-2 py-2 px-3 border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors h-9"
            >
              {/* Sequence number */}
              <span className="text-[11px] font-mono text-zinc-400 w-5 text-right shrink-0 select-text">
                {seq}
              </span>

              {/* Timestamp */}
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 min-w-0 select-text whitespace-nowrap">
                {log.time}
              </span>

              {/* Category label badge */}
              <span className={`inline-flex h-5 w-16 items-center justify-center justify-self-center rounded-md border px-1 text-[8px] font-mono font-semibold leading-none ${theme.bgColor}`}>
                {theme.label}
              </span>

              {/* Description Text - selectable */}
              <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium flex-1 truncate leading-normal select-text" title={log.description}>
                {log.description}
              </span>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <span className="text-[10px] font-mono text-zinc-400">
            {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, logs.length)} of {logs.length}
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
