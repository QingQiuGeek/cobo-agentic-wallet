'use client'
import React from 'react';
import { Search, Coins, Hammer, Check, X, Loader2, Sparkles } from 'lucide-react';
import { ToolCall } from '@/lib/types';

export default function ToolCallCard({ id, name, parameters, result, status }: ToolCall) {
  const getToolIcon = () => {
    switch (name) {
      case 'discoverServices':
        return <Search className="h-4 w-4 text-blue-500" />;
      case 'callPaidAPI':
      case 'settleMicroPayment':
        return <Coins className="h-4 w-4 text-emerald-500" />;
      default:
        return <Hammer className="h-4 w-4 text-purple-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1 text-[10px] text-zinc-550 dark:text-zinc-400 font-medium">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Executing</span>
          </span>
        );
      case 'success':
        return (
          <span className="flex items-center gap-1 text-[10px] text-emerald-650 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
            <Check className="h-3 w-3" />
            <span>Success</span>
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-[10px] text-rose-650 dark:text-rose-450 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded">
            <X className="h-3 w-3" />
            <span>Failed</span>
          </span>
        );
    }
  };

  return (
    <div id={`tool-call-card-${id}`} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 my-2.5 bg-white dark:bg-zinc-950/60 shadow-sm animate-in slide-in-from-top-1 fade-in duration-200">
      {/* Header boundary */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          {getToolIcon()}
          <span className="text-xs font-mono font-bold text-zinc-805 dark:text-zinc-200">{name}</span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Parameter entries (monospace layout) */}
      <div className="flex flex-col gap-1.5 text-[11px] font-mono leading-normal">
        <div>
          <span className="text-zinc-400 dark:text-zinc-500 mr-1.5">&#62; Input parameters:</span>
          <pre className="bg-zinc-50 dark:bg-zinc-900/60 p-1.5 rounded overflow-x-auto text-zinc-700 dark:text-zinc-300 border border-zinc-150 dark:border-zinc-900 mt-1">
            {JSON.stringify(parameters, null, 2)}
          </pre>
        </div>

        {status !== 'running' && (
          <div className="mt-1">
            <span className="text-zinc-400 dark:text-zinc-500 mr-1.5">&#62; Output results:</span>
            <pre className="bg-zinc-50 dark:bg-zinc-900/60 p-1.5 rounded overflow-x-auto text-zinc-700 dark:text-zinc-350 border border-zinc-150 dark:border-zinc-900 mt-1 max-h-48 scrollbar-thin">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
