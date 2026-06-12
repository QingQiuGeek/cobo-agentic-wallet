'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
	ChevronLeft,
	ChevronRight,
	FileSpreadsheet,
	Radio,
} from 'lucide-react';
import { Transaction, ActivityLog as LogType } from '@/lib/types';
import TransactionTable from './TransactionTable';
import ActivityLog from './ActivityLog';

interface RightPanelProps {
	transactions: Transaction[];
	logs: LogType[];
}

export default function RightPanel({ transactions, logs }: RightPanelProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [activeTab, setActiveTab] = useState<'tx' | 'logs'>('tx');
	const [panelWidth, setPanelWidth] = useState(420);
	const [isResizing, setIsResizing] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);

	// Resize handlers
	const handleResizeStart = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setIsResizing(true);
	}, []);

	useEffect(() => {
		if (!isResizing) return;

		const handleResizeMove = (e: MouseEvent) => {
			const newWidth = window.innerWidth - e.clientX;
			setPanelWidth(Math.max(280, Math.min(800, newWidth)));
		};

		const handleResizeEnd = () => {
			setIsResizing(false);
		};

		document.addEventListener('mousemove', handleResizeMove);
		document.addEventListener('mouseup', handleResizeEnd);
		return () => {
			document.removeEventListener('mousemove', handleResizeMove);
			document.removeEventListener('mouseup', handleResizeEnd);
		};
	}, [isResizing]);

	return (
		<aside
			ref={panelRef}
			id='right-panel'
			className='h-full border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0 relative select-none'
			style={{ width: isCollapsed ? 48 : panelWidth }}
		>
			{/* Resize handle */}
			{!isCollapsed && (
				<div
					onMouseDown={handleResizeStart}
					className='absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors z-10'
					style={{ marginLeft: '-2px' }}
				/>
			)}

			{/* Header with tabs */}
			<div className='h-14.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center shrink-0'>
				{!isCollapsed && (
					/* Expanded: horizontal tab bar */
					<>
						<div className='flex gap-1 items-center px-3 flex-1 overflow-x-auto'>
							<button
								onClick={() => setActiveTab('tx')}
								className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono font-bold transition-all focus:outline-none cursor-pointer whitespace-nowrap ${
									activeTab === 'tx'
										? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
										: 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
								}`}
							>
								<FileSpreadsheet className='h-3 w-3' />
								<span>Tx Logs</span>
								<span className='text-[13px] opacity-60'>
									({transactions.length})
								</span>
							</button>

							<button
								onClick={() => setActiveTab('logs')}
								className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono font-bold transition-all focus:outline-none cursor-pointer whitespace-nowrap ${
									activeTab === 'logs'
										? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
										: 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
								}`}
							>
								<Radio className='h-3 w-3' />
								<span>Agent Logs</span>
								<span className='text-[13px] opacity-60'>({logs.length})</span>
							</button>
						</div>

						<button
							onClick={() => setIsCollapsed(true)}
							className='p-1.5 mr-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer shrink-0'
							title='Collapse panel'
						>
							<ChevronRight className='h-4 w-4' />
						</button>
					</>
				)}
			</div>

			{/* Content Area */}
			{isCollapsed ? (
				<div className='flex flex-col items-center gap-1 pt-3 w-full'>
					<button
						onClick={() => {
							setActiveTab('tx');
							setIsCollapsed(false);
						}}
						className={`p-1.5 rounded transition-colors cursor-pointer ${
							activeTab === 'tx'
								? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
								: 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
						}`}
						title='Transaction Ledger'
					>
						<FileSpreadsheet className='h-4 w-4' />
					</button>
					<button
						onClick={() => {
							setActiveTab('logs');
							setIsCollapsed(false);
						}}
						className={`p-1.5 rounded transition-colors cursor-pointer ${
							activeTab === 'logs'
								? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
								: 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
						}`}
						title='Activity Logs'
					>
						<Radio className='h-4 w-4' />
					</button>
					<button
						onClick={() => setIsCollapsed(false)}
						className='p-1.5 rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer mt-1'
						title='Expand panel'
					>
						<ChevronLeft className='h-4 w-4' />
					</button>
				</div>
			) : (
				<div className='flex-1 overflow-y-auto overflow-x-hidden'>
					{activeTab === 'tx' ? (
						<div className='p-2'>
							<TransactionTable transactions={transactions} />
						</div>
					) : (
						<div className='p-1'>
							<ActivityLog logs={logs} />
						</div>
					)}
				</div>
			)}
		</aside>
	);
}
