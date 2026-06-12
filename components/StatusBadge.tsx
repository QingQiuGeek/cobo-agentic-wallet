'use client'
import React from 'react';
import { CheckCircle2, Loader2, XCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'pending' | 'failed' | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'success':
      return (
        <span id="status-badge-success" className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" />
          <span>Success</span>
        </span>
      );
    case 'pending':
      return (
        <span id="status-badge-pending" className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono text-xs font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Pending</span>
        </span>
      );
    case 'failed':
      return (
        <span id="status-badge-failed" className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-mono text-xs font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
          <XCircle className="h-3 w-3" />
          <span>Failed</span>
        </span>
      );
    default:
      return (
        <span id="status-badge-unknown" className="inline-flex items-center gap-1 text-zinc-500 font-mono text-xs font-semibold bg-zinc-500/10 px-2 py-0.5 rounded-full">
          <AlertCircle className="h-3 w-3" />
          <span>{status}</span>
        </span>
      );
  }
}
