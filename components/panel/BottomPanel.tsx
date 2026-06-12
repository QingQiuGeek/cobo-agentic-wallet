'use client'
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, History, Radio, FileSpreadsheet } from 'lucide-react';
import { Transaction, ActivityLog as LogType } from '@/lib/types';
import TransactionTable from './TransactionTable';
import ActivityLog from './ActivityLog';

interface BottomPanelProps {
  transactions: Transaction[];
  logs: LogType[];
}

export default function BottomPanel({ transactions, logs }: BottomPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'tx' | 'logs'>('tx');

  return (
    <div 
      id="bottom-collapsible-panel" 
      className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col transition-all duration-300 ease-in-out font-sans shadow-[0_-2px_10px_rgba(0,0,0,0.02)] shrink-0"
      style={{ height: isCollapsed ? '44px' : '280px' }}
    >
      {/* Upper Tab switcher header row */}
      <div className="h-11 border-b border-zinc-150 dark:border-zinc-900 px-4.5 flex items-center justify-between select-none">
        <div className="flex gap-1.5 items-center">
          {/* Tx Trigger */}
          <button
            id="tab-trigger-tx"
            onClick={() => {
              setActiveTab('tx');
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all focus:outline-none cursor-pointer ${
              activeTab === 'tx' && !isCollapsed
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Transaction Ledger</span>
            <span className="text-[10px] opacity-70">({transactions.length})</span>
          </button>

          {/* Logs Trigger */}
          <button
            id="tab-trigger-logs"
            onClick={() => {
              setActiveTab('logs');
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all focus:outline-none cursor-pointer ${
              activeTab === 'logs' && !isCollapsed
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Security Action Logs</span>
            <span className="text-[10px] opacity-70">({logs.length})</span>
          </button>
        </div>

        {/* Right Collapsible controller */}
        <button
          id="panel-toggle-collapse"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer"
          title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Content Area */}
      {!isCollapsed && (
        <div id="panel-content-area" className="flex-1 overflow-y-auto bg-zinc-50/15 dark:bg-zinc-950/20">
          {activeTab === 'tx' ? (
            <div className="p-3">
              <TransactionTable transactions={transactions} />
            </div>
          ) : (
            <div className="p-1">
              <ActivityLog logs={logs} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
