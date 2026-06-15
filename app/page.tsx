'use client';

import { useState, useRef, useEffect } from 'react';
import { INITIAL_CHAINS, INITIAL_CHAT_MESSAGES } from '@/data/mockData';
import {
	ChainStatus,
	Transaction,
	ActivityLog as LogType,
	ChatMessage as ChatMessageType,
	ToolCall,
} from '@/lib/types';

// Layout Components
import NetworkBadge from '@/components/NetworkBadge';
import ThemeToggle from '@/components/ThemeToggle';
import WalletCard from '@/components/sidebar/WalletCard';
import FaucetCard from '@/components/sidebar/FaucetCard';
import RegistrationCard from '@/components/sidebar/RegistrationCard';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import RightPanel from '@/components/panel/RightPanel';

// Modals
import RegisterConfirmModal from '@/components/modals/RegisterConfirmModal';
import WalletCreateModal from '@/components/modals/WalletCreateModal';

// Lucide Icons
import { Loader2, Settings } from 'lucide-react';
import Image from 'next/image';

// Helper: Format ISO timestamp to YYYY-MM-DD HH:mm:ss
function formatTime(isoString: string): string {
	if (!isoString) return '—';
	try {
		const d = new Date(isoString);
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
	} catch {
		return isoString;
	}
}

// Helper: Get token symbol from token_id
function getTokenSymbol(tokenId: string): string {
	if (!tokenId) return '?';
	if (tokenId.includes('USDC')) return 'USDC';
	if (tokenId.includes('USDT')) return 'USDT';
	if (tokenId.includes('ETH')) return 'ETH';
	if (tokenId.includes('SOL')) return 'SOL';
	return tokenId.split('_').pop() || tokenId;
}

// Helper: Map audit action to category
function getAuditCategory(
	action: string,
): 'pay' | 'transfer' | 'register' | 'query' | 'discover' {
	if (!action) return 'query';
	if (action.includes('transfer') || action.includes('payment')) return 'pay';
	if (action.includes('contract')) return 'register';
	if (action.includes('address') || action.includes('balance')) return 'query';
	return 'query';
}

// Helper: Format audit action to human-readable
function formatAuditAction(action: string): string {
	if (!action) return 'Operation';
	const map: Record<string, string> = {
		'wallet.read': '查询钱包信息',
		'wallet.address.list': '查询钱包地址',
		'wallet.balances': '查询余额',
		'user_transaction.list': '查询交易记录',
		'transfer.initiate': '发起转账',
		'contract_call.initiate': '调用合约',
		'payment.initiate': '发起支付',
	};
	return map[action] || action;
}

function AgentThinkingIndicator({ toolNames }: { toolNames: string[] }) {
	const [expanded, setExpanded] = useState(false);
	const uniqueTools = Array.from(new Set(toolNames.filter(Boolean)));
	const hasTools = uniqueTools.length > 0;

	return (
		<div className='mb-4 mx-1.5'>
			<div
				onClick={() => hasTools && setExpanded(!expanded)}
				className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${hasTools ? 'cursor-pointer' : ''}`}
			>
				<Loader2 className='h-3.5 w-3.5 animate-spin text-emerald-500' />
				<span className='font-medium'>
					{hasTools ? '正在调用工具' : '思考中'}
				</span>
				{hasTools && (
					<span className='ml-auto font-mono text-[11px] text-zinc-400'>
						{uniqueTools.length} 个工具
					</span>
				)}
				<span
					className='flex gap-0.5'
					aria-hidden='true'
				>
					<span className='animate-pulse'>.</span>
					<span className='animate-pulse [animation-delay:120ms]'>.</span>
					<span className='animate-pulse [animation-delay:240ms]'>.</span>
				</span>
			</div>
			{expanded && hasTools && (
				<div className='mt-1 ml-4 border-l-2 border-zinc-200 dark:border-zinc-700 pl-3 space-y-1'>
					{uniqueTools.map((tool, i) => (
						<div
							key={i}
							className='text-[10px] font-mono text-zinc-500 dark:text-zinc-400'
						>
							<span className='text-emerald-600 dark:text-emerald-400'>●</span>{' '}
							{tool}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default function Home() {
	// Global App States
	const agentId =
		process.env.NEXT_PUBLIC_AGENT_ID || 'caw_agent_906ad75e6d7c7a6c';
	const [agentName, setAgentName] = useState('CoboAgent');
	const [walletAddress, setWalletAddress] = useState(
		process.env.NEXT_PUBLIC_AGENT_WALLET_EVM_ADDRESS ||
			'0xe6cf852aaac38144662c4f3af11c3d54197000e2',
	);
	const [isWalletConnected, setIsWalletConnected] = useState(false);
	const [walletUuid, setWalletUuid] = useState('');

	// Lists
	const [chains, setChains] = useState<ChainStatus[]>(INITIAL_CHAINS);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [logs, setLogs] = useState<LogType[]>([]);
	const [chatMessages, setChatMessages] = useState<ChatMessageType[]>(
		INITIAL_CHAT_MESSAGES,
	);
	const abortControllerRef = useRef<AbortController | null>(null);

	// Stop agent processing
	const handleStop = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
		setIsAgentReplying(false);
	};

	// 1. Fetch wallet status on mount (once)
	useEffect(() => {
		const fetchWalletStatus = async () => {
			try {
				const statusResp = await fetch('/api/wallet/status');
				const statusData = await statusResp.json();
				if (statusData.success && statusData.connected) {
					setIsWalletConnected(true);
					setWalletUuid(statusData.wallet?.uuid || '');
					if (statusData.wallet?.evmAddress) {
						setWalletAddress(statusData.wallet.evmAddress);
					}
				} else {
					setIsWalletConnected(false);
				}
			} catch (e) {
				console.error('Failed to fetch wallet status:', e);
			}
		};
		fetchWalletStatus();
	}, []);

	// 2. Poll transaction records every 3 seconds
	useEffect(() => {
		if (!isWalletConnected) return;

		const fetchTransactions = async () => {
			try {
				const txResponse = await fetch('/api/wallet/transactions?limit=20');
				const txData = await txResponse.json();
				const txList = Array.isArray(txData.result) ? txData.result : [];
				if (txData.success && txList.length > 0) {
					const realTransactions = txList.map((tx: any, idx: number) => ({
						id: idx + 1,
						time: formatTime(tx.created_at),
						type:
							tx.type === 'transfer'
								? 'Transfer'
								: tx.type === 'deposit'
									? 'Deposit'
									: 'x402',
						from: tx.src_address || '—',
						to: tx.dst_address || '—',
						token: getTokenSymbol(tx.token_id),
						amount: parseFloat(tx.amount || '0'),
						status:
							tx.status_display === 'Success'
								? 'success'
								: tx.status_display === 'Pending'
									? 'pending'
									: 'failed',
						txHash: tx.transaction_hash || tx.id,
					}));
					setTransactions(realTransactions);
				}
			} catch (e) {
				console.error('Failed to fetch transactions:', e);
			}
		};

		// Initial fetch
		fetchTransactions();
		// Poll every 3 seconds
		const interval = setInterval(fetchTransactions, 3000);
		return () => clearInterval(interval);
	}, [isWalletConnected]);

	// 3. SSE for audit logs
	useEffect(() => {
		if (!isWalletConnected) return;

		let eventSource: EventSource | null = null;

		const connectSSE = () => {
			eventSource = new EventSource('/api/wallet/audit/stream');

			eventSource.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					if (data.type === 'audit_log') {
						const log = data.log;
						const newLog: LogType = {
							id: log.id || Date.now(),
							time: formatTime(log.created_at),
							category: getAuditCategory(log.action),
							description: `${formatAuditAction(log.action)}: ${log.result || 'completed'}`,
							status:
								log.result === 'allowed'
									? 'success'
									: log.result === 'denied'
										? 'failed'
										: 'pending',
						};
						setLogs((prev) => [newLog, ...prev].slice(0, 100)); // Keep max 100 logs
					}
				} catch (e) {
					console.error('SSE parse error:', e);
				}
			};

			eventSource.onerror = () => {
				// Reconnect after 5 seconds
				setTimeout(() => {
					if (eventSource) eventSource.close();
					connectSSE();
				}, 5000);
			};
		};

		// Also fetch initial audit logs
		const fetchInitialLogs = async () => {
			try {
				const auditResponse = await fetch('/api/wallet/audit?limit=20');
				const auditData = await auditResponse.json();
				const auditItems = auditData.result?.items || [];
				if (auditData.success && auditItems.length > 0) {
					const realLogs = auditItems.map((log: any, idx: number) => ({
						id: idx + 1,
						time: formatTime(log.created_at),
						category: getAuditCategory(log.action),
						description: `${formatAuditAction(log.action)}: ${log.result || 'completed'}`,
						status:
							log.result === 'allowed'
								? 'success'
								: log.result === 'denied'
									? 'failed'
									: 'pending',
					}));
					setLogs(realLogs);
				}
			} catch (e) {
				console.error('Failed to fetch initial audit logs:', e);
			}
		};

		fetchInitialLogs();
		connectSSE();

		return () => {
			if (eventSource) eventSource.close();
		};
	}, [isWalletConnected]);

	// Auxiliary UI controls
	const [isAgentReplying, setIsAgentReplying] = useState(false);
	const [pendingChainToRegister, setPendingChainToRegister] =
		useState<ChainStatus | null>(null);
	const [showConfigModal, setShowConfigModal] = useState(false);
	const [toastMessage, setToastMessage] = useState<{
		text: string;
		type: 'success' | 'info' | 'error';
	} | null>(null);

	const messageEndRef = useRef<HTMLDivElement>(null);
	const activeToolNames = chatMessages
		.filter((msg) => msg.sender === 'agent')
		.flatMap((msg) => msg.toolCalls ?? [])
		.filter((call) => call.status === 'running')
		.map((call) => call.name);

	// Auto scroll to latest chats
	useEffect(() => {
		messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [chatMessages, isAgentReplying]);

	// Toast utility helper
	const showToast = (
		text: string,
		type: 'success' | 'info' | 'error' = 'success',
	) => {
		setToastMessage({ text, type });
		setTimeout(() => {
			setToastMessage(null);
		}, 4000);
	};

	// 3. Initiate ERC-8004 Registry
	const initiateRegistration = (chain: ChainStatus) => {
		setPendingChainToRegister(chain);
	};

	// Execute actual registry
	const confirmRegistration = () => {
		if (!pendingChainToRegister) return;

		const targetChain = pendingChainToRegister;
		setPendingChainToRegister(null);

		setChains((prev) =>
			prev.map((c) =>
				c.chainId === targetChain.chainId
					? { ...c, status: 'loading' as const }
					: c,
			),
		);

		const timeNow = new Date().toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});

		setChatMessages((prev) => [
			...prev,
			{
				id: 'user-reg-' + Date.now(),
				sender: 'user' as const,
				time: timeNow,
				content: `Register CoboAgenticWallet identifiers to ${targetChain.name} secure endpoint.`,
			},
		]);

		setIsAgentReplying(true);

		setTimeout(() => {
			const settleTime = new Date().toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
			});
			const mintedTokenId = '#' + Math.floor(10000 + Math.random() * 90000);
			const randomTxHash =
				'0x' +
				Array.from({ length: 40 }, () =>
					Math.floor(Math.random() * 16).toString(16),
				).join('');

			const gasCost = 0.0012;

			setChains((prev) =>
				prev.map((c) =>
					c.chainId === targetChain.chainId
						? {
								...c,
								registered: true,
								status: 'active' as const,
								tokenId: mintedTokenId,
							}
						: c,
				),
			);

			const toolC: ToolCall = {
				id: 'tool-reg-' + Date.now(),
				name: 'registerERC8004Identifier',
				parameters: {
					chain: targetChain.chainId,
					registry: targetChain.registryAddress,
					agentId: agentName,
					authorizedKeys: [walletAddress],
				},
				result: {
					success: true,
					tokenId: mintedTokenId,
					mintReceipt: randomTxHash,
					gasSettleETH: gasCost.toString(),
				},
				status: 'success',
			};

			const agentMsg: ChatMessageType = {
				id: 'agent-reg-' + Date.now(),
				sender: 'agent',
				time: settleTime,
				content: `Identifier successfully registered on ${targetChain.name}! The ERC-8004 core contract has processed our cryptographic binding. Under custody parameters, your keys have designated authority to sign. Deducted ~${gasCost} ETH for gas state-update fees.`,
				toolCalls: [toolC],
			};

			const newTx: Transaction = {
				id: Date.now(),
				time: settleTime,
				type: 'x402',
				from: walletAddress,
				to: `ERC-8004 Registry (${targetChain.name})`,
				token: 'ETH',
				amount: gasCost,
				status: 'success',
				txHash: randomTxHash,
			};

			const newLog: LogType = {
				id: Date.now() + 2,
				time: settleTime,
				category: 'register',
				description: `Bound ${agentName} to ${targetChain.name}, minted ERC-805 TokenId ${mintedTokenId}`,
				status: 'success',
			};

			setChatMessages((prev) => [...prev, agentMsg]);
			setTransactions((prev) => [newTx, ...prev]);
			setLogs((prev) => [newLog, ...prev]);
			setIsAgentReplying(false);
			showToast(`Registered successfully on ${targetChain.name}!`, 'success');
		}, 1500);
	};

	// 5b. Create Wallet settings re-generation
	const handleWalletCreate = (
		newName: string,
		type: 'standalone' | 'paired',
		pCode?: string,
	) => {
		setAgentName(newName);
		const randomAddress =
			'0x' +
			Array.from({ length: 40 }, () =>
				Math.floor(Math.random() * 16).toString(16),
			).join('');
		setWalletAddress(randomAddress);

		setChains(
			INITIAL_CHAINS.map((c) =>
				c.chainId === 'eth-sepolia' ? { ...c, tokenId: '#14298' } : c,
			),
		);

		setShowConfigModal(false);

		const timeNow = new Date().toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});

		const freshLog: LogType = {
			id: Date.now(),
			time: timeNow,
			category: 'register',
			description: `Re-allocated wallet custody pipeline. Active identifier name: ${newName}. Mode: ${type.toUpperCase()}`,
			status: 'success',
		};

		setLogs((prev) => [freshLog, ...prev]);
		setChatMessages([
			{
				id: 'new-welcome-' + Date.now(),
				sender: 'agent' as const,
				time: timeNow,
				content: `New autonomous Agent Vault generated for "${newName}". Multi-chain addresses linked back to keys: ${randomAddress}. Register on remaining Sepolia contracts to unlock complete decentralized validation.`,
			},
		]);
		setIsWalletConnected(true);
		showToast(
			`New Agent Wallet "${newName}" successfully generated!`,
			'success',
		);
	};

	// 6. Send message to real Agent API with streaming
	const handleChatMessageSend = async (userText: string) => {
		const timeNow = new Date().toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});

		const agentMsgId = 'agent-' + Date.now();

		// Add user message
		setChatMessages((prev) => [
			...prev,
			{
				id: 'user-' + Date.now(),
				sender: 'user' as const,
				time: timeNow,
				content: userText,
			},
		]);

		// Add placeholder agent message for streaming
		setChatMessages((prev) => [
			...prev,
			{
				id: agentMsgId,
				sender: 'agent' as const,
				time: timeNow,
				content: '',
			},
		]);

		setIsAgentReplying(true);

		// Create abort controller for this request
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: userText }),
				signal: abortController.signal,
			});

			// Check if response is an error (JSON, not stream)
			const contentType = response.headers.get('content-type') || '';
			if (!response.ok || contentType.includes('application/json')) {
				const errorData = await response
					.json()
					.catch(() => ({ error: `HTTP ${response.status}` }));
				throw new Error(
					errorData.error || `Agent API error: ${response.status}`,
				);
			}

			// Stream the response - toTextStreamResponse() sends raw text chunks
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let fullText = '';

			if (reader) {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value, { stream: true });
					fullText += chunk;

					// Update the agent message in real-time
					setChatMessages((prev) =>
						prev.map((msg) =>
							msg.id === agentMsgId ? { ...msg, content: fullText } : msg,
						),
					);
				}
			}

			// If no streaming content received, show a fallback
			if (!fullText) {
				setChatMessages((prev) =>
					prev.map((msg) =>
						msg.id === agentMsgId
							? {
									...msg,
									content:
										'Agent 处理完成，但未返回文本。请检查交易记录或日志。',
								}
							: msg,
					),
				);
			}
		} catch (error) {
			console.error('Agent error:', error);
			setChatMessages((prev) =>
				prev.map((msg) =>
					msg.id === agentMsgId
						? {
								...msg,
								content: `Error: ${error instanceof Error ? error.message : 'Failed to reach agent. Ensure the AI API key is configured.'}`,
							}
						: msg,
				),
			);
		} finally {
			setIsAgentReplying(false);
		}
	};

	return (
		<div className='flex flex-col h-screen overflow-hidden bg-zinc-50/40 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-zinc-900/10 dark:selection:bg-white/10 transition-colors md:flex-row antialiased'>
			{/* 1. Sidebar block */}
			<aside
				id='layout-sidebar'
				className='w-full md:w-68 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-950 overflow-hidden shrink-0'
			>
				{/* Sidebar Brand header */}
				<div
					id='sidebar-header'
					className='h-14.5 border-b border-zinc-200 dark:border-zinc-850 px-4.5 flex items-center justify-between shrink-0'
				>
					<div className='flex items-center gap-2.5'>
						<Image
							src='/logo.png'
							alt='Cobo Agentic Wallet'
							width={65}
							height={65}
							className='rounded-md dark:invert'
							priority
						/>
						<span className='font-display font-semibold text-xs tracking-tight text-zinc-700 dark:text-zinc-300'>
							Cobo Agentic Wallet
						</span>
					</div>
					<button
						id='open-config-btn'
						onClick={() => setShowConfigModal(true)}
						className='p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors focus:outline-none'
						title='Configure Agent parameters'
					>
						<Settings className='h-4 w-4' />
					</button>
				</div>

				{/* Sidebar Cards listing */}
				<div
					id='sidebar-widgets'
					className='flex-1 overflow-y-auto p-4 flex flex-col gap-4'
				>
					<WalletCard />

					<FaucetCard
						isWalletConnected={isWalletConnected}
						onClaimSuccess={() => {
							fetch('/api/wallet/status')
								.then((r) => r.json())
								.then((data) => {
									if (data.success && data.connected) {
										setIsWalletConnected(true);
									}
								})
								.catch(() => {});
						}}
					/>
					<RegistrationCard
						chains={chains}
						onInitiateRegister={initiateRegistration}
					/>
				</div>
			</aside>

			{/* 2. Primary layout body */}
			<main
				id='layout-main-frame'
				className='flex-1 flex flex-col h-full overflow-hidden'
			>
				{/* Navbar component */}
				<header
					id='layout-navbar'
					className='h-14.5 border-b border-zinc-200 dark:border-zinc-800 px-5 bg-white dark:bg-zinc-950 flex items-center justify-between shrink-0'
				>
					<div className='flex flex-col gap-0.5'>
						{isWalletConnected ? (
							<>
								<div className='flex items-center gap-2'>
									<span className='text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300'>
										Agent_ID:
									</span>
									<span className='text-xs font-mono text-zinc-900 dark:text-zinc-100 select-all'>
										{agentId}
									</span>
								</div>
								<div className='flex items-center gap-2'>
									<span className='text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300'>
										Wallet_UUID:
									</span>
									<span className='text-xs font-mono text-zinc-900 dark:text-zinc-100 select-all'>
										{walletUuid || '—'}
									</span>
								</div>
							</>
						) : (
							<span className='text-sm text-zinc-400'>未连接钱包</span>
						)}
					</div>

					<div className='flex items-center gap-2.5'>
						<NetworkBadge network='ETH Sepolia Testnet' />
						<ThemeToggle />
					</div>
				</header>

				{/* Primary Chats Flow Window */}
				<section
					id='chat-history-viewport'
					className='flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50/20 dark:bg-zinc-950/20'
				>
					{chatMessages.length === 0 ? (
						<div className='flex flex-col items-center justify-center h-full gap-4 select-none'>
							<Image
								src='/logo.png'
								alt='Cobo Agentic Wallet'
								width={150}
								height={150}
								className='opacity-80 dark:invert'
							/>
							<div className='text-center space-y-1.5'>
								<h2 className='text-lg font-semibold text-zinc-800 dark:text-zinc-200'>
									Cobo Agentic Wallet
								</h2>
								<p className='text-sm text-zinc-400 dark:text-zinc-500 max-w-xs'>
									基于 CAW 协议，通过 x402 支付与 ERC-8004 链上注册，实现 AI
									Agent 原生自主支付
								</p>
							</div>
						</div>
					) : (
						<>
							{chatMessages.map((msg) =>
								msg.sender === 'agent' &&
								!msg.content &&
								!msg.toolCalls?.length ? null : (
									<ChatMessage
										key={msg.id}
										message={msg}
									/>
								),
							)}

							{isAgentReplying && (
								<AgentThinkingIndicator toolNames={activeToolNames} />
							)}

							<div ref={messageEndRef} />
						</>
					)}
				</section>

				{/* Input Compositor */}
				<ChatInput
					onSendMessage={handleChatMessageSend}
					onStop={handleStop}
					disabled={isAgentReplying}
				/>
			</main>

			{/* 2b. Right Panel - Transactions & Logs */}
			<RightPanel
				transactions={transactions}
				logs={logs}
				onPurchase={(service) => {
					// Send message to agent to call the service
					const link = service.url ? `调用链接：${service.url}` : '无调用链接';
					const msg = `请调用付费服务 【${service.name}】，费用：${service.price} ${service.pricingToken}，${link}；然后返回完整调用结果`;
					handleChatMessageSend(msg);
				}}
			/>

			{/* 3. MODALS AND NOTIFIERS BAR */}

			{/* A. ERC-8004 Registration approval modal */}
			{pendingChainToRegister && (
				<RegisterConfirmModal
					chain={pendingChainToRegister}
					agentName={agentName}
					walletAddress={walletAddress}
					onClose={() => setPendingChainToRegister(null)}
					onConfirm={confirmRegistration}
				/>
			)}

			{/* B. Config / Create wallet settings modal */}
			{showConfigModal && (
				<WalletCreateModal
					onClose={() => setShowConfigModal(false)}
					onCreate={handleWalletCreate}
				/>
			)}

			{/* C. Dynamic Toast alerts overlay */}
			{toastMessage && (
				<div
					id='app-toast-alert'
					className='fixed bottom-5 right-5 z-50 flex items-center gap-2 p-3 rounded-lg border shadow-lg font-sans text-xs font-semibold animate-in slide-in-from-bottom-5 fade-in duration-200 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border-zinc-250 dark:border-zinc-800'
				>
					<span
						className={`h-2 w-2 rounded-full ${
							toastMessage.type === 'success'
								? 'bg-emerald-500'
								: toastMessage.type === 'error'
									? 'bg-rose-500'
									: 'bg-blue-500'
						}`}
					/>
					<span>{toastMessage.text}</span>
				</div>
			)}
		</div>
	);
}
