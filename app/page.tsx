'use client';

import { useState, useRef, useEffect } from 'react';
import {
	INITIAL_CHAINS,
	INITIAL_SERVICES,
	INITIAL_TRANSACTIONS,
	INITIAL_LOGS,
	INITIAL_CHAT_MESSAGES,
} from '@/data/mockData';
import {
	ChainStatus,
	PaidService,
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
import ServiceList from '@/components/sidebar/ServiceList';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import RightPanel from '@/components/panel/RightPanel';

// Modals
import RegisterConfirmModal from '@/components/modals/RegisterConfirmModal';
import WalletCreateModal from '@/components/modals/WalletCreateModal';

// Lucide Icons
import { Loader2, Settings } from 'lucide-react';
import Image from 'next/image';

function AgentThinkingIndicator({ toolNames }: { toolNames: string[] }) {
	const uniqueToolNames = Array.from(new Set(toolNames.filter(Boolean)));
	const isUsingTool = uniqueToolNames.length > 0;

	return (
		<div
			id='agent-thinking-indicator'
			className='mb-4 flex items-center gap-2 px-1.5 text-xs text-zinc-500 dark:text-zinc-400'
		>
			<Loader2 className='h-3.5 w-3.5 animate-spin text-emerald-500' />
			<span className='font-medium'>
				{isUsingTool ? '正在调用工具' : '思考中'}
			</span>
			{isUsingTool && (
				<span className='max-w-[70%] truncate rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'>
					{uniqueToolNames.join(', ')}
				</span>
			)}
			<span className='flex gap-0.5' aria-hidden='true'>
				<span className='animate-pulse'>.</span>
				<span className='animate-pulse [animation-delay:120ms]'>.</span>
				<span className='animate-pulse [animation-delay:240ms]'>.</span>
			</span>
		</div>
	);
}

export default function Home() {
	// Global App States
	const agentId =
		process.env.NEXT_PUBLIC_AGENT_ID || 'caw_agent_906ad75e6d7c7a6c';
	const [agentName, setAgentName] = useState('CoboAgent');
	const [walletAddress, setWalletAddress] = useState(
		process.env.NEXT_PUBLIC_AGENT_WALLET_ADDRESS || '0x8c25ddf08fd51cfc9a3985b765a9be2095a347c1'
	);
	const [ethBalance, setEthBalance] = useState(0.5);
	const [usdcBalance, setUsdcBalance] = useState(15.0);
	const [isWalletConnected, setIsWalletConnected] = useState(false);

	// Lists
	const [chains, setChains] = useState<ChainStatus[]>(INITIAL_CHAINS);
	const [services] = useState<PaidService[]>(INITIAL_SERVICES);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [logs, setLogs] = useState<LogType[]>([]);
	const [chatMessages, setChatMessages] = useState<ChatMessageType[]>(
		INITIAL_CHAT_MESSAGES,
	);

	// Fetch real data from CAW API
	useEffect(() => {
		const fetchRealData = async () => {
			try {
				// Fetch transaction records
				// CAW response: { success, result: TransactionRecord[] }
				const txResponse = await fetch('/api/wallet/transactions?limit=20');
				const txData = await txResponse.json();
				const txList = Array.isArray(txData.result) ? txData.result : [];
				if (txData.success && txList.length > 0) {
					const realTransactions = txList.map((tx: any, idx: number) => ({
						id: idx + 1,
						time: tx.created_at || new Date().toISOString(),
						type: tx.type === 'transfer' ? 'Transfer' : tx.type === 'deposit' ? 'Deposit' : 'x402',
						counterparty: tx.to_address || tx.from_address || 'Unknown',
						token: tx.token_id?.includes('USDC') ? 'USDC' : 'ETH',
						amount: parseFloat(tx.amount || '0'),
						status: tx.status === 'success' ? 'success' : tx.status === 'pending' ? 'pending' : 'failed',
						txHash: tx.tx_hash || tx.id,
					}));
					setTransactions(realTransactions);
				}

				// Fetch audit logs
				// CAW response: { success, result: { items: AuditLog[] } }
				const auditResponse = await fetch('/api/wallet/audit?limit=20');
				const auditData = await auditResponse.json();
				const auditItems = auditData.result?.items || [];
				if (auditData.success && auditItems.length > 0) {
					const realLogs = auditItems.map((log: any, idx: number) => ({
						id: idx + 1,
						time: log.created_at || log.timestamp || new Date().toISOString(),
						category: log.action?.includes('transfer') ? 'transfer' : log.action?.includes('contract') ? 'register' : 'pay',
						description: `${log.action || 'operation'}: ${log.result || 'completed'}`,
						status: log.result === 'allowed' ? 'success' : log.result === 'denied' ? 'failed' : 'pending',
					}));
					setLogs(realLogs);
				}
			} catch (error) {
				console.error('Failed to fetch real data:', error);
				// Keep mock data if API fails
			}
		};

		fetchRealData();
	}, []);

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

	// 1. Interactive Helper: Handle Mock Deposit
	const handleDeposit = (token: 'ETH' | 'USDC', amount: number) => {
		const timeNow = new Date().toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});
		const randomHash =
			'0x' +
			Array.from({ length: 40 }, () =>
				Math.floor(Math.random() * 16).toString(16),
			).join('');

		if (token === 'ETH') {
			setEthBalance((prev) => prev + amount);
		} else {
			setUsdcBalance((prev) => prev + amount);
		}

		const newTx: Transaction = {
			id: Date.now(),
			time: timeNow,
			type: 'Deposit',
			counterparty: 'User Wallet (Cobo Custody)',
			token: token,
			amount: amount,
			status: 'success',
			txHash: randomHash,
		};

		const newLog: LogType = {
			id: Date.now() + 1,
			time: timeNow,
			category: 'query',
			description: `Deposited ${amount} ${token} successfully. Dynamic balance refreshed.`,
			status: 'success',
		};

		setTransactions((prev) => [newTx, ...prev]);
		setLogs((prev) => [newLog, ...prev]);
		showToast(`Deposited ${amount} ${token} to agent vault!`, 'success');
	};

	// 2. Interactive Helper: Handle Mock Transfer
	const handleTransfer = (
		token: 'ETH' | 'USDC',
		destination: string,
		amount: number,
	) => {
		const currentBalance = token === 'ETH' ? ethBalance : usdcBalance;
		const timeNow = new Date().toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});

		if (amount > currentBalance) {
			const failLog: LogType = {
				id: Date.now(),
				time: timeNow,
				category: 'error',
				description: `Transfer aborted: Insufficient ${token} balance (Requested: ${amount}, Owned: ${currentBalance.toFixed(4)})`,
				status: 'failed',
			};
			setLogs((prev) => [failLog, ...prev]);
			showToast(`Transfer failed: Insufficient ${token} balance.`, 'error');
			return;
		}

		if (token === 'ETH') {
			setEthBalance((prev) => prev - amount);
		} else {
			setUsdcBalance((prev) => prev - amount);
		}

		const randomHash =
			'0x' +
			Array.from({ length: 40 }, () =>
				Math.floor(Math.random() * 16).toString(16),
			).join('');

		const newTx: Transaction = {
			id: Date.now(),
			time: timeNow,
			type: 'Transfer',
			counterparty: destination,
			token: token,
			amount: amount,
			status: 'success',
			txHash: randomHash,
		};

		const newLog: LogType = {
			id: Date.now() + 1,
			time: timeNow,
			category: 'transfer',
			description: `Transferred ${amount} ${token} to recipient ${destination.slice(0, 8)}...`,
			status: 'success',
		};

		setTransactions((prev) => [newTx, ...prev]);
		setLogs((prev) => [newLog, ...prev]);
		showToast(`Transferred ${amount} ${token} on-chain!`, 'success');
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
			setEthBalance((prev) => Math.max(0, prev - gasCost));

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
				counterparty: `ERC-8004 Registry (${targetChain.name})`,
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

	// 4. Handle Service triggering
	const handleServiceClick = (service: PaidService) => {
		const textCommand = `Run service prediction: Settle ${service.price} ${service.pricingToken} to run "${service.name}" analytics.`;
		handleChatMessageSend(textCommand);
	};

	// 5. Connect Wallet (Paired mode)
	const handleConnectWallet = () => {
		// In a real app, this would open the Cobo App pairing flow
		// For demo, we just show the wallet create modal in paired mode
		setShowConfigModal(true);
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
		setEthBalance(0.5);
		setUsdcBalance(15.0);

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

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: userText }),
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
					<WalletCard
					/>


					<FaucetCard
						isWalletConnected={isWalletConnected}
						onClaimSuccess={() => {
							fetch("/api/wallet/status")
								.then(r => r.json())
								.then(data => {
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

					<ServiceList
						services={services}
						onTriggerService={handleServiceClick}
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
					<div className='flex items-center gap-2.5'>
						{isWalletConnected ? (
							<span
								id='active-agent-info'
								className='text-xs font-mono font-bold tracking-tight text-zinc-800 dark:text-zinc-200'
							>
								Agent ID:{' '}
								<span className='bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-900 dark:text-white'>
									{agentId}
								</span>
							</span>
						) : (
							<span className='text-xs text-zinc-400'>未连接钱包</span>
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
					{chatMessages.map((msg) =>
						msg.sender === 'agent' && !msg.content && !msg.toolCalls?.length ? null : (
							<ChatMessage
								key={msg.id}
								message={msg}
							/>
						),
					)}

					{isAgentReplying && <AgentThinkingIndicator toolNames={activeToolNames} />}

					<div ref={messageEndRef} />
				</section>

				{/* Input Compositor */}
				<ChatInput
					onSendMessage={handleChatMessageSend}
					disabled={isAgentReplying}
				/>
			</main>

			{/* 2b. Right Panel - Transactions & Logs */}
			<RightPanel
				transactions={transactions}
				logs={logs}
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
