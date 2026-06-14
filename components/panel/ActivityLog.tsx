'use client'
import { useState } from 'react';
import { ActivityLog as LogType } from '@/lib/types';
import { Search, DollarSign, Send, Eye, Fingerprint, AlertTriangle, Radio } from 'lucide-react';
import PaginatedList from './PaginatedList';

interface ActivityLogProps {
  logs: LogType[];
}

const PAGE_SIZE = 20;

export default function ActivityLog({ logs }: ActivityLogProps) {
  const [currentPage, setCurrentPage] = useState(1);
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
          icon: <Search className="h-3.5 w-3.5 text-zinc-500" />,
          bgColor: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200/50',
          label: 'Operation',
        };
    }
  };

  return (
    <PaginatedList
      total={logs.length}
      currentPage={currentPage}
      pageSize={PAGE_SIZE}
      onPageChange={setCurrentPage}
      label="logs"
      emptyMessage="No audit logs found"
      emptyIcon={<Radio className="h-8 w-8 mb-2 opacity-50 stroke-[1.5] animate-pulse" />}
    >
      {/* Table Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 sticky top-0 bg-white dark:bg-zinc-950 z-10">
        <span className="w-5 text-right shrink-0">#</span>
        <span className="w-36 shrink-0">Time</span>
        <span className="w-16 shrink-0 text-center">Type</span>
        <span className="flex-1">Description</span>
      </div>

      {/* Log entries */}
      {paginatedLogs.map((log, idx) => {
        const theme = getCategoryTheme(log.category);
        const seq = (currentPage - 1) * PAGE_SIZE + idx + 1;
        return (
          <div
            key={log.id}
            className="flex items-center gap-2 py-2 px-3 border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors h-9"
          >
            <span className="text-[9px] font-mono text-zinc-300 dark:text-zinc-600 w-5 text-right shrink-0 select-text">
              {seq}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 w-36 shrink-0 select-text whitespace-nowrap">
              {log.time}
            </span>
            <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full border shrink-0 w-16 text-center ${theme.bgColor}`}>
              {theme.label}
            </span>
            <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium flex-1 truncate leading-normal select-text" title={log.description}>
              {log.description}
            </span>
          </div>
        );
      })}
    </PaginatedList>
  );
}
