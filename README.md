<div align="center">

<img src="public/logo.png" alt="Cobo Agentic Wallet" width="120" />

# Cobo Agentic Wallet

**AI Agent Native Payments — 让 Agent 成为互联网的一等支付公民**

[English](#english) | [中文](#中文)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

<a id="english"></a>

## 🇬🇧 English

### Overview

Cobo Agentic Wallet is an AI Agent that autonomously discovers, pays for, and provides on-chain data services using the **x402 payment protocol**, **ERC-8004 agent registration**, and **Cobo Agentic Wallet (CAW)** for secure fund management.

**Key Features:**
- 🔗 **x402 Protocol** — HTTP 402 auto-payment for API calls
- 🆔 **ERC-8004** — On-chain agent identity registration (discoverable on 8004scan.io)
- 💰 **CAW Integration** — MPC wallet management, Pact permissions, audit logs
- 🤖 **AI Agent** — ToolLoopAgent with autonomous payment decisions
- 🏪 **Service Provider** — Expose paid APIs via x402 for other agents
- 🌐 **A2A Protocol** — Agent-to-Agent discovery and communication

### Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| AI | Vercel AI SDK, OpenAI-compatible providers |
| Wallet | Cobo Agentic Wallet SDK |
| Payment | x402 Protocol (@x402/next, @x402/core, @x402/evm) |
| Identity | ERC-8004 (agent0-sdk, viem) |
| Chain | ETH Sepolia testnet |

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Run development server
npm run dev
```

### Environment Variables

```env
# CAW (Cobo Agentic Wallet)
AGENT_WALLET_API_URL=https://agentic-wallet.cobo.com
OWNER_API_KEY=              # caw wallet current --show-api-key

# AI Model (OpenAI compatible)
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-xxx
AI_MODEL_NAME=gpt-4o

# Pinata (IPFS for ERC-8004)
PINATA_JWT=xxx
```

### Architecture

```
┌─────────────────────────────────────────────────┐
│                   Next.js App                    │
│                                                  │
│  ┌──────────┐  ┌─────────────────────────────┐  │
│  │Dashboard  │  │  AI Agent (ToolLoopAgent)   │  │
│  │ Wallet    │  │  ├─ discoverServices()      │  │
│  │ Balance   │  │  ├─ callPaidAPI() → x402    │  │
│  │ Tx Log    │  │  ├─ makePayment() → CAW     │  │
│  │ Registry  │  │  ├─ checkBalance() → CAW    │  │
│  └──────────┘  │  └─ getTransactionDetails()  │  │
│                └─────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  API Routes                               │   │
│  │  /api/chat          → AI Agent            │   │
│  │  /api/wallet/*      → CAW operations      │   │
│  │  /api/data/*        → x402 paid services  │   │
│  │  /.well-known/*     → A2A discovery       │   │
│  │  /a2a               → A2A JSON-RPC        │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/chat` | POST | AI Agent chat (streaming) |
| `/api/wallet/create` | POST | Create new wallet |
| `/api/wallet/balance` | GET | Query balances |
| `/api/wallet/transfer` | POST | Transfer tokens |
| `/api/wallet/transactions` | GET | Transaction records |
| `/api/wallet/audit` | GET | Audit logs |
| `/api/wallet/pact` | POST/GET | Manage Pacts |
| `/api/data/eth-analysis` | GET | x402 paid API ($0.0001 ETH) |
| `/api/data/market-prediction` | GET | x402 paid API ($0.0005 ETH) |
| `/api/data/gas-optimizer` | GET | x402 paid API ($0.00001 ETH) |
| `/.well-known/agent-card.json` | GET | A2A agent discovery |
| `/a2a` | POST | A2A JSON-RPC endpoint |

### Chain Configuration

| Item | Value |
|---|---|
| Main Chain | ETH Sepolia |
| Cobo Chain ID | `SETH` |
| x402 Facilitator | `https://x402.4mica.xyz` |
| ERC-8004 Registry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| 8004scan | [8004scan.io](https://www.8004scan.io/) |

### License

MIT

---

<a id="中文"></a>

## 🇨🇳 中文

### 项目简介

Cobo Agentic Wallet 是一个 AI Agent，能够自主发现、支付和提供链上数据服务。使用 **x402 支付协议**、**ERC-8004 Agent 注册** 和 **Cobo Agentic Wallet (CAW)** 进行安全资金管理。

**核心功能：**
- 🔗 **x402 协议** — HTTP 402 自动支付，Agent 自主完成 API 付费调用
- 🆔 **ERC-8004** — 链上 Agent 身份注册，在 8004scan.io 可被发现
- 💰 **CAW 集成** — MPC 钱包管理、Pact 权限控制、审计日志
- 🤖 **AI Agent** — ToolLoopAgent 自主决策支付、查询、转账
- 🏪 **服务提供** — 通过 x402 对外暴露付费 API，其他 Agent 可调用
- 🌐 **A2A 协议** — Agent 间发现与通信

### 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| AI | Vercel AI SDK, OpenAI 兼容接口 |
| 钱包 | Cobo Agentic Wallet SDK |
| 支付 | x402 协议 (@x402/next, @x402/core, @x402/evm) |
| 身份 | ERC-8004 (agent0-sdk, viem) |
| 链 | ETH Sepolia 测试网 |

### 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的密钥

# 3. 启动开发服务器
npm run dev
```

### 环境变量

```env
# CAW（Cobo Agentic Wallet）
AGENT_WALLET_API_URL=https://agentic-wallet.cobo.com
OWNER_API_KEY=              # caw wallet current --show-api-key 获取

# AI 模型（OpenAI 兼容）
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-xxx
AI_MODEL_NAME=gpt-4o

# Pinata（IPFS 上传，ERC-8004 注册用）
PINATA_JWT=xxx
```

### 系统架构

```
┌─────────────────────────────────────────────────┐
│                   Next.js 应用                    │
│                                                  │
│  ┌──────────┐  ┌─────────────────────────────┐  │
│  │ 仪表盘    │  │  AI Agent (ToolLoopAgent)   │  │
│  │ 钱包余额  │  │  ├─ discoverServices()      │  │
│  │ 交易记录  │  │  ├─ callPaidAPI() → x402    │  │
│  │ 注册状态  │  │  ├─ makePayment() → CAW     │  │
│  │ 操作日志  │  │  ├─ checkBalance() → CAW    │  │
│  └──────────┘  │  └─ getTransactionDetails()  │  │
│                └─────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  API 路由                                 │   │
│  │  /api/chat          → AI Agent 对话       │   │
│  │  /api/wallet/*      → CAW 钱包操作        │   │
│  │  /api/data/*        → x402 付费服务       │   │
│  │  /.well-known/*     → A2A 发现            │   │
│  │  /a2a               → A2A JSON-RPC        │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### API 端点

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/chat` | POST | AI Agent 对话（流式响应） |
| `/api/wallet/create` | POST | 创建新钱包 |
| `/api/wallet/balance` | GET | 查询余额 |
| `/api/wallet/transfer` | POST | 转账 |
| `/api/wallet/transactions` | GET | 交易记录 |
| `/api/wallet/audit` | GET | 审计日志 |
| `/api/wallet/pact` | POST/GET | Pact 权限管理 |
| `/api/data/eth-analysis` | GET | x402 付费 API（0.0001 ETH） |
| `/api/data/market-prediction` | GET | x402 付费 API（0.0005 ETH） |
| `/api/data/gas-optimizer` | GET | x402 付费 API（0.00001 ETH） |
| `/.well-known/agent-card.json` | GET | A2A Agent 发现 |
| `/a2a` | POST | A2A JSON-RPC 端点 |

### Agent 工具集

| 工具 | 功能 | 底层 API |
|---|---|---|
| `discoverServices` | 搜索付费数据服务 | 本地服务列表 |
| `callPaidAPI` | 调用 x402 付费 API | CAW `payment()` |
| `checkBalance` | 查询钱包余额 | CAW `listBalances()` |
| `makePayment` | 直接转账 | CAW `transferTokens()` |
| `getTransactionStatus` | 查询交易记录 | CAW `listTransactions()` |
| `getTransactionDetails` | 查询交易详情 | CAW `getTransaction()` |

### 钱包模式

| 模式 | Agent 角色 | 授权 | API Key 来源 |
|---|---|---|---|
| **Owner（未配对）** | 钱包所有者 | 无需授权，自由操作 | `ownerKey` |
| **Delegate（已配对）** | 受委托者 | 需 Pact 授权 | `pact-scoped key` |

### 链配置

| 项目 | 值 |
|---|---|
| 主链 | ETH Sepolia |
| Cobo 链 ID | `SETH` |
| x402 Facilitator | `https://x402.4mica.xyz` |
| ERC-8004 Registry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| 8004scan | [8004scan.io](https://www.8004scan.io/) |

### 参考文档

- [Cobo Agentic Wallet](https://www.cobo.com/products/agentic-wallet/manual/start-here/introduction)
- [CAW 安全与控制](https://www.cobo.com/products/agentic-wallet/manual/security/overview)
- [CAW Agent Owner](https://www.cobo.com/products/agentic-wallet/manual/owners/features)
- [CAW Developer](https://www.cobo.com/products/agentic-wallet/manual/developer/quickstart-overview)
- [Vercel AI SDK](https://ai-sdk.dev/docs/introduction)
- [agent0-sdk](https://sdk.ag0.xyz/docs)
- [x402 协议](https://docs.x402.org/getting-started/quickstart-for-buyers)
- [Next.js 文档](https://nextjs.org/docs)

### 开源协议

MIT
