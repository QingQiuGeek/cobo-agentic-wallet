'use client';
import { useState } from 'react';
import {
	ChevronRight,
	ChevronDown,
	ExternalLink,
	Copy,
	Check,
	ShoppingCart,
} from 'lucide-react';
import { Service } from './ServiceGrid';

interface ServiceCardProps {
	service: Service;
	onPurchase?: (service: Service) => void;
}

export default function ServiceCard({ service, onPurchase }: ServiceCardProps) {
	const [expanded, setExpanded] = useState(false);
	const [acceptsOpen, setAcceptsOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const [confirming, setConfirming] = useState(false);

	const handleCopyAccepts = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(
				JSON.stringify(service.accepts, null, 2),
			);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {}
	};

	const handlePurchase = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (confirming) {
			// User confirmed
			setConfirming(false);
			onPurchase?.(service);
		} else {
			// Show confirmation
			setConfirming(true);
			setTimeout(() => setConfirming(false), 5000); // Auto-cancel after 5s
		}
	};

	return (
		<div className='border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors overflow-hidden'>
			{/* Header row */}
			<div
				onClick={() => setExpanded(!expanded)}
				className='flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none'
			>
				{expanded ? (
					<ChevronDown className='h-3.5 w-3.5 text-zinc-400 shrink-0' />
				) : (
					<ChevronRight className='h-3.5 w-3.5 text-zinc-400 shrink-0' />
				)}

				<span
					className='text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate flex-1 min-w-0'
					title={service.name}
				>
					{service.name}
				</span>

				<span className='font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0'>
					{service.price} {service.pricingToken}
				</span>

				{service.network && (
					<span className='text-[9px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0'>
						{service.network}
					</span>
				)}
			</div>

			{/* Expanded content */}
			{expanded && (
				<div className='px-3 pb-3 space-y-2 border-t border-zinc-100 dark:border-zinc-800'>
					{/* Link + Purchase buttons */}
					<div className='flex items-center gap-2 mt-2'>
						{onPurchase && (
							<button
								onClick={handlePurchase}
								className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded transition-colors ${
									confirming
										? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20'
										: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
								}`}
							>
								<ShoppingCart className='h-3 w-3' />
								<span>{confirming ? '确认购买?' : 'Purchase'}</span>
							</button>
						)}

						{service.url && (
							<a
								href={service.url}
								target='_blank'
								rel='noopener noreferrer'
								className='flex items-center gap-1.5 text-[11px] text-blue-500 hover:underline'
								onClick={(e) => e.stopPropagation()}
							>
								<ExternalLink className='h-3 w-3' />
								<span>Link</span>
							</a>
						)}
					</div>

					{/* Description */}
					<span className='text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed'>
						服务介绍：
						{service.description ? service.description : '暂无'}
					</span>

					{/* Accepts JSON card */}
					{service.accepts && service.accepts.length > 0 && (
						<div className='border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden'>
							<div
								onClick={(e) => {
									e.stopPropagation();
									setAcceptsOpen(!acceptsOpen);
								}}
								className='flex items-center justify-between px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 cursor-pointer'
							>
								<div className='flex items-center gap-1.5'>
									{acceptsOpen ? (
										<ChevronDown className='h-3 w-3 text-zinc-400' />
									) : (
										<ChevronRight className='h-3 w-3 text-zinc-400' />
									)}
									<span className='text-[10px] font-mono text-zinc-500'>
										accepts ({service.accepts.length})
									</span>
								</div>
								<button
									onClick={handleCopyAccepts}
									className='p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors'
									title='复制 JSON'
								>
									{copied ? (
										<Check className='h-3 w-3 text-emerald-500' />
									) : (
										<Copy className='h-3 w-3 text-zinc-400' />
									)}
								</button>
							</div>

							{acceptsOpen && (
								<div className='max-h-[300px] overflow-auto bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800'>
									<pre className='p-3 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre overflow-x-auto'>
										{JSON.stringify(service.accepts, null, 2)}
									</pre>
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
