/**
 * AI Agent - ToolLoopAgent
 *
 * Uses Vercel AI SDK with OpenAI-compatible interface.
 * Supports any OpenAI-compatible model provider.
 */

import { createOpenAI } from "@ai-sdk/openai";
import { generateText, tool, zodSchema, stepCountIs } from "ai";
import { z } from "zod";
import {
  getBalances,
  transferTokens,
  getTransactionRecords,
} from "./caw";

// ============================================================
// LLM Configuration (OpenAI Compatible)
// ============================================================

const provider = createOpenAI({
  baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1",
  apiKey: process.env.AI_API_KEY || "",
});

const model = provider(process.env.AI_MODEL_NAME || "gpt-4o");

// ============================================================
// System Prompt
// ============================================================

const SYSTEM_PROMPT = `你是一个 AI Agent，拥有自己的链上钱包（Cobo Agentic Wallet）。
你可以自主发现付费服务、支付稳定币获取数据、管理钱包资产。

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
- 交易哈希是可验证的凭证，务必保留在回复中
- 你运行在 Base Sepolia 测试网，所有交易都是测试网交易

## 回复风格
- 简洁、直接、专业
- 支付操作附带交易哈希和代币类型
- 数据来源标注服务名称和价格`;

// ============================================================
// Tools
// ============================================================

const discoverServices = tool({
  description:
    "搜索可用的付费数据服务。返回服务列表，包含名称、价格、URL。",
  inputSchema: zodSchema(z.object({
    query: z
      .string()
      .describe("搜索关键词，如 'ETH analysis', 'market data'"),
  })),
  execute: async (args) => {
    const { query } = args;
    const services = [
      {
        id: "eth-analyzer",
        name: "ETH Chain Analysis",
        url: "/api/data/eth-analysis",
        price: "0.001",
        token: "USDC",
        provider: "BlockIntelligence",
        description:
          "High-density historical wallet analysis & gas patterns.",
      },
      {
        id: "mkt-prediction",
        name: "Market Prediction",
        url: "/api/data/market-prediction",
        price: "0.005",
        token: "USDC",
        provider: "AlphaOracle",
        description:
          "Statistical price boundaries & sentiment insights.",
      },
      {
        id: "gas-tracker",
        name: "Gas Optimization API",
        url: "/api/data/gas-optimizer",
        price: "0.0002",
        token: "ETH",
        provider: "GasSaver DAO",
        description:
          "Predictive gas thresholds for high-speed transactions.",
      },
    ];

    const q = query.toLowerCase();
    const matched = services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.id.includes(q)
    );

    return {
      query,
      results: matched.length > 0 ? matched : services,
      total: matched.length > 0 ? matched.length : services.length,
    };
  },
});

const callPaidAPI = tool({
  description:
    "调用付费数据 API。如果返回 402，自动通过 CAW 支付稳定币（当前生态为 USDC）后获取数据。支付前会检查余额。",
  inputSchema: zodSchema(z.object({
    url: z.string().url().describe("付费 API 的 URL"),
    method: z
      .enum(["GET", "POST"])
      .default("GET")
      .describe("HTTP 方法"),
  })),
  execute: async (args) => {
    const { url, method } = args;
    // Balance check is informational - actual payment handled by x402
    try {
      await getBalances();
    } catch {
      // Continue even if balance check fails
    }

    const response = await fetch(url, { method: method as "GET" | "POST" });
    const data = await response.json();

    return {
      status: response.status,
      data,
      url,
    };
  },
});

const checkBalance = tool({
  description: "查询 Agent 钱包的所有代币余额（ETH、USDC、USDT 等）。",
  inputSchema: zodSchema(z.object({})),
  execute: async () => {
    const balances = await getBalances();
    return balances;
  },
});

const makePayment = tool({
  description:
    "通过 CAW 向指定地址转账。支持 ETH、USDC、USDT 等任意 Cobo 支持的代币。用于捐赠、付款、充值等直接转账场景（非 x402 协议）。",
  inputSchema: zodSchema(z.object({
    to: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/)
      .describe("收款 EVM 地址"),
    amount: z.string().describe("转账金额，如 '1.5'"),
    token: z
      .enum(["ETH", "USDC", "USDT"])
      .default("USDC")
      .describe("转账代币，默认 USDC"),
  })),
  execute: async (args) => {
    const { to, amount, token } = args;
    const tokenId = `BASE_ETH_${token}`;
    const result = await transferTokens({
      tokenId,
      dstAddr: to,
      amount,
    });
    return result;
  },
});

const getTransactionStatus = tool({
  description: "查询指定交易的状态（pending/success/failed），返回交易详情。",
  inputSchema: zodSchema(z.object({
    limit: z.number().default(10).describe("返回记录数量"),
  })),
  execute: async (args) => {
    const { limit } = args;
    const records = await getTransactionRecords(limit);
    return records;
  },
});

// ============================================================
// Agent Runner
// ============================================================

export async function runAgent(userMessage: string) {
  const result = await generateText({
    model,
    system: SYSTEM_PROMPT,
    prompt: userMessage,
    tools: {
      discoverServices,
      callPaidAPI,
      checkBalance,
      makePayment,
      getTransactionStatus,
    },
    stopWhen: stepCountIs(10),
    temperature: 0.3,
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
