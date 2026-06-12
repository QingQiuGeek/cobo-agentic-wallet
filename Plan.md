# Cobo Agentic Wallet Hackathon 计划

## 项目概述

**赛道：** Track 01 — Agent-Native Payments（Agent 原生支付）

**核心理念：** 让 AI Agent 成为互联网的一等支付公民。Agent 通过 x402 协议自动发现付费服务，使用 Cobo Agentic Wallet（CAW）自主完成稳定币支付（当前 x402 生态以 USDC 为主），同时在链上注册身份（ERC-8004）并对外提供付费服务——真正的一等支付公民。

**核心卖点：**

- 🔗 **遵循开放标准：** x402 支付协议 + ERC-8004 Agent 注册 + A2A Agent 通信
- 💰 **真实链上交易：** 稳定币（USDC）支付，交易哈希可查证
- 🆔 **链上身份可发现：** 注册后在 [8004scan.io](https://www.8004scan.io/) 可被任何人/Agent 扫描到
- 🔄 **双向能力：** 既能付费调用别人的服务，也能对外提供付费服务
- 🔐 **CAW 价值体现：** 钱包管理、权限控制、安全隔离、自主支付

**演示流程（5 分钟）：**

1. 用户向 Agent 下达任务："帮我获取 ETH 链上分析报告"
2. Agent 发现付费数据服务（通过 x402 402 响应 / A2A agent-card）
3. Agent 调用该服务 → 收到 HTTP 402 + 稳定币支付指令（当前生态为 USDC）
4. Agent 通过 CAW `payment()` API 自动完成支付 → 获取数据
5. 仪表盘实时展示：钱包余额变动、交易记录、Agent 链上身份
6. （加分）另一个 Agent 通过 A2A 协议调用本 Agent 的付费服务

---

## 技术栈

### 已安装的依赖（package.json）

| 类别        | 包名                               | 版本     | 状态      | 说明                                |
| ----------- | ---------------------------------- | -------- | --------- | ----------------------------------- |
| 框架        | next                               | 16.2.9   | ✅ 已安装 | 全栈框架，App Router                |
| UI          | react / react-dom                  | 19.2.4   | ✅ 已安装 | UI 渲染                             |
| AI          | ai                                 | ^6.0.202 | ✅ 已安装 | Vercel AI SDK，Agent 编排、工具调用 |
| AI Provider | @ai-sdk/openai                     | ^3.0.70  | ✅ 已安装 | OpenAI GPT-4o 后端                  |
| 钱包        | @cobo/agentic-wallet               | ^0.1.7   | ✅ 已安装 | CAW 钱包管理、余额、交易、Pact      |
| Schema      | zod                                | ^4.4.3   | ✅ 已安装 | 工具参数校验                        |
| 样式        | tailwindcss / @tailwindcss/postcss | ^4       | ✅ 已安装 | 原子化 CSS                          |
| 语言        | typescript                         | ^5       | ✅ 已安装 | 类型安全                            |

### 待安装的依赖

| 类别        | 包名                   | 版本    | 说明                                              |
| ----------- | ---------------------- | ------- | ------------------------------------------------- |
| 环境变量    | dotenv                 | ^16.x   | .env 文件加载                                     |
| 主题切换    | next-themes            | latest  | Next.js 官方主题管理                              |
| x402 服务端 | @x402/next             | ^2.14.0 | 卖方：Next.js 原生集成（withX402 + paymentProxy） |
| x402 核心   | @x402/core + @x402/evm | ^2.14.0 | 支付协议核心 + EVM 验证方案（卖方收款端用）       |
| 链上交互    | viem                   | ^2.52.2 | ERC-8004 calldata 编码 + @x402/evm 依赖          |

**注意：** 买方 x402 支付不再需要 `@x402/fetch`、`@x402/evm`，由 CAW `payment()` API 原生处理。

### 环境变量清单（.env）

```env
# === CAW（Cobo Agentic Wallet）===
AGENT_WALLET_API_URL=https://agentic-wallet.cobo.com  # CAW API 基础路径
AGENT_WALLET_API_KEY=your_cobo_api_key                 # CAW API Key
AGENT_WALLET_WALLET_ID=your_wallet_uuid                # CAW 钱包 UUID
AGENT_WALLET_ADDRESS=0xYourCawAddress                  # CAW 钱包链上地址
CAW_PROVISION_MODE=agent-first                         # "agent-first" 或 "paired"
CAW_PAIRING_TOKEN=                                     # paired 模式时填入配对码

# === AI 模型（OpenAI 兼容）===
AI_BASE_URL=https://api.openai.com/v1                 # OpenAI 兼容端点
AI_API_KEY=sk-xxx                                      # API Key
AI_MODEL_NAME=gpt-4o                                   # 模型名

# === Pinata（IPFS 上传，ERC-8004 注册用）===
PINATA_JWT=your_pinata_jwt                             # Pinata API Key

# === x402 服务端（卖方收款）===
X402_PAYEE_ADDRESS=0xYourCawAddress                    # x402 服务端收款地址（默认用 CAW 地址）
X402_PRICE=$0.001                                      # x402 服务默认价格
```

**不再需要：** `SIGNER_PRIVATE_KEY`、`RPC_URL`、`OPENAI_API_KEY`（统一用 `AI_API_KEY`）

### UI 配置

**组件库：** [shadcn/ui](https://ui.shadcn.com/docs/components) — 基于 Radix UI 的高质量组件库

**配色风格：** 黑白简约风（Black & White Minimal）

**主题切换：** 使用 Next.js 官方方案，全局主题切换

- 参考文档：[Preventing flash before hydration](https://nextjs.org/docs/app/guides/preventing-flash-before-hydration#themes)
- 实现方式：
  1. `next-themes` 包管理主题状态
  2. `<html>` 标签上设置 `class`（`dark` / `light`）
  3. Tailwind CSS 的 `dark:` 前缀实现暗色样式
  4. 在 `<head>` 中注入内联脚本防止闪烁（hydration mismatch）
- 切换按钮放在 Dashboard 右上角

```typescript
// app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var theme = localStorage.getItem('theme') || 'dark';
              document.documentElement.classList.add(theme);
            })()
          `
        }} />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**依赖兼容性：** 所有包已验证零冲突。`ai-sdk` 无链上依赖，`viem` 与 `@cobo/agentic-wallet` 正交。`viem` 用于 ERC-8004 注册的 calldata 编码和 `@x402/evm` 卖方验证。

---

## CAW（Cobo Agentic Wallet）能力分析

基于 SDK 源码（`@cobo/agentic-wallet` v0.1.7）的完整 API 分析。

### CAW 完整 API 清单（16 个模块）

| API 模块                  | 能力             | 关键方法                                                                                                                               |
| ------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **WalletsApi**            | 钱包管理         | `createWallet`, `createWalletAddress`, `listWallets`, `getWallet`, `updateWallet`                                                      |
| **WalletsApi**            | 钱包配对         | `initiateWalletPair`（生成 8 位配对码）, `confirmWalletPair`（确认配对）, `walletReshare`（密钥轮换）                                  |
| **BalanceApi**            | 余额查询         | `listBalances`（按钱包/链/地址/代币过滤，支持 `force_refresh` 从链上刷新）                                                             |
| **TransactionsApi**       | 代币转账         | `transferTokens`（发送 ETH/USDC 等）                                                                                                   |
| **TransactionsApi**       | 智能合约调用     | `contractCall`（调用任意合约，受 Pact 权限控制）                                                                                       |
| **TransactionsApi**       | **x402 支付**    | `payment()`（原生 x402/MPP 协议支持，无需私钥）                                                                                        |
| **TransactionsApi**       | 消息签名         | `messageSign`（EIP-712 结构化签名）                                                                                                    |
| **TransactionsApi**       | 手续费估算       | `estimateTransferFee`, `estimateContractCallFee`                                                                                       |
| **TransactionsApi**       | 交易管理         | `dropTransaction`（取消）, `speedupTransaction`（加速）, `listRecentAddresses`                                                         |
| **PactsApi**              | 权限控制（核心） | `submitPact`（定义 Agent 可做什么）, `getPact`, `listPacts`, `getWalletPactStats`, `getWalletPactHistory`                              |
| **PendingOperationsApi**  | 审批流程         | `approvePendingOperation`, `rejectPendingOperation`, `listPendingOperations`, `getPendingOperation`                                    |
| **AuditApi**              | 审计日志         | `listAuditLogs`（按钱包/主体/操作/结果/时间过滤）                                                                                      |
| **FaucetApi**             | 测试币水龙头     | `deposit`（领取测试币）, `listTokens`（查看可用测试币）                                                                                |
| **IdentityApi**           | 身份管理         | `createPrincipal`, `createApiKey`（带 scopes）, `provisionAgent`, `listAgents`, `getAgentStatus`                                       |
| **MetadataApi**           | 链/代币元数据    | `listChains`（支持的链）, `listAssets`（支持的代币）, `searchTokens`（按符号搜索）, `getChainInfoByChainId`, `ethCall`（只读合约调用） |
| **RecipesApi**            | 知识库           | `searchRecipes`（自然语言搜索操作模板）                                                                                                |
| **CoinPriceApi**          | 币价查询         | `getAssetCoinPrices`（获取代币价格）                                                                                                   |
| **TransactionRecordsApi** | 交易记录         | `getUserTransaction`, `getUserTransactionByRequestId`, `listTransactionRecords`                                                        |
| **SuggestionsApi**        | 错误提示         | `getSuggestion`（结构化错误消息和建议）                                                                                                |
| **TelemetryApi**          | 性能追踪         | `ingestSessionTelemetry`, `getTelemetryConfig`                                                                                         |
| **HealthApi**             | 健康检查         | `healthCheck`                                                                                                                          |

### CAW 不能做的

| 能力            | 说明                                         | 替代方案                         |
| --------------- | -------------------------------------------- | -------------------------------- |
| ❌ 暴露私钥     | CAW 是 WaaS API，私钥由 Cobo MPC/TSS 托管    | 不需要暴露私钥，所有操作通过 API |
| ❌ A2A 协议内建 | 没有 Agent-to-Agent 发现/通信                | 自建 A2A 端点（Next.js route）   |
| ❌ 前端 UI 组件 | 没有 React 组件、钱包连接弹窗、嵌入式 Widget | 自建 Dashboard（shadcn/ui）      |

**CAW 能做的（之前误判为不能做）：**

- ✅ x402 支付：`payment()` API 原生支持 x402 协议
- ✅ 合约调用：`contractCall()` API 可调用任意合约（包括 ERC-8004 注册）
- ✅ 消息签名：`messageSign()` API 支持 EIP-712 签名

### Cobo 链 ID 格式

CAW 使用自己的链 ID 和 Token ID 格式，不是公链名称：

| Cobo 链 ID      | 对应链                    | Cobo Token ID   | 对应代币        |
| --------------- | ------------------------- | --------------- | --------------- |
| `SETH`          | Ethereum Sepolia (测试网) | `SETH`          | ETH on Sepolia  |
| `SETH_USDC`     | —                         | `SETH_USDC`     | USDC on Sepolia |
| `BASE_ETH`      | Base                      | `BASE_ETH`      | ETH on Base     |
| `BASE_ETH_USDC` | —                         | `BASE_ETH_USDC` | USDC on Base    |
| `ETH`           | Ethereum Mainnet          | `ETH`           | ETH mainnet     |
| `SOL`           | Solana                    | `SOL`           | SOL             |

**使用方式：**

- `createWalletAddress({ chain_id: "BASE_ETH" })` — 派生 Base 链地址
- `listBalances({ chain_id: "BASE_ETH", token_id: "BASE_ETH_USDC" })` — 查 USDC 余额
- `contractCall({ chain_id: "BASE_ETH", contract_addr: "0x...", calldata: "0x..." })` — 调用合约
- `transferTokens({ token_id: "BASE_ETH_USDC", dst_addr: "0x...", amount: "1.0" })` — 转 USDC

**动态发现：** `MetadataApi.listChains()` 和 `MetadataApi.searchTokens("USDC")` 可以查询支持的链和代币。

**对 ERC-8004 注册的影响：** 无影响。`contractCall()` 的 `chain_id` 用 `BASE_ETH`，合约地址 `0x8004A818BFB912233c491871b3d84c89A494BD9e` 是 EVM 地址，与 Cobo 链 ID 格式无关。

### x402 支付细节

CAW `payment()` API 的 `x402_payment_required` 字段是 **Base64 编码的 JSON 字符串**：

```typescript
const paymentResult = await txApi.payment(walletId, {
	protocol: 'x402',
	x402_payment_required: Buffer.from(JSON.stringify(challenge)).toString(
		'base64',
	), // ← Base64 编码
	request_id: `x402-${Date.now()}`,
});

// 返回：
// - status: "completed" / "submitted" / "failed"
// - retry_headers: { "PAYMENT-SIGNATURE": "..." }
// - tx_hash: "0x..."（链上交易哈希）
```

### 安全控制：Pact → Policy → 审批 三层机制

```
Agent 发起操作（transfer / contractCall / payment / messageSign）
    ↓
第 1 层：Pact 策略评估
    ├─ 匹配 allow 规则 → 检查 deny_if 条件
    │   ├─ 未触发 deny_if → ✅ 直接执行
    │   └─ 触发 deny_if → ❌ 拒绝 + SuggestionKey 错误提示
    ├─ 无匹配规则 → ❌ 拒绝（默认拒绝）
    └─ 需要人工审批 → PENDING_APPROVAL
                        ↓
第 2 层：PendingOperationsApi 审批
    ├─ Owner 审批 → ✅ 执行
    └─ Owner 拒绝 → ❌ 取消（附原因）

第 3 层：AuditApi 审计
    → 所有操作记录到审计日志（allowed/denied/pending）
```

**Pact 策略类型：**

| 类型            | 匹配条件                       | deny_if 条件            |
| --------------- | ------------------------------ | ----------------------- |
| `transfer`      | `chain_in`, `token_in`         | `amount_gt`（单笔限额） |
| `contract_call` | `chain_in`, `contract_addr_in` | 合约白名单外拒绝        |
| `message_sign`  | `chain_in`                     | 签名请求类型限制        |

**Agent-first 模式（无人类 owner）：** Agent 自己提交 Pact，自动激活，无需审批。适合 Hackathon 演示。

**Paired 模式（有人类 owner）：** Agent 提交 Pact → 等待 Owner 在 Cobo App 审批 → 激活。超限操作需要 Owner 逐笔审批。

### Agent-first / Paired 模式配置

两种模式的区别仅在 `provisionAgent()` 是否传 `token` 参数：

```typescript
// Agent-first（默认，适合演示）
const result = await identityApi.provisionAgent({ name: "CoboAgent" });
// → { agent_id, api_key, status: "active" }
// → 无 owner_id → Pact 自动激活

// Paired（生产环境）
const result = await identityApi.provisionAgent({
  name: "CoboAgent",
  token: "12345678",  // Cobo App 生成的配对码
});
// → { agent_id, api_key, status: "active", owner_id: "..." }
// → 有 owner_id → Pact 需要 owner 审批
```

**通过 .env 配置切换：**

```env
# Agent-first 模式（默认）
CAW_PROVISION_MODE=agent-first

# Paired 模式
# CAW_PROVISION_MODE=paired
# CAW_PAIRING_TOKEN=12345678
```

```typescript
// lib/caw-init.ts
async function initAgent() {
  const mode = process.env.CAW_PROVISION_MODE || "agent-first";
  const request: ProvisionRequest = { name: "CoboAgent" };
  if (mode === "paired") {
    request.token = process.env.CAW_PAIRING_TOKEN!;
  }
  return identityApi.provisionAgent(request);
}
```

**SDK 的 SuggestionKey 证实了行为差异：**
- `PACT_SUBMIT_SUCCESS_UNPAIRED` → Agent-first，Pact 自动激活
- `PACT_SUBMIT_SUCCESS_PAIRED` → Paired，等待 owner 审批
- `PACT_SUBMIT_ALWAYS_REVIEW_UNPAIRED` → 某些操作即使 unpaired 也需要审批

### CAW 内置测试币水龙头

`FaucetApi` 是 CAW SDK 的内置模块，通过 CAW API Key 认证，直接从 Cobo 后端领取测试币：

```typescript
// 查看可用测试币
const tokens = await faucetApi.listTokens();
// → [{ chain_id: "SETH", tokens: { "SETH": { deposit_amount: "0.1", daily_limit: "1.0" }, ... } }]

// 领取测试币到 CAW 钱包地址
await faucetApi.deposit({
  address: "0xCAW...",
  token_id: "BASE_ETH",      // Base Sepolia ETH
});
await faucetApi.deposit({
  address: "0xCAW...",
  token_id: "BASE_ETH_USDC", // Base Sepolia USDC
});
```

**限制：** 每日领取上限（`daily_limit`），超限返回 HTTP 429。

### CAW 钱包模式：createWallet vs initiateWalletPair

**这是两个独立流程，不是同一个流程的两步。**

#### 模式 A：Agent 自有钱包（createWallet，不需要配对）

```
provisionAgent()  ← 无 token，agent-first 模式，获得 API key
       ↓
createWallet(group_type: "agent")  ← 创建 MPC 钱包
       ↓                              密钥分片：Agent TSS 节点 1 片 + Cobo 1 片 (2-of-2)
createWalletAddress(chain_id: "BASE_ETH")  ← 派生链上地址
       ↓
钱包创建完成，Agent 直接可用
transferTokens / listBalances / contractCall / ...
全程无人类参与，Agent 完全自主
```

#### 模式 B：人类已有钱包（provisionAgent + token，需要配对）

```
人类在 Cobo App 生成配对码
       ↓
provisionAgent(token: "配对码")  ← Agent 绑定到人类 owner
       ↓
人类的钱包对 Agent 可见
Agent 操作受 Pact 权限控制，超限操作需要人类审批
```

#### initiateWalletPair 的作用（钱包所有权转移）

```
Agent 已有一个自有钱包（模式 A 创建的）
       ↓
想把所有权转移给人类？
       ↓
initiateWalletPair(wallet_id) → 生成 8 位配对码
       ↓
人类在 Cobo App 输入配对码
       ↓
confirmWalletPair()
       ↓
钱包所有权从 Agent → 人类
人类成为 owner，Agent 变为受控代理
```

|                | createWallet           | initiateWalletPair                 |
| -------------- | ---------------------- | ---------------------------------- |
| **目的**       | 创建新钱包             | 把已有钱包的所有权转移给人类       |
| **谁调用**     | Agent                  | Agent                              |
| **前置条件**   | 有 API key + TSS node  | 钱包已存在且 Agent 拥有            |
| **结果**       | 新钱包，Agent 是 owner | 生成配对码，等人类确认后所有权转移 |
| **需要人类？** | ❌ 不需要              | ✅ 需要人类在 Cobo App 确认        |

#### CAW vs MetaMask：完全不同的架构

|              | MetaMask                   | CAW                                  |
| ------------ | -------------------------- | ------------------------------------ |
| **密钥存储** | 浏览器插件里的私钥         | MPC 2-of-2 分片（Agent/Cobo 各一片） |
| **签名方式** | 用户在弹窗里点"确认"       | Agent TSS 节点 + Cobo 服务器联合签名 |
| **连接方式** | WalletConnect / 浏览器注入 | API Key + HTTP                       |
| **用户交互** | 弹窗确认交易               | Cobo App 里的配对码 / Pact 审批      |
| **本质**     | 私钥管理器                 | 托管式 MPC 钱包服务                  |

**CAW 没有 MetaMask 式弹窗连接机制**，因为签名不在用户浏览器里发生，而是在 Agent TSS 节点 + Cobo 服务器之间通过 MPC 协议完成。

### 钱包功能选项

项目支持两种 CAW 钱包接入方式，Dashboard 上提供切换：

#### 选项 1：Agent 创建新钱包（默认，推荐演示）

```
点击 "创建 Agent 钱包"
  → CAW createWallet() + createWalletAddress()
  → faucet.deposit() 领测试币
  → submitPact() 设置权限
  → 完成，Agent 自主运行
```

#### 选项 2：用户连接已有钱包（配对模式）

```
点击 "连接已有钱包"
  → 用户在 Cobo App 生成配对码
  → CAW provisionAgent(token: "配对码")
  → 完成，Agent 在 Pact 范围内操作人类钱包
```

#### Dashboard UI 设计

```
┌──────────────────────────────────────────────────────────┐
│  Cobo Agentic Wallet — Agent Native Payments 🌓          │
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│  💰 钱包     │   [创建新钱包] [连接已有钱包]              │
│  0xCAW...    │                                           │
│  ETH: 0.5   │   余额：ETH 0.5 / USDC $10.00             │
│  USDC: $10  │   权限：单笔 ≤ $1 USDC，24h 有效          │
│              │                                           │
│  ─────────── │   🤖 Agent 对话                           │
│  🆔 注册     │   ┌───────────────────────────────────┐   │
│  Base ✅ #123│   │ 用户: 获取ETH链上分析报告          │   │
│  ETH  ❌     │   │ Agent: CAW 支付$0.001 USDC...      │   │
│  [注册到ETH] │   │ Agent: 报告如下...                  │   │
│              │   └───────────────────────────────────┘   │
├──────────────┤                                           │
│  🏪 我的服务 │   ┌─ [交易记录] [操作日志] ────── ▼ ───┐ │
│  /api/eth... │   │ #1  $0.001→0xABC  ✅  14:02       │ │
│  /api/mkt... │   │ #2  $0.002→0xDEF  ✅  14:01       │ │
│              │   │      [< 1 2 3 >]                   │ │
│              │   └─────────────────────────────────────┘ │
└──────────────┴───────────────────────────────────────────┘
```

### Pact 权限控制机制（CAW 核心差异化）

Pact 是 CAW 的核心安全机制——Agent 不是无限制地操作钱包，而是在 Pact 定义的范围内运行：

```typescript
// 示例：定义 Agent 的权限边界
const pact = await pactsApi.submitPact({
	wallet_id: walletId,
	intent: 'Transfer tokens for x402 payments',
	spec: {
		policies: [
			{
				name: 'x402-payment-limit',
				type: 'transfer',
				rules: {
					effect: 'allow',
					when: {
						chain_in: ['BASE_ETH'],
						token_in: [{ chain_id: 'BASE_ETH', token_id: 'BASE_ETH_USDC' }],
					},
					deny_if: { amount_gt: '1.0' }, // 单笔超过 $1 拒绝
				},
			},
		],
		completion_conditions: [{ type: 'time_elapsed', threshold: '86400' }], // 24h 有效期
	},
});

// 后续用 pact-scoped API key 操作
// 超限操作会被拒绝，返回结构化错误 + 建议
```

**演示亮点：** Agent 尝试超额支付 → 被 Pact 拒绝 → 自动调整金额重试 → 成功。这是 CAW 独有的安全价值。

---

## 区块链支持分析

各依赖对测试网的支持情况，用于确定项目的主链。

### ERC-8004 注册支持

| 链                 | Chain ID  | Identity Registry 合约                       | 8004scan                         | 状态        |
| ------------------ | --------- | -------------------------------------------- | -------------------------------- | ----------- |
| **ETH Sepolia**    | 11155111  | `0x8004A818BFB912233c491871b3d84c89A494BD9e` | 8004scan.io/agents/sepolia/      | ✅ 可用     |
| **Base Sepolia**   | 84532     | `0x8004A818BFB912233c491871b3d84c89A494BD9e` | 8004scan.io/agents/base-sepolia/ | ✅ 可用     |
| Polygon Amoy       | 80002     | —                                            | —                                | 🔜 即将支持 |
| Monad Testnet      | 10143     | —                                            | —                                | 🔜 即将支持 |
| Avalanche Fuji     | 43113     | —                                            | —                                | 🔜 即将支持 |
| SKALE Base Sepolia | 324705682 | —                                            | —                                | 🔜 即将支持 |

### x402 支付支持

| 链                 | Chain ID  | Facilitator   | x402 Provider | USDC 地址                                    | 状态              |
| ------------------ | --------- | ------------- | ------------- | -------------------------------------------- | ----------------- |
| **Base Sepolia**   | 84532     | PayAI         | payai         | SDK 内置默认                                 | ✅ 最佳           |
| **ETH Sepolia**    | 11155111  | 4mica         | 4mica         | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | ✅ 可用           |
| **Polygon Amoy**   | 80002     | PayAI + 4mica | payai         | `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582` | ✅ 可用           |
| SKALE Base Sepolia | 324705682 | PayAI         | payai         | `0x2e08028E3C4c2356572E096d8EF835cD5C6030bD` | ✅ 可用           |
| Monad Testnet      | 10143     | —             | —             | —                                            | ❌ 无 facilitator |
| Avalanche Fuji     | 43113     | —             | —             | —                                            | ❌ 无 facilitator |

### CAW（Cobo Agentic Wallet）支持

CAW 使用 Cobo 内部链 ID 格式：

- `SETH` = Ethereum Sepolia（测试网）
- `BASE_ETH` = Base Sepolia（测试网）
- `SOL` = Solana

CAW 通过 Faucet API 提供测试币领取，具体可用币种通过 `faucet.listTokens()` 查询。

### 推荐链：Base Sepolia

| 维度          | Base Sepolia         | ETH Sepolia          | Polygon Amoy     |
| ------------- | -------------------- | -------------------- | ---------------- |
| ERC-8004 注册 | ✅ 可用              | ✅ 可用              | ❌ 不支持        |
| x402 支付     | ✅ PayAI facilitator | ✅ 4mica facilitator | ✅ PayAI + 4mica |
| CAW 支持      | ✅ `BASE_ETH`        | ✅ `SETH`            | ⚠️ 需确认        |
| 交易速度      | ~2 秒                | ~12 秒               | ~2 秒            |
| 交易费用      | 极低（L2）           | 较高（L1）           | 极低             |
| x402 生态     | Coinbase 原生支持    | 一般                 | 一般             |
| 水龙头        | Coinbase faucet      | Google faucet        | Polygon faucet   |

**结论：选择 Base Sepolia 作为主链。** 原因：

1. Coinbase 的 L2，x402 协议原生支持（x402 就是 Coinbase 发起的）
2. ERC-8004 注册可用
3. CAW 支持（`BASE_ETH`）
4. 交易快、费用低
5. Coinbase 提供测试币水龙头

---

## 架构设计

### Agent 架构：ToolLoopAgent

采用 **单 Agent + 工具循环** 模式（非主从多 Agent、非 Workflow）：

- Agent 自主决策调用哪些工具、何时支付、是否重试
- `maxSteps: 10` 控制最大工具调用轮次
- 比主从多 Agent 更简单，比 Workflow 更灵活

### 单 CAW 钱包架构

**所有操作通过 CAW API 完成，不需要暴露私钥，不需要额外钱包。**

```
CAW 钱包 (0xCAW)  ← 唯一的钱包
  │
  ├─ ERC-8004 注册：contractCall() → Identity Registry 合约
  ├─ x402 支付：payment() → 原生 x402 协议支持
  ├─ 余额查询：listBalances()
  ├─ 交易记录：TransactionRecordsApi
  ├─ Pact 权限：submitPact()
  ├─ 审计日志：listAuditLogs()
  ├─ 测试币：faucet.deposit()
  │
  └─ 8004scan 显示的地址 = CAW 地址 ✅
```

**CAW 的不可替代价值：**

| CAW 能力      | 自己用私钥能做吗         | CAW 优势                       |
| ------------- | ------------------------ | ------------------------------ |
| 余额查询      | 需自己调 RPC             | 一行 API，支持多链             |
| x402 支付     | 需自己编码 EIP-3009 签名 | `payment()` 原生支持，无需私钥 |
| ERC-8004 注册 | 需自己编码合约调用       | `contractCall()` 通用合约调用  |
| 权限控制      | 无                       | Pact：单笔限额、合约白名单     |
| 交易记录      | 需自己索引链上数据       | API 直接查询                   |
| 合规审计      | 无                       | Cobo 提供审计日志              |
| 安全隔离      | 私钥暴露风险             | MPC 托管，永不暴露             |

### 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App                              │
│                                                                  │
│  ┌─────────────────┐    ┌──────────────────────────────────────┐│
│  │   Dashboard       │    │   Agent (ai-sdk ToolLoopAgent)       ││
│  │  ┌─────────────┐ │    │                                      ││
│  │  │ CAW 余额    │ │    │  Tools:                              ││
│  │  │ USDC 余额   │ │    │  ├─ discoverServices()  → 服务列表   ││
│  │  │ 交易记录    │ │    │  ├─ callPaidAPI()       → CAW pay()  ││
│  │  │ Agent 身份  │ │    │  ├─ makePayment()       → CAW tx()   ││
│  │  │ 8004scan ↗  │ │    │  ├─ checkBalance()      → CAW bal()  ││
│  │  └─────────────┘ │    │  └─ getTxStatus()       → CAW rec()  ││
│  │  ┌─────────────┐ │    │                                      ││
│  │  │ Chat 界面   │ │    │  maxSteps: 10                        ││
│  │  └─────────────┘ │    │                                      ││
│  └─────────────────┘    └──────────────────────────────────────┘│
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API Routes                              │   │
│  │  POST /api/chat          → ai-sdk Agent 流式对话          │   │
│  │  GET  /api/wallet/*      → CAW 钱包操作（余额/交易）      │   │
│  │  GET  /api/paid-service  → x402 付费服务端（收款→CAW）    │   │
│  │  POST /api/register      → ERC-8004 链上注册              │   │
│  │  GET  /.well-known/agent-card.json → A2A 发现卡片         │   │
│  │  POST /a2a               → A2A JSON-RPC 端点              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              @cobo/agentic-wallet (CAW)               │      │
│  │  contractCall() → ERC-8004 注册                       │      │
│  │  payment()      → x402 支付（原生支持）               │      │
│  │  listBalances() → 余额查询                            │      │
│  │  submitPact()   → 权限控制                            │      │
│  │  listAuditLogs()→ 审计日志                            │      │
│  │  所有操作通过 API，无需私钥                           │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## MVP 功能清单

### F1 — CAW 钱包集成（2h）

通过 CAW API 创建和管理 Agent 钱包。**无需私钥，所有操作通过 HTTP API。**

**范围：**

- 接入 `@cobo/agentic-wallet` SDK
- 创建 CAW 钱包（`createWallet`）+ 派生 Base Sepolia 地址
- 领取测试币（`faucet.deposit`）
- 余额查询（`listBalances`）
- 创建 Pact 权限（`submitPact`：允许合约调用 + 转账）
- 封装为 `CAWService` 供 Agent 工具调用

**验收标准：**

- CAW 钱包创建成功，有 Base Sepolia 地址
- 能通过 API 查询 Agent 钱包的 ETH 和 USDC 余额
- Pact 创建成功，权限范围正确

---

### F2 — x402 付费服务端（1.5h）

构建一个**真实的** x402 兼容付费 API——不是 mock，是遵循 x402 协议的真实服务端。使用 `@x402/next` 原生集成 Next.js，无需独立 Express 服务。

**范围：**

- 使用 `@x402/next` 的 `withX402` 包装 Next.js API route
- 提供多种付费数据场景：
  - `/api/data/eth-analysis` — ETH 链上分析报告（$0.001 USDC）
  - `/api/data/market-signal` — 市场信号数据（$0.002 USDC）
- 未支付时返回 `402 Payment Required` + 标准 x402 v2 支付指令
- 收到有效稳定币（USDC）支付后返回 200 + 数据
- 收款地址为 Agent 自己的 CAW 钱包

**实现代码（Next.js API Route）：**

```typescript
// app/api/data/eth-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withX402, x402ResourceServer } from '@x402/next';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { ExactEvmScheme } from '@x402/evm/exact/server';

const facilitatorClient = new HTTPFacilitatorClient({
	url: 'https://facilitator.payai.network',
});
const server = new x402ResourceServer(facilitatorClient).register(
	'eip155:84532',
	new ExactEvmScheme(),
);

const handler = async (_: NextRequest) => {
	return NextResponse.json({
		report: 'ETH on-chain analysis...',
		timestamp: new Date().toISOString(),
	});
};

export const GET = withX402(
	handler,
	{
		accepts: {
			scheme: 'exact',
			price: '$0.001',
			network: 'eip155:84532',
			payTo: process.env.AGENT_WALLET_ADDRESS!,
		},
		description: 'ETH Chain Analysis Report',
	},
	server,
);
```

**x402 协议流程：**

```
Client → GET /api/data/eth-analysis
Server → 402 + { x402Version: 2, accepts: [{ scheme: "exact", network: "eip155:84532", ... }] }
Client → 重新请求 + X-PAYMENT header (稳定币支付签名)
Server → 200 + 数据 + X-PAYMENT-RESPONSE header (交易凭证)
```

**验收标准：**

- 外部客户端（curl / Agent）可通过 x402 协议付费调用
- 支付到账后余额增加
- 交易哈希可追溯

---

### F3 — AI Agent 核心 — ToolLoopAgent（3.5h）

构建具备支付自主权的 AI Agent。使用 Vercel AI SDK + OpenAI 兼容接口，支持任意模型。

#### LLM 配置（OpenAI 兼容）

```typescript
// lib/agent.ts
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { z } from 'zod';

// OpenAI 兼容配置 — 支持任意 OpenAI 兼容模型
const provider = createOpenAI({
	baseURL: process.env.AI_BASE_URL!, // 例：https://api.openai.com/v1
	apiKey: process.env.AI_API_KEY!, // 例：sk-xxx
});
const model = provider(process.env.AI_MODEL_NAME!); // 例：gpt-4o
```

**环境变量：**

```env
# === AI 模型配置（OpenAI 兼容）===
AI_BASE_URL=https://api.openai.com/v1    # 或任何兼容端点
AI_API_KEY=sk-xxx                         # API Key
AI_MODEL_NAME=gpt-4o                      # 模型名
```

**兼容的模型提供商：**

| 提供商        | AI_BASE_URL                    | AI_MODEL_NAME               |
| ------------- | ------------------------------ | --------------------------- |
| OpenAI        | `https://api.openai.com/v1`    | `gpt-4o`, `gpt-4o-mini`     |
| OpenRouter    | `https://openrouter.ai/api/v1` | `anthropic/claude-sonnet-4` |
| Ollama (本地) | `http://localhost:11434/v1`    | `llama3`, `qwen2`           |
| vLLM          | `http://localhost:8000/v1`     | 任意本地模型                |
| DeepSeek      | `https://api.deepseek.com/v1`  | `deepseek-chat`             |

#### 工具集详细设计

**工具 1：`discoverServices` — 发现付费数据服务**

```typescript
discoverServices: tool({
	description: '搜索可用的付费数据服务。返回服务列表，包含名称、价格、URL。',
	parameters: z.object({
		query: z.string().describe("搜索关键词，如 'ETH analysis', 'market data'"),
	}),
	execute: async ({ query }) => {
		// 从预注册的服务列表中搜索
		const services = await searchRegisteredServices(query);
		return services.map((s) => ({
			name: s.name,
			description: s.description,
			price: s.price, // "$0.001"
			url: s.url, // "https://api.example.com/data/eth-analysis"
			chain: 'Base Sepolia',
		}));
	},
});
```

| 参数    | 类型   | 必填 | 约束                   |
| ------- | ------ | ---- | ---------------------- |
| `query` | string | ✅   | 1-100 字符，搜索关键词 |

**工具 2：`callPaidAPI` — 调用付费 API（自动 x402 支付）**

```typescript
callPaidAPI: tool({
	description:
		'调用付费数据 API。如果返回 402，自动通过 CAW 支付稳定币（当前生态为 USDC）后获取数据。支付前会检查余额。',
	parameters: z.object({
		url: z.string().url().describe('付费 API 的 URL'),
		method: z.enum(['GET', 'POST']).default('GET').describe('HTTP 方法'),
	}),
	execute: async ({ url, method }) => {
		// 1. 检查余额
		const balance = await cawService.getUSDCBalance();
		if (balance < 0.01) throw new Error('余额不足，请先充值');

		// 2. 发起请求
		const response = await fetch(url, { method });
		if (response.status !== 402) return response.json();

		// 3. CAW 支付
		const challenge = await response.json();
		const result = await cawService.payX402(challenge);

		// 4. 重试
		const final = await fetch(url, {
			method,
			headers: result.retry_headers,
		});
		return { data: await final.json(), txHash: result.tx_hash };
	},
});
```

| 参数     | 类型         | 必填 | 约束                              |
| -------- | ------------ | ---- | --------------------------------- |
| `url`    | string (URL) | ✅   | 有效的 HTTP/HTTPS URL             |
| `method` | enum         | ❌   | `"GET"` 或 `"POST"`，默认 `"GET"` |

**工具 3：`checkBalance` — 查询钱包余额**

```typescript
checkBalance: tool({
	description: '查询 Agent 钱包的所有代币余额（ETH、USDC、USDT 等）。',
	parameters: z.object({}), // 无参数
	execute: async () => {
		const balances = await cawService.getBalances();
		return {
			address: balances.address,
			tokens: balances.tokens, // [{ token: "ETH", amount: "0.5" }, { token: "USDC", amount: "10.00" }, ...]
			chain: 'Base Sepolia',
		};
	},
});
```

| 参数 | 类型 | 必填 | 约束   |
| ---- | ---- | ---- | ------ |
| —    | —    | —    | 无参数 |

**工具 4：`makePayment` — 直接向地址转账（支持任意 Cobo 支持的代币）**

```typescript
makePayment: tool({
	description:
		'通过 CAW 向指定地址转账。支持 ETH、USDC、USDT 等任意 Cobo 支持的代币。用于捐赠、付款、充值等直接转账场景（非 x402 协议）。',
	parameters: z.object({
		to: z
			.string()
			.regex(/^0x[a-fA-F0-9]{40}$/)
			.describe('收款 EVM 地址'),
		amount: z.string().describe("转账金额，如 '1.5'"),
		token: z
			.enum(['ETH', 'USDC', 'USDT'])
			.default('USDC')
			.describe('转账代币，默认 USDC'),
		reason: z.string().optional().describe('转账原因'),
	}),
	execute: async ({ to, amount, token }) => {
		const tokenId = `BASE_ETH_${token}`; // Cobo Token ID 格式
		const result = await cawService.transferTokens(to, amount, tokenId);
		return { txHash: result.tx_hash, status: result.status };
	},
});
```

| 参数     | 类型   | 必填 | 约束                                  |
| -------- | ------ | ---- | ------------------------------------- |
| `to`     | string | ✅   | 42 字符，`0x` 开头的有效 EVM 地址     |
| `amount` | string | ✅   | 正数                                  |
| `token`  | enum   | ❌   | `ETH`/`USDC`/`USDT`，默认 `USDC`     |
| `reason` | string | ❌   | 最多 200 字符                         |

**工具 5：`getTransactionStatus` — 查询交易状态**

```typescript
getTransactionStatus: tool({
	description: '查询指定交易的状态（pending/success/failed），返回交易详情。',
	parameters: z.object({
		txHash: z
			.string()
			.regex(/^0x[a-fA-F0-9]{64}$/)
			.describe('交易哈希'),
	}),
	execute: async ({ txHash }) => {
		const record = await cawService.getTransactionByHash(txHash);
		return {
			status: record.status,     // "success" / "pending" / "failed"
			txHash: record.tx_hash,
			from: record.from,
			to: record.to,
			amount: record.amount,
			token: record.token_id,
			chain: record.chain_id,
			blockNumber: record.block_number,
		};
	},
});
```

| 参数    | 类型   | 必填 | 约束                          |
| ------- | ------ | ---- | ----------------------------- |
| `txHash`| string | ✅   | 66 字符，`0x` 开头的交易哈希 |

#### 工作流程

```
用户输入："帮我获取 ETH 链上分析报告"
    ↓
Agent 收到消息 + System Prompt
    ↓
LLM 推理：需要获取 ETH 分析数据 → 调用 discoverServices
    ↓
discoverServices("ETH analysis") → 返回服务列表
    ↓
LLM 推理：选择价格合适的服务 → 调用 callPaidAPI
    ↓
callPaidAPI(url) → CAW payment() 自动处理 402
    ↓
返回数据 + txHash
    ↓
LLM 推理：数据已获取 → 组织回复
    ↓
Agent 输出："已获取 ETH 分析报告。支付了 $0.001 USDC (tx: 0x...)。报告如下：..."
```

#### System Prompt 设计

```typescript
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
```

#### Agent 执行代码

```typescript
// lib/agent.ts
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
		maxSteps: 10, // 最多 10 轮工具调用
		temperature: 0.3, // 低温度，更确定性的决策
	});

	return {
		text: result.text,
		steps: result.steps.map((s) => ({
			tool: s.toolCalls?.[0]?.toolName,
			args: s.toolCalls?.[0]?.args,
			result: s.toolResults?.[0]?.result,
		})),
		usage: result.usage,
	};
}
```

**验收标准：**

- Agent 能理解用户意图并选择合适的工具
- Agent 能在余额不足时提醒用户
- Agent 能解释支付决策（"这个报告需要 $0.001 USDC，我来支付"）
- 支付后返回交易哈希，可在区块浏览器验证

---

### F4 — x402 自动支付流程（1.5h）

核心创新点：Agent 遇到 402 时，通过 CAW `payment()` API 自动完成稳定币支付（当前生态为 USDC）。**无需私钥，无需 `@x402/fetch`。**

**范围：**

- 使用 CAW `payment()` API 处理 x402 支付（原生支持）
- 解析 402 响应中的 `x402_payment_required` 挑战
- 传给 CAW `payment()` → MPC 签名 → 链上稳定币转账
- 用返回的 `retry_headers` 重试原始请求
- 完整的错误处理（余额不足、支付超时、交易失败）

**实现代码：**

```typescript
// lib/x402-payment.ts
import { TransactionsApi, Configuration } from '@cobo/agentic-wallet';

const config = new Configuration({
	apiKey: process.env.AGENT_WALLET_API_KEY!,
	basePath: process.env.AGENT_WALLET_API_URL!,
});
const txApi = new TransactionsApi(config);
const walletId = process.env.AGENT_WALLET_WALLET_ID!;

// Agent 工具：调用付费 API
async function callPaidAPI(url: string) {
	// 1. 发起请求，收到 402
	const initialResponse = await fetch(url);
	if (initialResponse.status !== 402) {
		return initialResponse.json();
	}

	// 2. 解析 x402 挑战
	const challenge = await initialResponse.json();

	// 3. 通过 CAW 支付（无需私钥！MPC 签名）
	const paymentResult = await txApi.payment(walletId, {
		protocol: 'x402',
		x402_payment_required: Buffer.from(JSON.stringify(challenge)).toString(
			'base64',
		), // Base64 编码
		request_id: `x402-${Date.now()}`, // 幂等性
	});

	// 4. 用 retry_headers 重试请求
	const retryHeaders = paymentResult.data.result.retry_headers;
	const finalResponse = await fetch(url, { headers: retryHeaders });

	return finalResponse.json();
}
```

**流程图：**

```
Agent 调用 callPaidAPI(url)
    ↓
fetch 发起请求
    ↓
收到 402 + x402_payment_required?
    ├─ 否 → 正常返回数据
    └─ 是 → CAW payment() API：
              1. 传入 402 挑战对象
              2. CAW MPC 签名稳定币支付（无需私钥）
              3. 返回 retry_headers（支付凭证）
              4. 携带 retry_headers 重试请求
    ↓
Agent 获取数据 + 交易凭证（retry_headers + tx_hash）
CAW 自动记录审计日志
```

**验收标准：**

- 402 → 稳定币支付 → 重试 → 成功，全链路自动化
- 交易哈希可在 Base Sepolia 浏览器查到
- 异常场景有清晰的错误信息

---

### F5 — ERC-8004 Agent 链上注册（2h）

让 Agent 在链上注册身份，可被 8004scan.io 发现。**通过 CAW `contractCall()` API 完成，无需私钥。支持多链注册。**

**范围：**

- 通过 Cobo API 创建 CAW 钱包（0xCAW...）
- 创建 Pact：允许调用 Identity Registry 合约
- 使用 CAW `contractCall()` 调用注册合约（铸造 NFT + 设置 URI + 绑定钱包地址）
- Agent 元数据上传到 IPFS（via Pinata）
- **支持多链注册**：用户选择链，每条链独立注册，注册后不可撤销
- 注册后在 [8004scan.io](https://www.8004scan.io/) 可查，地址 = CAW 地址

**多链注册设计：**

| 链 | Cobo 链 ID | Registry 合约 | 状态 |
|---|---|---|---|
| Base Sepolia | `BASE_ETH` | `0x8004A818BFB912233c491871b3d84c89A494BD9e` | ✅ 可用，⭐ 推荐 |
| ETH Sepolia | `SETH` | `0x8004A818BFB912233c491871b3d84c89A494BD9e` | ✅ 可用 |
| Polygon Amoy | `MATIC_AMOY` | — | 🔜 即将支持 |

**产品交互：**
- 未注册的链显示"注册"按钮，已注册的链显示 tokenId + 8004scan 链接
- 注册前二次确认："确认注册到 {chain}？此操作不可撤销，链上记录永久存在"
- 默认推荐 Base Sepolia（x402 生态最好）
- Dashboard 侧边栏显示每条链的注册状态

**注册流程：**

```
1. Cobo API 创建 CAW 钱包 → 获得 0xCAW
2. CAW faucet.deposit() → 领取测试链 ETH（gas）
3. 创建 Pact：允许调用 Identity Registry 合约（支持多链）
   → type: "contract_call"
   → contract_addr_in: ["0x8004A818BFB912233c491871b3d84c89A494BD9e"]
4. 用户选择链（默认 Base Sepolia）
5. 上传 Agent 元数据到 IPFS（via Pinata）
6. CAW contractCall(chain_id: "BASE_ETH") → 铸造 NFT + setAgentURI + setWallet(0xCAW)
7. 8004scan.io 显示 Agent，地址 = 0xCAW
```

**CAW Pact 配置（ERC-8004 注册）：**

```typescript
const pact = await pactsApi.submitPact({
	wallet_id: cawWalletId,
	intent: 'Register agent on ERC-8004 Identity Registry',
	spec: {
		policies: [
			{
				name: 'erc8004-registration',
				type: 'contract_call',
				rules: {
					effect: 'allow',
					when: {
						chain_in: ['BASE_ETH'],
						contract_addr_in: ['0x8004A818BFB912233c491871b3d84c89A494BD9e'],
					},
				},
			},
		],
		completion_conditions: [{ type: 'time_elapsed', threshold: '3600' }],
	},
});
```

**contractCall 调用示例（使用 viem 编码 calldata）：**

```typescript
import { encodeFunctionData } from "viem";

// ERC-8004 Identity Registry ABI（只需用到的函数）
const IDENTITY_REGISTRY_ABI = [
  {
    name: "mint",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenURI", type: "string" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    name: "setWallet",
    type: "function",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "wallet", type: "address" },
    ],
  },
] as const;

// 编码 mint calldata
const mintCalldata = encodeFunctionData({
  abi: IDENTITY_REGISTRY_ABI,
  functionName: "mint",
  args: [cawAddress, ipfsURI],
});

// CAW contractCall
const result = await txApi.contractCall(walletId, {
  chain_id: "BASE_ETH",
  contract_addr: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
  calldata: mintCalldata,
  value: "0",
  request_id: "erc8004-register",
});
```

**验收标准：**

- CAW `contractCall()` 成功执行，返回交易哈希
- Agent NFT 在 Base Sepolia 上可查
- 8004scan.io 能搜到注册的 Agent
- 8004scan 展示的钱包地址 = CAW 地址

---

### F6 — A2A Agent-to-Agent 协议（1.5h）

让 Agent 能被其他 Agent 发现和调用。**使用 Next.js API route 实现，无需独立 Express 进程。**

**A2A 是什么：** Google 提出的 Agent-to-Agent 协议，让不同 Agent 互相发现和通信。包含两个端点：

- `/.well-known/agent-card.json` — Agent 的"名片"，声明能力和服务
- `/a2a` — JSON-RPC 2.0 端点，其他 Agent 通过这里发消息调用服务

**为什么需要：** 项目要求 Agent 既能买服务也能卖服务。A2A 让别的 Agent 能发现和调用本 Agent 的付费服务，体现"双向能力"。

**范围：**

- `app/.well-known/agent-card.json/route.ts` — 静态 Agent Card（Next.js route handler）
- `app/a2a/route.ts` — JSON-RPC 2.0 处理（接收请求 → 调用 Agent → 返回结果）
- 支持 `message/send` 方法
- Agent Card 包含：名称、描述、能力、端点、x402 支付信息

**Agent Card 示例：**

```json
{
	"name": "CoboAgent",
	"description": "AI agent with x402 payment and CAW wallet",
	"url": "http://localhost:3000",
	"capabilities": { "streaming": true },
	"skills": [
		{
			"id": "eth-analysis",
			"name": "ETH Chain Analysis",
			"description": "Paid ETH on-chain analysis report via x402"
		}
	]
}
```

**验收标准：**

- `curl http://localhost:3000/.well-known/agent-card.json` 返回正确的 Agent Card
- 外部 Agent 可通过 POST `/a2a` 发送消息并收到响应
- 与 F8 的 A2A 双向演示配合

---

### F7 — 演示仪表盘（2.5h）

直观展示 Agent 的全链路状态。

**范围：**

- **钱包卡片：** Agent 钱包地址、ETH 余额、USDC 余额
- **注册状态：** 多链 ERC-8004 注册状态 + 一键注册（支持 Base Sepolia / ETH Sepolia）
- **对话界面：** 用户与 Agent 的交互入口（流式输出）
- **底部面板（可收缩）：** 交易记录 + 操作日志，Tab 切换，10 条/页分页
- 使用 shadcn/ui 组件搭建（Tabs, ScrollArea, Pagination, Sheet/Collapsible）

**Agent 日志分类：**

| 分类 | 图标 | 说明 | 示例 |
|---|---|---|---|
| 发现 | 🔍 | 服务发现操作 | "搜索 'ETH analysis'，找到 3 个结果" |
| 支付 | 💰 | x402 支付操作 | "支付 $0.001 USDC 获取 ETH 分析报告" |
| 转账 | 📤 | 直接转账操作 | "向 0xABC... 转账 1.0 USDC" |
| 查询 | 📋 | 余额/状态查询 | "查询余额：ETH 0.5, USDC $10.00" |
| 注册 | 🆔 | ERC-8004 注册 | "注册到 Base Sepolia，tokenId: #1234" |
| A2A | 🤝 | Agent 间通信 | "收到来自 Agent B 的请求" |
| 错误 | ⚠️ | 异常操作 | "支付失败：余额不足" |

**页面布局：**

```
┌──────────────────────────────────────────────────────────┐
│  Navbar: Cobo Agentic Wallet — Agent Native Payments 🌓  │
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│  💰 钱包     │   [创建新钱包] [连接已有钱包]              │
│  0xCAW...    │                                           │
│  ETH: 0.5   │   余额：ETH 0.5 / USDC $10.00             │
│  USDC: $10  │   权限：单笔 ≤ $1 USDC，24h 有效          │
│              │                                           │
│  ─────────── │   🤖 Agent 对话                           │
│  🆔 注册     │   ┌───────────────────────────────────┐   │
│  Base ✅ #123│   │ 用户: 获取ETH链上分析报告          │   │
│  ETH  ❌     │   │ Agent: CAW 支付$0.001 USDC...      │   │
│  [注册到ETH] │   │ Agent: 报告如下...                  │   │
│              │   └───────────────────────────────────┘   │
├──────────────┤                                           │
│              │   ┌─ 交易记录 / 操作日志 ─────── ▼ ────┐ │
│  🏪 我的服务 │   │ [交易记录] [操作日志]              │ │
│  /api/eth... │   │                                     │ │
│  /api/mkt... │   │ #1  $0.001→0xABC  ✅  14:02       │ │
│              │   │ #2  $0.002→0xDEF  ✅  14:01       │ │
│              │   │ #3  ...                            │ │
│              │   │                                     │ │
│              │   │      [< 1 2 3 >]                   │ │
│              │   └─────────────────────────────────────┘ │
└──────────────┴───────────────────────────────────────────┘
```

**底部面板交互：**
- 可上下拖拽收缩（类似 IDE 终端面板，shadcn Sheet/Collapsible）
- Tab 切换：`交易记录` | `操作日志`
- 每页 10 条，超过分页（shadcn Pagination）
- 交易记录列：金额、对方地址、状态、TxHash、时间
- 操作日志列：分类图标、描述、时间、状态
- 支付完成后自动刷新

**验收标准：**

- 支付完成后交易记录实时更新
- Agent 链上注册状态正确显示（多链独立显示）
- 底部面板可收缩/展开，Tab 切换流畅
- 日志和交易记录分页正常（10 条/页）
- UI 美观、信息清晰

---

### F8 — 端到端演示 + 打磨（2h）

确保演示流畅、可靠。

**范围：**

- 全链路联调：用户输入 → Agent 推理 → x402 402 → CAW 支付 → 数据返回 → UI 更新
- 编写演示脚本（3 个递进场景）：
  1. **基础支付：** Agent 调用 x402 付费 API，自动支付 USDC
  2. **双向能力：** 另一个 Agent 通过 A2A 调用本 Agent 的付费服务
  3. **链上可验证：** 展示 8004scan.io 上的 Agent 注册 + 区块浏览器上的交易记录
- 处理边界情况（网络延迟、交易 pending 状态）
- 清理代码、美化 UI、确保 demo 可连续运行 3 次无故障

**验收标准：**

- 演示脚本可连续执行 3 次无报错
- 所有交易哈希可在测试网浏览器查到
- Agent 在 8004scan.io 可查
- 准备好 5 分钟演示 pitch

---

## 依赖兼容性验证

已通过 npm 实际检查所有包的依赖树，确认零冲突：

```
ai (v6.0.202)          → 无链上依赖
@ai-sdk/openai (v3.x)  → 无链上依赖
@cobo/agentic-wallet    → HTTP API 客户端（axios）
                        → 内置 x402 支付（payment() API）
                        → 内置合约调用（contractCall() API）
@x402/next (v2.14.0)   → Next.js 原生中间件（仅卖方收款端）
@x402/core + @x402/evm → 支付协议核心 + EVM 验证（卖方收款端用）
viem (v2.52.2)         → ERC-8004 calldata 编码 + @x402/evm 依赖
zod (v4.x)             → Schema 校验
next-themes             → 主题切换（无链上依赖）
dotenv                  → 环境变量（无依赖）
```

**结论：** ai-sdk 和 Cobo SDK 完全不涉及链上交互，与 viem/x402 的依赖树完全独立。

---

## 任务分解与排期

### 任务清单

| ID   | 任务                                                                                     | 所属功能              | 预估耗时 | 依赖                   |
| ---- | ---------------------------------------------------------------------------------------- | --------------------- | -------- | ---------------------- |
| T-01 | 安装全部依赖（cobo, ai-sdk, x402/next, x402/core, viem, shadcn/ui, dotenv, next-themes） | 基础设施              | 0.5h     | —                      |
| T-02 | 配置环境变量（.env: CAW API URL/Key/Wallet ID, OpenAI Key, Pinata JWT）                  | 基础设施              | 0.5h     | T-01                   |
| T-03 | 搭建 shadcn/ui + 基础布局（导航栏、侧边栏、主题切换）                                    | 基础设施              | 1h       | T-01                   |
| T-04 | 创建 CAW 钱包 + 领测试币 + 创建 Pact（允许调用 ERC-8004 合约）                           | F1 CAW 集成 + F5 注册 | 1.5h     | T-02                   |
| T-05 | 封装 CAW 服务层（getBalance, payment, contractCall, transferTokens）                     | F1 CAW 集成           | 1.5h     | T-04                   |
| T-06 | 构建钱包 API 路由（/api/wallet/\*）                                                      | F1 CAW 集成           | 0.5h     | T-05                   |
| T-07 | 使用 @x402/next 的 withX402 构建付费 API route（卖方收款）                               | F2 x402 服务端        | 1.5h     | T-01                   |
| T-08 | 搭建 ai-sdk ToolLoopAgent 框架（generateText + tools + maxSteps）                        | F3 Agent 核心         | 1.5h     | T-01                   |
| T-09 | 定义 Agent 工具集（discoverServices, callPaidAPI, makePayment, checkBalance, getTxStatus） | F3 Agent 核心         | 1.5h     | T-05, T-08             |
| T-10 | 实现 x402 支付流程（CAW payment() → retry_headers → 重试）                               | F4 x402 支付          | 1h       | T-05, T-07             |
| T-11 | ERC-8004 注册（CAW contractCall() → Identity Registry 合约）                             | F5 ERC-8004           | 1h       | T-04                   |
| T-12 | 实现 A2A 端点（Next.js route: agent-card.json + /a2a JSON-RPC）                          | F6 A2A 协议           | 1.5h     | T-11                   |
| T-13 | 搭建仪表盘布局（钱包卡片 + 交易表 + Agent 身份 + 对话界面）                              | F7 仪表盘             | 2h       | T-03, T-06             |
| T-14 | 实现实时交易日志 + Agent 状态展示                                                        | F7 仪表盘             | 0.5h     | T-13                   |
| T-15 | 全链路联调（Agent → x402 402 → CAW payment() → UI 更新）                                 | F8 E2E 演示           | 1.5h     | T-06, T-09, T-10, T-14 |
| T-16 | 演示脚本 + UI 打磨 + A2A 双向演示 + 8004scan 展示                                        | F8 E2E 演示           | 0.5h     | T-15                   |

**总工时：** 16h（含 8h 缓冲，24h 总时间）

---

### 关键路径

```
T-01 (安装依赖)
  → T-02 (配置环境)
    → T-04 (创建 CAW 钱包 + Pact)
      → T-05 (CAW 服务层)
        → T-10 (x402 支付)
          → T-15 (全链路联调)
            → T-16 (演示打磨)
```

**关键路径总耗时：** 约 7.5h

---

### 并行工作流

| 阶段   | 时间   | 可并行的任务           | 说明                                    |
| ------ | ------ | ---------------------- | --------------------------------------- |
| 阶段 1 | 0-1.5h | T-01, T-02, T-03       | 安装依赖 + 环境配置 + UI 基础           |
| 阶段 2 | 1.5-3h | T-04, T-07, T-08       | CAW 钱包创建 + x402 服务端 + Agent 框架 |
| 阶段 3 | 3-5h   | T-05, T-09, T-11       | CAW 服务层 + Agent 工具 + ERC-8004 注册 |
| 阶段 4 | 5-7h   | T-06, T-10, T-12, T-13 | API 路由 + x402 支付 + A2A + 仪表盘     |
| 阶段 5 | 7-8h   | T-14                   | 实时交易日志                            |
| 阶段 6 | 8-10h  | T-15, T-16             | 联调 + 打磨                             |

---

### 里程碑

| 里程碑             | 目标时间 | 交付物                                                        |
| ------------------ | -------- | ------------------------------------------------------------- |
| **基础就绪**       | 第 2h    | CAW 钱包创建完成，UI 骨架，x402 付费服务端可返回 402          |
| **Agent 上链**     | 第 4h    | Agent 通过 CAW contractCall() 注册 ERC-8004，8004scan.io 可查 |
| **Agent 自主支付** | 第 7h    | Agent 调用 x402 付费 API → CAW payment() 自动支付 → 获取数据  |
| **双向能力**       | 第 8h    | A2A 端点可用，其他 Agent 可调用本 Agent 的付费服务            |
| **演示就绪**       | 第 10h   | 仪表盘完整、demo 脚本就绪、可连续运行 3 次无故障              |

---

## create-8004-agent 参考价值

`create-8004-agent` 不再需要直接使用。ERC-8004 注册通过 **CAW `contractCall()` + viem `encodeFunctionData()`** 实现，无需 agent0-sdk。

**参考什么：**

1. Identity Registry 合约地址：`0x8004A818BFB912233c491871b3d84c89A494BD9e`
2. 注册流程：mint NFT → 上传 IPFS → setAgentURI → setWallet
3. Agent 元数据格式（registration.json）— 用于 IPFS 上传
4. `.well-known/agent-card.json` 格式 — 用于 A2A 发现

**实现方式：**

- viem `encodeFunctionData()` 编码合约调用参数
- CAW `contractCall()` 提交链上交易（无需私钥）
- Pinata SDK 上传元数据到 IPFS

**不需要什么：**

1. ~~agent0-sdk~~ → viem + CAW contractCall 替代
2. ~~scaffold 的私钥生成~~ → CAW 无私钥
3. ~~scaffold 的注册脚本~~ → CAW `contractCall()` 替代
4. ~~scaffold 的 Express 服务器~~ → Next.js API routes 替代
5. ~~scaffold 的 LLM 调用~~ → ai-sdk 替代

---

## 风险与应对

| 风险                                    | 概率 | 影响 | 应对策略                                         |
| --------------------------------------- | ---- | ---- | ------------------------------------------------ |
| CAW API 文档缺失或接口变更              | 中   | 高   | 提前 1h 跑通 SDK hello world；备选：直接用 viem  |
| CAW payment() 不支持测试网 x402         | 中   | 高   | 备选：用 CAW transferTokens() + 手动编码 x402 头 |
| CAW contractCall() 不能调 ERC-8004 合约 | 低   | 高   | 备选：用 agent0-sdk + 临时钱包注册               |
| Base Sepolia 测试币不足                 | 中   | 中   | CAW faucet.deposit() + Coinbase faucet           |
| AI Agent 工具调用不稳定                 | 低   | 中   | 使用 zod schema 约束输出；增加重试逻辑           |
| 时间不够                                | 中   | 高   | 严格按优先级砍功能                               |

---

## 降级策略

按优先级从高到低，时间不够时依次砍掉：

| 级别             | 砍掉                      | 保留           | 说明             |
| ---------------- | ------------------------- | -------------- | ---------------- |
| **L1（保核心）** | F7 仪表盘简化为 HTML 表格 | F1-F6, F8      | 核心流程完整     |
| **L2（保流程）** | F6 A2A 协议               | F1-F5, F8      | 去掉对外服务能力 |
| **L3（保支付）** | F5 ERC-8004 注册          | F1-F4, F8      | 去掉链上注册     |
| **L4（保演示）** | F2 x402 服务端改为 mock   | F1, F3, F4, F8 | 用 mock 402 响应 |

**最低可行 Demo：** Agent 通过 CAW 支付稳定币调用一个返回 402 的 API → 获取数据 + 简单交易记录展示。

---

## 演示 Pitch 要点（5 分钟）

1. **开场（30s）：** "AI Agent 应该像人一样能付钱、能赚钱"
2. **链上身份（60s）：** 展示 8004scan.io 上的 Agent 注册
3. **自主支付（90s）：** Agent 发现服务 → 402 → CAW 支付稳定币 → 获取数据
4. **对外服务（60s）：** 另一个 Agent 通过 A2A 调用本 Agent 的付费服务
5. **仪表盘（30s）：** 钱包余额、交易记录、Agent 状态一览
6. **总结（30s）：** "x402 + ERC-8004 + CAW = Agent 一等支付公民"

---

## 下一步

1. 执行 `hackathon-code-implementer` 开始编码
2. 第一步：安装依赖 + 配置 .env + 创建 CAW 钱包
3. 第二步：并行推进 T-03 (UI) + T-07 (x402 服务端) + T-08 (Agent 框架)
4. 第三步：ERC-8004 注册 + x402 支付联调 + 仪表盘
