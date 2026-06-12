'use client'
import React from 'react';
import { ActivityLog as LogType } from '@/lib/types';
import { Search, DollarSign, Send, Eye, Fingerprint, AlertTriangle, Check, Radio } from 'lucide-react';

interface ActivityLogProps {
  logs: LogType[];
}

export default function ActivityLog({ logs }: ActivityLogProps) {
  
  const getCategoryTheme = (category: LogType['category']) => {
    switch (category) {
      case 'discover':
        return {
          icon: <Search className="h-3.5 w-3.5 text-blue-500" />,
          bgColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-550/20',
          label: 'Discovery',
        };
      case 'pay':
        return {
          icon: <DollarSign className="h-3.5 w-3.5 text-emerald-500" />,
          bgColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-550/20',
          label: 'Payment',
        };
      case 'transfer':
        return {
          icon: <Send className="h-3.5 w-3.5 text-purple-500" />,
          bgColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-550/20',
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
          bgColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-550/20',
          label: 'Registry',
        };
      case 'error':
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />,
          bgColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-550/20',
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
    <div id="activity-log-feed" className="flex flex-col">
      {logs.map((log) => {
        const theme = getCategoryTheme(log.category);
        return (
          <div 
            key={log.id} 
            id={`log-line-${log.id}`}
            className="flex items-center gap-3 py-2 px-4 border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors"
          >
            {/* Timestamp */}
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 w-12 shrink-0">{log.time}</span>
            
            {/* Category icon orb */}
            <div className="flex items-center justify-center p-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shrink-0">
              {theme.icon}
            </div>

            {/* Category label badge */}
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border shrink-0 w-24 text-center ${theme.bgColor}`}>
              {theme.label}
            </span>

            {/* Description Text */}
            <span className="text-xs text-zinc-750 dark:text-zinc-300 font-medium flex-1 truncate leading-normal" title={log.description}>
              {log.description}
            </span>

            {/* Success indicator dot */}
            <span className="shrink-0 flex items-center justify-center">
              {log.status === 'success' ? (
                <span className="h-2 w-2 rounded-full bg-emerald-500" title="Success" />
              ) : log.status === 'pending' ? (
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" title="Executing" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-rose-500" title="Failed" />
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
