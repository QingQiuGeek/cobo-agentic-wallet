'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, ShoppingBag, RefreshCw, AlertCircle } from 'lucide-react';
import ServiceCard from './ServiceCard';
import PaginatedList from './PaginatedList';

export interface Service {
	id: string;
	name: string;
	url: string;
	description: string;
	provider: string;
	icon: string;
	price: string;
	pricingToken: string;
	network?: string;
	accepts?: unknown[];
}

interface CacheEntry {
	services: Service[];
	timestamp: number;
}

interface ServiceGridProps {
	onPurchase?: (service: Service) => void;
}

const PAGE_SIZE = 20;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Per-page cache keyed by "offset:query"
const pageCache = new Map<string, CacheEntry>();
let cachedTotal = 0;
let cachedSource = '';

function getCacheKey(offset: number, query: string) {
	return `${offset}:${query}`;
}

export default function ServiceGrid({ onPurchase }: ServiceGridProps) {
	const firstPage = pageCache.get(getCacheKey(0, ''));
	const [services, setServices] = useState<Service[]>(firstPage?.services || []);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalItems, setTotalItems] = useState(cachedTotal || 0);
	const [source, setSource] = useState(cachedSource || '');
	const [cacheRemaining, setCacheRemaining] = useState(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Cache countdown timer
	useEffect(() => {
		const updateCountdown = () => {
			if (pageCache.size > 0) {
				// Use the newest timestamp across all cached pages
				const newest = Math.max(...Array.from(pageCache.values()).map(e => e.timestamp));
				const elapsed = Date.now() - newest;
				const remaining = Math.max(0, Math.ceil((CACHE_TTL - elapsed) / 1000));
				setCacheRemaining(remaining);
				if (remaining <= 0) {
					fetchServices(0, '', true);
				}
			} else {
				setCacheRemaining(0);
			}
		};

		updateCountdown();
		intervalRef.current = setInterval(updateCountdown, 1000);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, []);

	const fetchServices = useCallback(
		async (offset = 0, query = '', force = false) => {
			const cacheKey = getCacheKey(offset, query);

			// Check per-page cache
			if (!force) {
				const cached = pageCache.get(cacheKey);
				if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
					setServices(cached.services);
					setTotalItems(cachedTotal);
					setSource(cachedSource);
					setError(null);
					return;
				}
			}

			try {
				setIsLoading(true);
				setError(null);

				const params = new URLSearchParams({
					limit: String(PAGE_SIZE),
					offset: String(offset),
				});
				if (query) params.set('query', query);

				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 60000);

				const response = await fetch(`/api/services?${params}`, {
					signal: controller.signal,
				});
				clearTimeout(timeoutId);

				const data = await response.json();

				if (data.success) {
					const newServices = data.services || [];
					const newTotal = data.total || newServices.length || 0;
					setServices(newServices);
					setTotalItems(newTotal);
					setSource(data.source || '');
					setError(null);

					// Cache this page
					pageCache.set(cacheKey, {
						services: newServices,
						timestamp: Date.now(),
					});
					cachedTotal = newTotal;
					cachedSource = data.source || '';
				} else {
					setError(data.error || 'Failed to fetch services');
				}
			} catch (err: unknown) {
				if (err instanceof Error && err.name === 'AbortError') {
					setError('请求超时，请重试');
				} else {
					setError(
						err instanceof Error ? err.message : 'Failed to fetch services',
					);
				}
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	const [initialized, setInitialized] = useState(pageCache.size > 0);
	if (!initialized) {
		setInitialized(true);
		fetchServices(0, '');
	}

	const handleSearch = () => {
		setCurrentPage(1);
		fetchServices(0, searchQuery, true);
	};

	const handleRefresh = () => {
		pageCache.clear();
		cachedTotal = 0;
		cachedSource = '';
		setCurrentPage(1);
		setError(null);
		fetchServices(0, '', true);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		fetchServices((page - 1) * PAGE_SIZE, searchQuery);
	};

	// Source label
	const sourceLabel =
		source === 'none'
			? 'Discovery Failed'
			: source === 'fallback'
				? 'Fallback Services'
				: 'CoinBase Bazaar Discovery';

	return (
		<div className='flex flex-col h-full min-h-0'>
			{/* Search bar */}
			<div className='flex gap-2 p-2 border-b border-zinc-200 dark:border-zinc-800 shrink-0'>
				<input
					type='text'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
					placeholder='从 CoinBase Bazaar 搜索可用服务...'
					className='flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1.5 text-xs font-mono outline-none focus:border-zinc-400 dark:focus:border-zinc-600'
				/>
				<button
					onClick={handleSearch}
					className='px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors'
				>
					<Search className='h-3.5 w-3.5' />
				</button>
				<button
					onClick={handleRefresh}
					disabled={isLoading}
					className='px-2 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50'
					title='刷新'
				>
					<RefreshCw
						className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
					/>
				</button>
			</div>

			{/* Source + cache countdown */}
			{source && !error && (
				<div className='px-3 py-1 text-[9px] text-zinc-400 border-b border-zinc-100 dark:border-zinc-900 shrink-0 flex items-center justify-between'>
					<span>Source: {sourceLabel}</span>
					{cacheRemaining > 0 && (
						<span className='opacity-60'>
							Cache: {Math.floor(cacheRemaining / 60)}:
							{String(cacheRemaining % 60).padStart(2, '0')}
						</span>
					)}
				</div>
			)}

			{/* Paginated service list — PaginatedList owns scroll + fixed pagination bar */}
			<PaginatedList
				total={error ? 0 : Math.max(totalItems, services.length)}
				currentPage={currentPage}
				pageSize={PAGE_SIZE}
				onPageChange={handlePageChange}
				label='services'
				isLoading={isLoading}
				emptyMessage={error || 'No services found'}
				emptyIcon={
					error ? (
						<AlertCircle className='h-6 w-6 mb-2 opacity-50' />
					) : (
						<ShoppingBag className='h-6 w-6 mb-2 opacity-50' />
					)
				}
			>
				<div className='flex flex-col gap-2 p-2'>
				{error && (
					<div className='px-3 py-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded'>
						<AlertCircle className='h-4 w-4 shrink-0' />
						<span className='flex-1'>{error}</span>
						<button
							onClick={handleRefresh}
							className='text-[10px] underline hover:no-underline'
						>
							重试
						</button>
					</div>
				)}
				{services.map((service) => (
					<ServiceCard
						key={service.id}
						service={service}
						onPurchase={onPurchase}
					/>
				))}
			</div>
			</PaginatedList>
		</div>
	);
}
