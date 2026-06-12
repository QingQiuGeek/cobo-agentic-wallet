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
import RegistrationCard from '@/components/sidebar/RegistrationCard';
import ServiceList from '@/components/sidebar/ServiceList';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import BottomPanel from '@/components/panel/BottomPanel';

// Modals
import RegisterConfirmModal from '@/components/modals/RegisterConfirmModal';
import WalletCreateModal from '@/components/modals/WalletCreateModal';

// Lucide Icons
import { Settings } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
	// Global App States
	const [walletAddress, setWalletAddress] = useState(
		'0xCAW49fD2da59d28003fBceA1eBa6f8fe9E34BD9e',
	);
	const [agentName, setAgentName] = useState('CoboAgent');
	const [ethBalance, setEthBalance] = useState(0.5);
	const [usdcBalance, setUsdcBalance] = useState(15.0);
	const [isWalletConnected, setIsWalletConnected] = useState(false);

	// Lists
	const [chains, setChains] = useState<ChainStatus[]>(INITIAL_CHAINS);
	const [services] = useState<PaidService[]>(INITIAL_SERVICES);
	const [transactions, setTransactions] =
		useState<Transaction[]>(INITIAL_TRANSACTIONS);
	const [logs, setLogs] = useState<LogType[]>(INITIAL_LOGS);
	const [chatMessages, setChatMessages] = useState<ChatMessageType[]>(
		INITIAL_CHAT_MESSAGES,
	);

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
				c.chainId === 'base-sepolia' ? { ...c, tokenId: '#14298' } : c,
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

	// 6. Dynamic Chat Engine parsing User Messages
	const handleChatMessageSend = (userText: string) => {
		const timeNow = new Date().toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});

		setChatMessages((prev) => [
			...prev,
			{
				id: 'user-msg-' + Date.now(),
				sender: 'user' as const,
				time: timeNow,
				content: userText,
			},
		]);

		setIsAgentReplying(true);

		const norm = userText.toLowerCase();

		setTimeout(() => {
			const settleTime = new Date().toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
			});
			const agentMsgId = 'agent-reply-' + Date.now();
			let outcomeContent = '';
			let toolsUsed: ToolCall[] = [];

			if (
				norm.includes('analysis') ||
				norm.includes('service') ||
				norm.includes('analyzer')
			) {
				const matchingSvc =
					services.find(
						(s) =>
							norm.includes(s.id) ||
							norm.includes('analysis') ||
							norm.includes(s.name.toLowerCase()),
					) || services[0];
				const cost = parseFloat(matchingSvc.price);

				if (usdcBalance < cost) {
					const failLog: LogType = {
						id: Date.now() + 10,
						time: settleTime,
						category: 'error',
						description: `Paid API call aborted: Insufficient USDC balance (Required: ${cost}, Owned: ${usdcBalance.toFixed(2)})`,
						status: 'failed',
					};
					setLogs((prev) => [failLog, ...prev]);

					outcomeContent = `Failed to process micro-payment for "${matchingSvc.name}". The service requires ${cost} USDC, but your vault only holds ${usdcBalance.toFixed(2)} USDC. Please trigger the [Deposit] option on the sidebar to replenish funds and retry.`;

					setChatMessages((prev) => [
						...prev,
						{
							id: agentMsgId,
							sender: 'agent' as const,
							time: settleTime,
							content: outcomeContent,
						},
					]);
				} else {
					setUsdcBalance((prev) => Math.max(0, prev - cost));

					const rTxHash =
						'0x' +
						Array.from({ length: 40 }, () =>
							Math.floor(Math.random() * 16).toString(16),
						).join('');

					const discoveryTool: ToolCall = {
						id: 't-disc-' + Date.now(),
						name: 'discoverServices',
						parameters: { query: matchingSvc.name },
						result: {
							matchedEntriesCount: 1,
							matchedList: [
								{
									id: matchingSvc.id,
									name: matchingSvc.name,
									provider: matchingSvc.provider,
									cost: `${matchingSvc.price} ${matchingSvc.pricingToken}`,
								},
							],
						},
						status: 'success',
					};

					const payTool: ToolCall = {
						id: 't-pay-' + Date.now(),
						name: 'settleMicroPayment',
						parameters: {
							recipient: matchingSvc.provider,
							amount: matchingSvc.price,
							token: matchingSvc.pricingToken,
							endpoint: matchingSvc.url,
						},
						result: {
							paymentSettleState: 'SETTLED',
							blockchainTxHash: rTxHash,
							serviceResponsePayloadLength: '1240 bytes',
							httpStatusCode: 200,
						},
						status: 'success',
					};

					toolsUsed = [discoveryTool, payTool];

					if (matchingSvc.id === 'eth-analyzer') {
						outcomeContent =
							`Settled ${cost} USDC micro-payment successfully to provider "${matchingSvc.provider}" (Receipt: ${rTxHash.slice(0, 10)}...).\n\nHere is the real-time on-chain analysis payload we retreived for ETH:\n\n` +
							`📊 ETH NETWORK METRICS REPORT:\n` +
							`• Current Gas Threshold: 12.4 Gwei (Highly cost-efficient zone)\n` +
							`• 24h Average Transaction Settle speed: ~12.2 seconds\n` +
							`• Top Gas Consuming Contract: Uniswap V3 Pool Router (33.1% gas fraction)\n` +
							`• Active smart-agents count: 14,809 daily endpoints\n\n` +
							`The predictive gas threshold has been queued inside state logs.`;
					} else if (matchingSvc.id === 'mkt-prediction') {
						outcomeContent =
							`Settled ${cost} USDC micro-payment successfully to provider "${matchingSvc.provider}" (Receipt: ${rTxHash.slice(0, 10)}...).\n\nHere is the statistical oracle price prediction response:\n\n` +
							`📈 ALPHA ORACLE sentiment report:\n` +
							`• Short-term volatility coefficient: 2.14% (Moderate consolidation)\n` +
							`• Relative Strength Indicator (RSI): 54.8 (Stable baseline)\n` +
							`• Probability of breakout within 12h: 64% (Consensus direction: BULLISH)\n` +
							`• 24h Pivot support limit: $3,210.00 USD`;
					} else {
						outcomeContent = `Settled ${cost} ${matchingSvc.pricingToken} micropayment to "${matchingSvc.provider}".\n\nGas Optimizer response:\n• Base optimal fee: 11 Gwei\n• High priority fee: 15 Gwei\n• Recommended maximum slippage buffer: 0.15%`;
					}

					const newTx: Transaction = {
						id: Date.now(),
						time: settleTime,
						type: 'Payment',
						counterparty: `Svc Call: ${matchingSvc.name}`,
						token: matchingSvc.pricingToken,
						amount: cost,
						status: 'success',
						txHash: rTxHash,
					};

					const newLog: LogType = {
						id: Date.now() + 1,
						time: settleTime,
						category: 'pay',
						description: `Payment settled of ${cost} ${matchingSvc.pricingToken} for API call: ${matchingSvc.name}`,
						status: 'success',
					};

					setTransactions((prev) => [newTx, ...prev]);
					setLogs((prev) => [newLog, ...prev]);
					setChatMessages((prev) => [
						...prev,
						{
							id: agentMsgId,
							sender: 'agent' as const,
							time: settleTime,
							content: outcomeContent,
							toolCalls: toolsUsed,
						},
					]);
					showToast(`Micro-payment completed: ${cost} USDC`, 'success');
				}
			} else if (
				norm.includes('register') ||
				norm.includes('binding') ||
				norm.includes('sepolia')
			) {
				const targetChain = chains.find(
					(c) =>
						norm.includes(c.chainId) || norm.includes(c.name.toLowerCase()),
				);

				if (targetChain) {
					if (targetChain.registered) {
						outcomeContent = `Cobo Agent Wallet is already fully registered on the ${targetChain.name} Registry contract (Token ID: ${targetChain.tokenId}, address: ${targetChain.registryAddress}). No duplicates can be registered.`;
					} else if (targetChain.status === 'upcoming') {
						outcomeContent = `ERC-8004 Registry bindings for ${targetChain.name} are coming soon. The contract endpoints are currently in offline audit phases.`;
					} else {
						outcomeContent = `I detected that ${targetChain.name} Registry binding is currently inactive. Would you like me to dispatch a secure cryptographic register sequence? \n\nPlease select the "Register Identifiers" button on the sidebar to authorize this permanent link.`;
					}
				} else {
					outcomeContent = `To register your agent identifier onto an ERC-8004 multi-chain contract, click on the **Register Identifiers** button under the registry list of your desired chain. Currently supporting Base Sepolia and ETH Sepolia.`;
				}

				setChatMessages((prev) => [
					...prev,
					{
						id: agentMsgId,
						sender: 'agent' as const,
						time: settleTime,
						content: outcomeContent,
					},
				]);
			} else if (norm.includes('transfer') || norm.includes('send')) {
				outcomeContent = `To transfer ETH or USDC assets on-chain, please utilize the **Transfer** option located inside the Agent Wallet block on the left sidebar. This lets you inspect gas metrics, input target receivers, verify balances, and finalize signatures.`;
				setChatMessages((prev) => [
					...prev,
					{
						id: agentMsgId,
						sender: 'agent' as const,
						time: settleTime,
						content: outcomeContent,
					},
				]);
			} else if (
				norm.includes('balance') ||
				norm.includes('query') ||
				norm.includes('status')
			) {
				const queryTool: ToolCall = {
					id: 't-query-' + Date.now(),
					name: 'queryMultiChainLedger',
					parameters: {
						address: walletAddress,
						chains: chains.map((c) => c.chainId),
					},
					result: {
						queriedAddress: walletAddress,
						ethLedgerBalance: ethBalance.toString(),
						usdcLedgerBalance: usdcBalance.toString(),
						activeRegistriesCount: chains.filter((c) => c.registered).length,
					},
					status: 'success',
				};

				const regCount = chains.filter((c) => c.registered).length;
				outcomeContent =
					`Vault ledger status queried successfully.\n\n💼 MULTI-CHAIN LEDGER STATUS:\n` +
					`• Wallet Address: ${walletAddress}\n` +
					`• ETH Balance: ${ethBalance.toFixed(4)} ETH\n` +
					`• USDC Balance: $${usdcBalance.toFixed(2)} USDC\n` +
					`• Active Identifier registry binds: ${regCount} of ${chains.length} chains`;

				const newLog: LogType = {
					id: Date.now() + 1,
					time: settleTime,
					category: 'query',
					description: `Queried wallet ledger details: ETH ${ethBalance.toFixed(4)}, USDC $${usdcBalance.toFixed(2)}`,
					status: 'success',
				};

				setLogs((prev) => [newLog, ...prev]);
				setChatMessages((prev) => [
					...prev,
					{
						id: agentMsgId,
						sender: 'agent' as const,
						time: settleTime,
						content: outcomeContent,
						toolCalls: [queryTool],
					},
				]);
			} else {
				outcomeContent =
					`Understood. My agentic pipeline is online. How can I assist you with your sovereign digital wallet today?\n\n` +
					`💡 Recommended Actions:\n` +
					`• "Query balance & registry statuses" to scan active ledger balances.\n` +
					`• "Run ETH Chain Analysis" to invoke paid provider service endpoints (costs $0.001 USDC).\n` +
					`• Click the **Register Identifiers** on the left to permanently bind identifiers onto blockchain smart contract registries.\n`;

				setChatMessages((prev) => [
					...prev,
					{
						id: agentMsgId,
						sender: 'agent' as const,
						time: settleTime,
						content: outcomeContent,
					},
				]);
			}

			setIsAgentReplying(false);
		}, 1200);
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
							className='rounded-md'
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
						address={walletAddress}
						ethBalance={ethBalance}
						usdcBalance={usdcBalance}
						isWalletConnected={isWalletConnected}
						onConnectWallet={handleConnectWallet}
						onCreateWallet={() => setShowConfigModal(true)}
						onDeposit={handleDeposit}
						onTransfer={handleTransfer}
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
						<Image
							src='/logo.png'
							alt='Logo'
							width={20}
							height={20}
							className='rounded-sm'
						/>
						<span
							id='active-agent-info'
							className='text-xs font-mono font-bold tracking-tight text-zinc-800 dark:text-zinc-200'
						>
							Agent ID:{' '}
							<span className='bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-900 dark:text-white'>
								{agentName}
							</span>
						</span>
					</div>

					<div className='flex items-center gap-2.5'>
						<NetworkBadge network='Base Sepolia Testnet' />
						<ThemeToggle />
					</div>
				</header>

				{/* Primary Chats Flow Window */}
				<section
					id='chat-history-viewport'
					className='flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50/20 dark:bg-zinc-950/20'
				>
					{chatMessages.map((msg) => (
						<ChatMessage
							key={msg.id}
							message={msg}
						/>
					))}

					{/* Chat reply typing loader placeholder */}
					{isAgentReplying && (
						<div
							id='agent-typing-bubble'
							className='flex flex-col items-start mb-4 animate-pulse'
						>
							<div className='flex items-center gap-1.5 mb-1.5'>
								<span className='text-[11px] font-semibold text-zinc-800 dark:text-zinc-205 flex items-center gap-1'>
									<Image
										src='/logo.png'
										alt='Agent'
										width={12}
										height={12}
										className='rounded-sm animate-pulse'
									/>
									<span>Agent Settle Process...</span>
								</span>
								<span className='text-[10px] text-zinc-400'>just now</span>
							</div>
							<div className='bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 rounded-lg px-4 py-3 max-w-[80%] text-sm text-zinc-400 font-mono'>
								Running ledger query and state-update logic...
							</div>
						</div>
					)}

					<div ref={messageEndRef} />
				</section>

				{/* Input Compositor */}
				<ChatInput
					onSendMessage={handleChatMessageSend}
					disabled={isAgentReplying}
				/>

				{/* Resizable, collapsible bottom records table */}
				<BottomPanel
					transactions={transactions}
					logs={logs}
				/>
			</main>

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
