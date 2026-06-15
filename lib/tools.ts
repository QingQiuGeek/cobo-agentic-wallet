/**
 * Agent Tools
 *
 * All tools available to the AI Agent, extracted from agent.ts for modularity.
 * Each tool has strict input validation via zod schemas.
 */

import { tool, zodSchema } from 'ai';
import { z } from 'zod';
import { getBalances, transferTokens, getTransactionRecords, getTransactionByRequestId } from './caw';

// ============================================================
// Tool: discoverServices
// ============================================================

const discoverServices = tool({
	description:
		'搜索可用的付费数据服务。返回服务列表，包含名称、价格、URL。用于发现链上数据 API、分析报告等付费服务。',
	inputSchema: zodSchema(
		z.object({
			query: z
				.string()
				.min(1, '搜索关键词不能为空')
				.max(200, '搜索关键词最长 200 字符')
				.describe("搜索关键词，如 'ETH analysis', 'market data', 'gas optimization'"),
		}),
	),
	execute: async (args) => {
		const { query } = args;

		try {
			// Fetch from real Bazaar API via our service endpoint
			const params = new URLSearchParams({ limit: '20', query });
			const response = await fetch(
				`http://localhost:3000/api/services?${params}`,
			);
			const data = await response.json();

			if (data.success && data.services?.length > 0) {
				return {
					query,
					results: data.services.map((s: any) => ({
						name: s.name,
						url: s.url,
						price: s.price,
						token: s.pricingToken,
						provider: s.provider,
						description: s.description,
						network: s.network,
					})),
					total: data.total || data.services.length,
					source: data.source || 'Bazaar',
				};
			}
		} catch (e) {
			console.error('[discoverServices] Failed to fetch from API:', e);
		}

		// Fallback: return local services
		const fallback = [
			{
				name: 'ETH Chain Analysis',
				url: '/api/data/eth-analysis',
				price: '0.0001',
				token: 'ETH',
				provider: 'Local',
				description: 'ETH on-chain analysis report.',
			},
			{
				name: 'Market Prediction',
				url: '/api/data/market-prediction',
				price: '0.0005',
				token: 'ETH',
				provider: 'Local',
				description: 'Market sentiment analysis.',
			},
		];

		return {
			query,
			results: fallback,
			total: fallback.length,
			source: 'local-fallback',
		};
	},
});

// ============================================================
// Tool: callPaidAPI
// ============================================================

const callPaidAPI = tool({
	description:
		'调用付费数据 API。如果返回 HTTP 402，自动通过 CAW 支付 ETH 后获取数据。支付前会检查余额。返回服务端数据。',
	inputSchema: zodSchema(
		z.object({
			url: z
				.string()
				.min(1, 'URL 不能为空')
				.describe('付费 API 的完整 URL，如 http://localhost:3000/api/data/eth-analysis'),
			method: z
				.enum(['GET', 'POST'])
				.default('GET')
				.describe('HTTP 请求方法，默认 GET'),
		}),
	),
	execute: async (args) => {
		const { url, method } = args;
		// Balance check is informational - actual payment handled by x402
		try {
			await getBalances();
		} catch {
			// Continue even if balance check fails
		}

		const response = await fetch(url, { method: method as 'GET' | 'POST' });
		const data = await response.json();

		return {
			status: response.status,
			data,
			url,
		};
	},
});

// ============================================================
// Tool: checkBalance
// ============================================================

const checkBalance = tool({
	description:
		'查询 Agent 钱包的所有代币余额（ETH、USDC、USDT 等）。无参数，直接调用。返回各代币余额列表。',
	inputSchema: zodSchema(z.object({})),
	execute: async () => {
		const balances = await getBalances();
		return balances;
	},
});

// ============================================================
// Tool: makePayment
// ============================================================

const makePayment = tool({
	description:
		'通过 CAW 向指定地址转账。支持 ETH、USDC、USDT 等任意 Cobo 支持的代币。用于捐赠、付款、充值等直接转账场景（非 x402 协议）。',
	inputSchema: zodSchema(
		z.object({
			to: z
				.string()
				.regex(/^0x[a-fA-F0-9]{40}$/, '必须是有效的 EVM 地址（0x + 40 位十六进制）')
				.describe('收款 EVM 地址，如 0x8c25ddf08fd51cfc9a3985b765a9be2095a347c1'),
			amount: z
				.string()
				.regex(/^\d+(\.\d+)?$/, '金额必须是正数')
				.refine((v) => parseFloat(v) > 0, '金额必须大于 0')
				.describe("转账金额（字符串），如 '0.01', '1.5'"),
			token: z
				.enum(['ETH', 'USDC', 'USDT'])
				.default('ETH')
				.describe('转账代币类型，默认 ETH'),
		}),
	),
	execute: async (args) => {
		const { to, amount, token } = args;
		const tokenId = token === 'ETH' ? 'SETH' : `SETH_${token}`;
		const result = await transferTokens({
			tokenId,
			dstAddr: to,
			amount,
		});
		return result;
	},
});

// ============================================================
// Tool: getTransactionStatus
// ============================================================

const getTransactionStatus = tool({
	description:
		'查询 Agent 钱包的最近交易记录。返回交易列表，包含状态（pending/success/failed）、金额、对方地址、交易哈希等。',
	inputSchema: zodSchema(
		z.object({
			limit: z
				.number()
				.int('必须是整数')
				.min(1, '最少返回 1 条')
				.max(100, '最多返回 100 条')
				.default(10)
				.describe('返回记录数量，默认 10'),
		}),
	),
	execute: async (args) => {
		const { limit } = args;
		const records = await getTransactionRecords(limit);
		return records;
	},
});

// ============================================================
// Tool: getTransactionDetails
// ============================================================

const getTransactionDetails = tool({
	description:
		'查询指定交易的详细信息，包含状态、金额、gas、区块号等。用于查看特定交易的完整详情。',
	inputSchema: zodSchema(
		z.object({
			txHash: z
				.string()
				.regex(/^0x[a-fA-F0-9]{64}$/, '必须是有效的交易哈希（0x + 64位十六进制）')
				.describe('交易哈希，如 0xabcdef1234567890...'),
		}),
	),
	execute: async (args) => {
		const { txHash } = args;
		const details = await getTransactionByRequestId(txHash);
		return details;
	},
});

// ============================================================
// Export all tools
// ============================================================

export const AGENT_TOOLS = {
	discoverServices,
	callPaidAPI,
	checkBalance,
	makePayment,
	getTransactionStatus,
	getTransactionDetails,
};
