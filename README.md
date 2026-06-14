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

### Background

The AI Agent economy is emerging. In 2026, autonomous AI Agents are no longer just chatbots — they are economic actors that need to **discover services, make payments, manage funds, and transact on-chain** independently.

However, the current ecosystem lacks a secure, standardized infrastructure for Agent-native financial operations:

- **No autonomous payment layer** — Agents can't pay for services without human intervention
- **No secure custody solution** — Private key management is either centralized or exposes keys to agents
- **No verifiable identity** — Agents have no on-chain identity that can be trusted or discovered
- **No permission boundaries** — No mechanism for humans to control what an Agent can and cannot do financially

### Problems We Solve

| Problem | Traditional Approach | Our Solution |
|---|---|---|
| **Agents can't pay autonomously** | Manual top-ups, human approval for every payment | x402 protocol: HTTP 402 auto-payment, Agent pays in a single API call |
| **Fund security is compromised** | Private key exposure, or centralized custody | Cobo Agentic Wallet: MPC multi-sig, no private key exposure |
| **On-chain identity is unverifiable** | No identity, or spoofable addresses | ERC-8004: On-chain agent registration, discoverable and verifiable |
| **No human-controlled guardrails** | Full access or no access | Pact permissions: Fine-grained policies (transfer, contract_call, message_sign) |
| **Agent-to-Agent commerce is impossible** | Each agent is siloed | A2A protocol: Standardized discovery and communication between agents |

### Goals

Make AI Agents **first-class economic citizens** on the internet:

```
Agent discovers service → Agent pays → Agent gets data → Agent decides → Agent acts
```

- ✅ Agent manages its own wallet (no private key exposure via MPC)
- ✅ Agent automatically completes x402 payments
- ✅ Agent registers on-chain identity (ERC-8004)
- ✅ Humans control Agent's permission boundaries via Pact
- ✅ Full audit trail for every Agent operation

### Features

#### 🤖 AI Agent — Conversational Operations

Users give natural language instructions, Agent executes autonomously:

- *"Analyze ETH on-chain data"* → Agent discovers service → x402 payment → retrieves data → returns analysis
- *"Check my balance"* → Agent calls CAW API → returns real-time balance
- *"Register my Agent identity"* → Agent calls contractCall → writes ERC-8004 on-chain

#### 💰 Cobo Agentic Wallet Integration

- **Wallet Management**: Create / switch / view balances (MPC multi-sig)
- **Fund Operations**: Deposit / transfer / faucet (testnet tokens)
- **Permission Control**: Pact policy management (transfer / contract_call / message_sign)
- **Audit Logs**: Real-time SSE streaming, complete operation traceability

#### 🔐 x402 Payment Protocol

```
Agent requests API → 402 Payment Required → Agent auto-pays → Gets data
```

- Native HTTP 402-based payment protocol
- CAW `payment()` API natively supports x402
- Supports ETH/USDC and other tokens
- 4mica Facilitator for on-chain settlement

#### 📜 ERC-8004 On-chain Identity

- Agent registers identity on Ethereum Sepolia testnet
- Implemented via CAW `contractCall()` + viem encoding
- On-chain verifiable, tamper-proof
- Foundation for Agent reputation systems

#### 🌐 A2A Protocol — Agent-to-Agent Discovery

- `.well-known/agent-card.json` for standard agent discovery
- JSON-RPC endpoint for inter-agent communication
- Agents can discover and call each other's paid services

### Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn/ui, Zustand |
| AI | Vercel AI SDK, DashScope (qwen3.6-27b), ToolLoopAgent |
| Wallet | Cobo Agentic Wallet SDK (`@cobo/cobo-agentic-wallet-kit`) |
| Payment | x402 Protocol (`@x402/next`, `@x402/core`, `@x402/evm`) |
| Identity | ERC-8004 (`agent0-sdk`, `viem`) |
| Storage | Pinata IPFS |
| Chain | Ethereum Sepolia testnet |

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      User Interface                       │
│     Chat Interface · Wallet Dashboard · Transaction Log   │
│     Activity Logs · Deposit/Transfer Modals               │
├──────────────────────────────────────────────────────────┤
│                      AI Agent Layer                        │
│        ToolLoopAgent (Vercel AI SDK + DashScope)           │
│   Tools: discover · callPaidAPI · checkBalance · pay      │
├──────────────────────────────────────────────────────────┤
│                    Service Layer (Next.js API)             │
│    x402 Paid APIs · Wallet APIs · Audit SSE · Pact Mgmt   │
├──────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                    │
│   Cobo Agentic Wallet · x402 Protocol · ERC-8004          │
│   Ethereum Sepolia · 4mica Facilitator · Pinata IPFS      │
└──────────────────────────────────────────────────────────┘
```

### API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/chat` | POST | AI Agent chat (streaming) |
| `/api/wallet/status` | GET | Wallet status & addresses |
| `/api/wallet/create` | POST | Create new wallet |
| `/api/wallet/switch` | POST | Switch active wallet |
| `/api/wallet/balance` | GET | Query token balances |
| `/api/wallet/transfer` | POST | Transfer tokens |
| `/api/wallet/transactions` | GET | Transaction records |
| `/api/wallet/audit/stream` | GET | Audit logs (SSE) |
| `/api/wallet/pact/create` | POST | Create Pact with permissions |
| `/api/wallet/faucet` | POST | Claim testnet tokens |
| `/api/data/eth-analysis` | GET | x402 paid API |
| `/api/data/market-prediction` | GET | x402 paid API |
| `/api/data/gas-optimizer` | GET | x402 paid API |
| `/.well-known/agent-card.json` | GET | A2A agent discovery |
| `/a2a` | POST | A2A JSON-RPC endpoint |

### Agent Tools

| Tool | Function | Underlying API |
|---|---|---|
| `discoverServices` | Search paid data services | Local service registry |
| `callPaidAPI` | Call x402 paid API | CAW `payment()` |
| `checkBalance` | Query wallet balance | CAW `listBalances()` |
| `makePayment` | Direct token transfer (ETH/USDC/USDT) | CAW `transferTokens()` |
| `getTransactionStatus` | Query transaction history | CAW `listTransactions()` |

### Key Implementation Details

- **Wallet**: MPC wallet via Cobo Agentic Wallet SDK (no private key exposure)
- **Payment**: x402 protocol via CAW `payment()` API (auto-handling 402 responses)
- **Registration**: ERC-8004 via CAW `contractCall()` + viem encoding
- **Pact**: Fine-grained permissions (transfer, contract_call, message_sign)
- **Audit**: Real-time SSE stream from CAW audit logs
- **Chain**: ETH Sepolia testnet (Cobo ID: `SETH`, Chain ID: `11155111`)

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
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_API_KEY=sk-xxx
AI_MODEL_NAME=qwen3.6-27b

# Pinata (IPFS for ERC-8004)
PINATA_JWT=xxx

# x402
X402_PAYEE_ADDRESS=0x...
X402_PRICE=100000             # in wei
```

### Chain Configuration

| Item | Value |
|---|---|
| Main Chain | ETH Sepolia |
| Cobo Chain ID | `SETH` |
| Chain ID | `11155111` |
| x402 Facilitator | `https://x402.4mica.xyz` |
| ERC-8004 Registry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| 8004scan | [8004scan.io](https://www.8004scan.io/) |

### References

- [Cobo Agentic Wallet](https://www.cobo.com/products/agentic-wallet/manual/start-here/introduction)
- [CAW Security & Control](https://www.cobo.com/products/agentic-wallet/manual/security/overview)
- [CAW Developer Docs](https://www.cobo.com/products/agentic-wallet/manual/developer/quickstart-overview)
- [Vercel AI SDK](https://ai-sdk.dev/docs/introduction)
- [agent0-sdk](https://sdk.ag0.xyz/docs)
- [x402 Protocol](https://docs.x402.org/getting-started/quickstart-for-buyers)
- [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004)

### License

MIT

---

<a id="中文"></a>

## 🇨🇳 中文

### 背景

AI Agent 经济正在崛起。2026 年，自主 AI Agent 不再只是聊天机器人——它们是需要**独立发现服务、完成支付、管理资金、进行链上交易**的经济参与者。

然而，当前生态缺乏安全、标准化的 Agent 原生金融基础设施：

- **没有自主支付层** — Agent 无法在没有人工干预的情况下为服务付费
- **没有安全托管方案** — 私钥管理要么中心化，要么将密钥暴露给 Agent
- **没有可验证身份** — Agent 没有可以被信任或发现的链上身份
- **没有权限边界** — 没有机制让人类控制 Agent 在金融上能做什么、不能做什么

### 解决的问题

| 痛点 | 传统方案 | 我们的方案 |
|------|---------|-----------|
| **Agent 无法自主支付** | 人工充值 + 手动授权 | x402 协议：HTTP 402 自动支付，一个 API 调用完成支付 |
| **资金安全无保障** | 私钥暴露 / 中心化托管 | Cobo Agentic Wallet：MPC 多签，无私钥暴露 |
| **链上身份不可信** | 无身份 / 可伪造地址 | ERC-8004：链上 Agent 注册，可发现、可验证 |
| **无人类控制边界** | 全权限或无权限 | Pact 权限：细粒度策略（transfer / contract_call / message_sign） |
| **Agent 间无法协作** | 每个 Agent 孤立 | A2A 协议：标准化的 Agent 间发现与通信 |

### 产品目标

让 AI Agent 成为互联网的**一等经济公民**：

```
Agent 自主发现服务 → 自主支付 → 自主获取数据 → 自主决策 → 自主执行
```

- ✅ Agent 独立管理钱包（MPC 多签，无私钥暴露）
- ✅ Agent 自动完成 x402 支付
- ✅ Agent 在链上注册身份（ERC-8004）
- ✅ 人类通过 Pact 控制 Agent 权限边界
- ✅ 完整审计链路，每个操作可追溯

### 核心功能

#### 🤖 AI Agent — 对话式操作

用户用自然语言下达指令，Agent 自主执行：

- "帮我分析 ETH 链上数据" → Agent 发现服务 → x402 支付 → 获取数据 → 返回分析结果
- "查一下我的余额" → Agent 调用 CAW API → 返回实时余额
- "注册我的 Agent 身份" → Agent 调用 contractCall → 链上写入 ERC-8004

#### 💰 Cobo Agentic Wallet 集成

- **钱包管理**: 创建 / 切换 / 查看余额（MPC 多签）
- **资金操作**: 充值 / 转账 / 水龙头领取测试币
- **权限控制**: Pact 策略管理（transfer / contract_call / message_sign）
- **审计日志**: SSE 实时推送，完整操作链路追溯

#### 🔐 x402 支付协议

```
Agent 请求 API → 402 Payment Required → Agent 自动支付 → 获取数据
```

- 基于 HTTP 402 状态码的原生支付协议
- CAW `payment()` API 原生支持 x402
- 支持 ETH/USDC 等多种代币
- 4mica Facilitator 链上结算

#### 📜 ERC-8004 链上身份

- Agent 在以太坊 Sepolia 测试网注册身份
- 通过 CAW `contractCall()` + viem 编码实现
- 链上可验证、不可伪造
- 为 Agent 信誉系统奠定基础

#### 🌐 A2A 协议 — Agent 间发现与通信

- `.well-known/agent-card.json` 标准 Agent 发现
- JSON-RPC 端点支持 Agent 间通信
- Agent 可以发现并调用其他 Agent 的付费服务

### 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn/ui, Zustand |
| AI | Vercel AI SDK, DashScope (qwen3.6-27b), ToolLoopAgent |
| 钱包 | Cobo Agentic Wallet SDK (`@cobo/cobo-agentic-wallet-kit`) |
| 支付 | x402 协议 (`@x402/next`, `@x402/core`, `@x402/evm`) |
| 身份 | ERC-8004 (`agent0-sdk`, `viem`) |
| 存储 | Pinata IPFS |
| 链 | Ethereum Sepolia 测试网 |

### 系统架构

```
┌──────────────────────────────────────────────────────────┐
│                       用户界面层                          │
│     AI 对话 · 钱包仪表盘 · 交易记录 · 活动日志            │
│     充值/转账弹窗 · 水龙头 · Agent 思考过程展示           │
├──────────────────────────────────────────────────────────┤
│                       AI Agent 层                         │
│        ToolLoopAgent (Vercel AI SDK + DashScope)           │
│   工具: discover · callPaidAPI · checkBalance · pay       │
├──────────────────────────────────────────────────────────┤
│                    服务层 (Next.js API)                    │
│    x402 付费 API · 钱包 API · 审计 SSE · Pact 管理        │
├──────────────────────────────────────────────────────────┤
│                       基础设施层                           │
│   Cobo Agentic Wallet · x402 协议 · ERC-8004              │
│   Ethereum Sepolia · 4mica Facilitator · Pinata IPFS      │
└──────────────────────────────────────────────────────────┘
```

### API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/chat` | POST | AI Agent 对话（流式响应） |
| `/api/wallet/status` | GET | 钱包状态 & 地址 |
| `/api/wallet/create` | POST | 创建新钱包 |
| `/api/wallet/switch` | POST | 切换活跃钱包 |
| `/api/wallet/balance` | GET | 查询代币余额 |
| `/api/wallet/transfer` | POST | 转账 |
| `/api/wallet/transactions` | GET | 交易记录 |
| `/api/wallet/audit/stream` | GET | 审计日志 (SSE) |
| `/api/wallet/pact/create` | POST | 创建 Pact 权限策略 |
| `/api/wallet/faucet` | POST | 领取测试币 |
| `/api/data/eth-analysis` | GET | x402 付费 API |
| `/api/data/market-prediction` | GET | x402 付费 API |
| `/api/data/gas-optimizer` | GET | x402 付费 API |
| `/.well-known/agent-card.json` | GET | A2A Agent 发现 |
| `/a2a` | POST | A2A JSON-RPC 端点 |

### Agent 工具集

| 工具 | 功能 | 底层 API |
|------|------|---------|
| `discoverServices` | 搜索付费数据服务 | 本地服务列表 |
| `callPaidAPI` | 调用 x402 付费 API | CAW `payment()` |
| `checkBalance` | 查询钱包余额 | CAW `listBalances()` |
| `makePayment` | 直接转账 | CAW `transferTokens()` |
| `getTransactionStatus` | 查询交易记录 | CAW `listTransactions()` |

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
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_API_KEY=sk-xxx
AI_MODEL_NAME=qwen3.6-27b

# Pinata（IPFS 上传，ERC-8004 注册用）
PINATA_JWT=xxx

# x402
X402_PAYEE_ADDRESS=0x...
X402_PRICE=100000             # 单位 wei
```

### 链配置

| 项目 | 值 |
|------|-----|
| 主链 | ETH Sepolia |
| Cobo 链 ID | `SETH` |
| Chain ID | `11155111` |
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
- [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004)
- [Next.js 文档](https://nextjs.org/docs)

### 开源协议

MIT
