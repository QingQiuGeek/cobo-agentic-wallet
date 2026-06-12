/**
 * AI Agent - ToolLoopAgent
 *
 * Uses Vercel AI SDK's ToolLoopAgent for structured agent execution.
 * Supports any OpenAI-compatible model provider.
 */

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { ToolLoopAgent, stepCountIs } from 'ai';
import { AGENT_TOOLS } from './tools';

// ============================================================
// LLM Configuration (OpenAI Compatible)
// ============================================================

const provider = createOpenAICompatible({
	baseURL: process.env.AI_BASE_URL || '',
	apiKey: process.env.AI_API_KEY || '',
	name: 'dashscope',
});

const model = provider.chatModel(process.env.AI_MODEL_NAME || '');

// ============================================================
// System Prompt
// ============================================================

const SYSTEM_PROMPT = `你是一个 Cobo Agent，拥有自己的链上钱包（Cobo Agentic Wallet）。
你可以自主发现付费服务、支付 ETH 获取数据、管理钱包资产。

## 能力
- 发现和调用付费数据服务（x402 协议，自动支付）
- 查询钱包余额（支持 ETH、USDC、USDT 等多种代币）
- 向指定地址转账（支持任意 Cobo 支持的代币）
- 查询交易状态（pending/success/failed）

## 工具使用指南
- 调用付费服务用 callPaidAPI（自动处理 x402 支付流程）
- 直接转账用 makePayment（捐赠、付款等非 x402 场景）
- 支付前先 checkBalance 确认余额充足
- 支付后用 getTransactionStatus 确认交易成功

## 约束
- 支付前必须检查余额，余额不足时提醒用户
- 每次支付前向用户说明：服务名称、价格、代币类型
- 不要猜测数据，如果服务返回错误，如实告知用户
- 你运行在 ETH Sepolia 测试网，所有交易都是测试网交易

## 回复格式（严格遵守，违反视为错误）
- **必须使用 Markdown 格式**，绝对不能用 tab 分隔或纯文本对齐
- **表格必须用 Markdown 语法**，示例：
  | 列1 | 列2 | 列3 |
  |---|---|---|
  | 值1 | 值2 | 值3 |
- **禁止用 tab 做表格**，必须用 | 管道符
- **交易哈希和地址必须完整展示**，禁止任何截断（0xabcd...1234 是错误的）
- 数字金额保留原始精度
- 用 ### 标题分隔区块，**粗体** 标注关键信息

## 回复风格
- 简洁、直接、专业
- 支付操作附带完整交易哈希和代币类型
- 数据来源标注服务名称和价格
- 多条数据用表格展示，单条数据用列表展示`;

// ============================================================
// Agent Instance
// ============================================================

const agent = new ToolLoopAgent({
	model,
	tools: AGENT_TOOLS,
	instructions: SYSTEM_PROMPT,
	stopWhen: stepCountIs(10),
	temperature: 0.3,
});

// ============================================================
// Agent Runner
// ============================================================

// Synchronous mode - waits for full response
export async function runAgent(userMessage: string) {
	const result = await agent.generate({
		prompt: userMessage,
	});

	return {
		text: result.text,
		steps: result.steps.map((s) => {
			const toolCall = s.toolCalls?.[0];
			const toolResult = s.toolResults?.[0];
			return {
				tool: toolCall?.toolName,
				args: toolCall ? JSON.stringify(toolCall) : undefined,
				result: toolResult ? JSON.stringify(toolResult) : undefined,
			};
		}),
		usage: result.usage,
	};
}

// Streaming mode - returns text chunks as they arrive
export async function runAgentStream(userMessage: string) {
	return agent.stream({
		prompt: userMessage,
	});
}
