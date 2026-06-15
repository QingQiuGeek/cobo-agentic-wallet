'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import {
	ChevronLeft,
	ChevronRight,
	FileSpreadsheet,
	Radio,
	ShoppingBag,
} from 'lucide-react';
import { Transaction, ActivityLog as LogType } from '@/lib/types';
import TransactionTable from './TransactionTable';
import ActivityLog from './ActivityLog';
import ServiceGrid from './ServiceGrid';

interface Service {
	id: string;
	name: string;
	url: string;
	description: string;
	provider: string;
	price: string;
	pricingToken: string;
	network?: string;
	accepts?: unknown[];
}

interface RightPanelProps {
	transactions: Transaction[];
	logs: LogType[];
	onPurchase?: (service: Service) => void;
}

type TabKey = 'apis' | 'tx' | 'logs';

export default function RightPanel({ transactions, logs, onPurchase }: RightPanelProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [activeTab, setActiveTab] = useState<TabKey>('apis');
	const [panelWidth, setPanelWidth] = useState(420);
	const [isResizing, setIsResizing] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);

	const handleResizeStart = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setIsResizing(true);
	}, []);

	useEffect(() => {
		if (!isResizing) return;
		const handleMove = (e: MouseEvent) => {
			setPanelWidth(
				Math.max(280, Math.min(800, window.innerWidth - e.clientX)),
			);
		};
		const handleUp = () => setIsResizing(false);
		document.addEventListener('mousemove', handleMove);
		document.addEventListener('mouseup', handleUp);
		return () => {
			document.removeEventListener('mousemove', handleMove);
			document.removeEventListener('mouseup', handleUp);
		};
	}, [isResizing]);

	const tabItems: { key: TabKey; icon: any; label: string; count?: number }[] =
		[
			{ key: 'apis', icon: ShoppingBag, label: 'Services' },
			{
				key: 'tx',
				icon: FileSpreadsheet,
				label: 'Tx Ledger',
				count: transactions.length,
			},
			{ key: 'logs', icon: Radio, label: 'Logs', count: logs.length },
		];

	return (
		<aside
			ref={panelRef}
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

			{/* Header - aligned with navbar h-14.5 */}
			<div className='h-14.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0'>
				{isCollapsed ? (
					/* Collapsed: only expand button in header */
					<button
						onClick={() => setIsCollapsed(false)}
						className='p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer'
						title='展开面板'
					>
						<ChevronLeft className='h-5 w-5' />
					</button>
				) : (
					/* Expanded: tab bar */
					<>
						<div className='flex gap-1 items-center px-3 flex-1 overflow-x-auto'>
							{tabItems.map((item) => (
								<button
									key={item.key}
									onClick={() => setActiveTab(item.key)}
									className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono font-bold transition-all focus:outline-none cursor-pointer whitespace-nowrap ${
										activeTab === item.key
											? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
											: 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
									}`}
								>
									<item.icon className='h-3 w-3' />
									<span>{item.label}</span>
									{item.count !== undefined && (
										<span className='text-[13px] opacity-60'>
											({item.count})
										</span>
									)}
								</button>
							))}
						</div>
						<button
							onClick={() => setIsCollapsed(true)}
							className='p-1.5 mr-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer shrink-0'
							title='Collapse'
						>
							<ChevronRight className='h-4 w-4' />
						</button>
					</>
				)}
			</div>

			{/* Content or Collapsed Icons */}
			{isCollapsed ? (
				/* Collapsed: tab icons below header */
				<div className='flex-1 flex flex-col items-center gap-2 pt-3 pb-4'>
					{tabItems.map((item) => (
						<button
							key={item.key}
							onClick={() => {
								setActiveTab(item.key);
								setIsCollapsed(false);
							}}
							className={`p-2 rounded-lg transition-colors cursor-pointer ${
								activeTab === item.key
									? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
									: 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
							}`}
							title={item.label}
						>
							<item.icon className='h-5 w-5' />
						</button>
					))}
				</div>
			) : (
				<div className='flex-1 min-h-0'>
					{activeTab === 'apis' && <ServiceGrid onPurchase={onPurchase} />}
					{activeTab === 'tx' && <TransactionTable transactions={transactions} />}
					{activeTab === 'logs' && <ActivityLog logs={logs} />}
				</div>
			)}
		</aside>
	);
}
