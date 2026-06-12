'use client'
import React from 'react';

interface NetworkBadgeProps {
  network: string;
}

export default function NetworkBadge({ network }: NetworkBadgeProps) {
  return (
    <div id="network-badge-container" className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
      <span id="network-badge-dot" className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>{network}</span>
    </div>
  );
}
