# Plan V2 — CAW 钱包全功能整合方案

## 问题分析

当前 `.env.local` 配置了 CAW 凭据，但前端侧边栏仍显示"未连接"。原因：

- `.env.local` 中的 `AGENT_WALLET_*` 仅被服务端 API 路由读取
- 前端 `isWalletConnected` 状态初始为 `false`，从未通过 UI 流程设置为 `true`
- 前端和后端的钱包状态没有同步

**结论：钱包创建/连接应该通过 UI 流程完成，而不是在 .env 中写死。**

---

## 架构变更

### 之前（写死配置）

```
.env.local → AGENT_WALLET_* → 服务端 API 直接使用
前端：isWalletConnected = false（永远）
```

### 之后（SDK 驱动）

```
.env.local 配置 API Key + 钱包 UUID + 钱包地址
          ↓
前端 UI → 用户操作 → API 路由 → CAW SDK（用固定 API Key）→ 返回结果 → 更新前端状态
          ↓
    列出钱包 / 创建新钱包 / 切换钱包
          ↓
    选定钱包 UUID → 所有后续操作用该 UUID
```

---

## API Key 与钱包配置

### 核心原则

**API Key 是 Provision 返回的 `api_key`，固定在 .env 中。** 用于请求所有 TS SDK 接口。

**CAW 钱包创建流程：Provision → Create Wallet（两步缺一不可）**

```
步骤 1：Provision Agent（获取身份）
  POST /api/v1/principals/provision
  → 返回 api_key + agent_id（仅此一次）
  → api_key 用于所有后续 API 认证

步骤 2：Create Wallet（创建钱包）
  POST /api/v1/wallets
  → 用 api_key 认证
  → 传入 main_node_id（手动配置的 TSS Node ID）
  → 创建 MPC 钱包，初始状态为 preparing

步骤 3：等待钱包激活
  → MPC 密钥生成完成后变为 active

步骤 4：Create Wallet Address（派生链上地址）
  → 用 api_key 认证
  → 指定链（SETH = ETH Sepolia）
  → 返回钱包地址

步骤 5：（可选）Pair 配对
  → 钱包 owner 在 App 中扫码配对
  → agent 从 owner 变为 delegate
```

```env
# .env.local
AGENT_WALLET_API_KEY=caw_xxx  # Provision 返回的 api_key
AGENT_WALLET_API_URL=https://agentic-wallet.cobo.com
```

### 初始化流程

```typescript
// lib/caw.ts — 用 .env 中的 API Key 初始化 SDK
const config = new Configuration({
	apiKey: process.env.AGENT_WALLET_API_KEY,
	basePath: process.env.AGENT_WALLET_API_URL,
});
const walletsApi = new WalletsApi(config);
const transactionsApi = new TransactionsApi(config);
// 项目启动后即可使用，无需动态获取 API Key
```

### 钱包状态：未配对 vs 已配对

**新创建的钱包默认未配对（Agent 自有）。** 配对是可选功能。

| 状态 | Owner | Agent 角色 | 操作权限 | Pact 需求 |
|---|---|---|---|---|
| **未配对** | Agent 自己 | Owner | 自由操作 | 不需要 |
| **已配对** | 人类 | Delegate | 受 Pact 限制 | 需要 |

**配对流程（可选）：**
```
1. Agent 调用 initiateWalletPair(walletId)
   → 返回 8 位配对码（30 分钟有效，SDK 文档确认）

2. 用户在 Cobo App 输入配对码
   → 确认配对

3. 用户在我们的 UI 点击"确认配对"按钮
   → 后端调用 getPairInfoByWallet(walletId) 检查配对状态
   → 如果 status === "paired" → 配对成功，更新 UI
   → 如果 status !== "paired" → 提示用户尚未在 Cobo App 确认
```

**配对不影响 API Key。** 同一个 API Key 可以操作所有钱包（无论是否配对）。配对只影响操作权限。

**前端交互：**
```
┌─────────────────────────────────────┐
│ 配对钱包                             │
├─────────────────────────────────────┤
│ 配对码：1234 5678                    │
│                                     │
│ 请在 Cobo App 中输入此配对码         │
│ 配对码 30 分钟内有效                 │
│                                     │
│ [确认配对] [取消]                     │
└─────────────────────────────────────┘
```

用户点击"确认配对"后：
```
→ 后端 GET /api/wallet/pair/status?walletId=xxx
→ getPairInfoByWallet(walletId) 检查状态
→ paired? → 成功，更新 UI，显示 Owner 信息
→ not paired? → 提示"请先在 Cobo App 中确认配对"
```

### 钱包切换实现

**同一个 API Key 可以操作多个钱包。** 钱包切换通过 UUID 实现，Agent 工具动态使用当前钱包：

```typescript
// 列出所有可用钱包
const wallets = (await walletsApi.listWallets(undefined, undefined, 0, 50)).data.result;

// 切换到目标钱包（用 UUID）
const targetWalletUuid = wallets[1].uuid;  // 用户选择的钱包
setCurrentWalletUuid(targetWalletUuid);    // 更新全局状态

// Agent 工具动态使用当前钱包 UUID
async function checkBalance() {
  const balances = await balanceApi.listBalances(currentWalletUuid);
  return balances.data.result;
}

async function makePayment(to: string, amount: string) {
  const tx = await transactionsApi.transferTokens(currentWalletUuid, {
    token_id: 'SETH',
    dst_addr: to,
    amount: amount,
  });
  return tx.data.result;
}
```

**x402 收款地址也随钱包切换：**
```typescript
// 切换钱包时，同步更新 x402 收款地址
const addresses = await walletsApi.listWalletAddresses(targetWalletUuid);
const newPayeeAddress = addresses.data.result[0]?.address;
setX402PayeeAddress(newPayeeAddress);  // 更新全局状态
```

### 创建新钱包

```typescript
// 用同一个 API Key 创建新钱包（MPC 类型）
const newWallet = await walletsApi.createWallet({
	wallet_type: 'MPC',
	name: 'NewAgentWallet',
	main_node_id: process.env.AGENT_MAIN_NODE_ID,  // .env 配置
});
const walletUuid = newWallet.data.result.uuid;

// 派生地址
const address = await walletsApi.createWalletAddress(walletUuid, {
	chain_id: 'SETH',
});
const walletAddress = address.data.result.address;

// 领取测试币
await faucetApi.deposit({
	address: walletAddress,
	token_id: 'SETH',
});
```

### 链配置：ETH Sepolia

- CAW 链 ID：`SETH`
- CAW Token ID：`SETH`（ETH）、`SETH_USDC`（USDC）
- x402 facilitator：`https://x402.4mica.xyz`
- ERC-8004 Registry：`0x8004A818BFB912233c491871b3d84c89A494BD9e`

### x402 收款地址

**x402 收款地址 = 当前 CAW 钱包地址。** 项目初始从 .env 读取默认地址，用户切换钱包后自动更新。

```typescript
// 初始值从 .env 读取
let x402PayeeAddress = process.env.AGENT_WALLET_ADDRESS || '';

// 用户切换钱包时，同步更新
async function switchWallet(newWalletUuid: string) {
  const addresses = await walletsApi.listWalletAddresses(newWalletUuid);
  x402PayeeAddress = addresses.data.result[0]?.address || '';
  setCurrentWalletUuid(newWalletUuid);
}

// x402 服务端使用当前地址
export function getPayeeAddress() {
  return x402PayeeAddress;
}
```

---

## TX Log 和 Audit Log 改为真实数据

### 当前状态

- TX Log：mock 数据（`INITIAL_TRANSACTIONS`）
- Agent Logs：mock 数据（`INITIAL_LOGS`）

### 目标状态

- TX Log：通过 CAW SDK `TransactionRecordsApi.listUserTransactions()` 查询真实交易
- Audit Log：通过 CAW SDK `AuditApi.listAuditLogs()` 查询真实审计记录
- 合并展示在同一个面板中

### caw.ts 已有实现

```typescript
// 已实现
export async function getTransactionRecords(limit = 20) {
	const response = await transactionRecordsApi.listUserTransactions(
		WALLET_ID,
		undefined,
		undefined,
		undefined,
		limit,
	);
	return response.data;
}

export async function getAuditLogs(limit = 20) {
	const response = await auditApi.listAuditLogs(
		WALLET_ID,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		limit,
	);
	return response.data;
}
```

### API 路由

```typescript
// app/api/wallet/transactions/route.ts
export async function GET(req: NextRequest) {
	const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
	const result = await getTransactionRecords(limit);
	return NextResponse.json({ success: true, transactions: result });
}

// app/api/wallet/audit/route.ts
export async function GET(req: NextRequest) {
	const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
	const result = await getAuditLogs(limit);
	return NextResponse.json({ success: true, logs: result });
}
```

### 前端数据获取

```typescript
// 页面加载时获取真实数据
useEffect(() => {
	if (!isWalletConnected) return;

	// 获取交易记录
	fetch('/api/wallet/transactions?limit=20')
		.then((r) => r.json())
		.then((data) => setTransactions(data.transactions));

	// 获取审计日志
	fetch('/api/wallet/audit?limit=20')
		.then((r) => r.json())
		.then((data) => setAuditLogs(data.logs));
}, [isWalletConnected]);
```

---

## Agent Logs 合并展示

### 当前：两个独立数据源

| 数据源                | 内容           | 来源       |
| --------------------- | -------------- | ---------- |
| ActivityLog（应用层） | Agent 操作记录 | 前端 state |
| AuditLog（CAW 层）    | 链上操作记录   | CAW SDK    |

### 目标：合并为统一日志

**合并策略：**

1. CAW 审计日志作为主数据源（真实链上记录）
2. 应用层日志作为补充（Agent 推理过程）
3. 按时间排序，统一展示

**UI 设计：**

```
┌─ Agent Logs ──────────────────────────────── ▼ ─┐
│ [全部] [支付] [转账] [查询] [注册] [错误]        │
│                                                  │
│ #  Time                Type    Description       │
│ 1  2026-06-12 22:16:42 💰 Pay  Paid 0.0001 ETH  │
│    CAW Audit: allowed | tx: 0xabcdef123456...    │
│                                                  │
│ 2  2026-06-12 22:16:40 🔍 Disc Searched "ETH"   │
│    App Log: found 3 services                     │
│                                                  │
│ 3  2026-06-12 22:16:38 📋 Query Balance: 0.01   │
│    CAW Audit: allowed                            │
└──────────────────────────────────────────────────┘
```

**每条日志包含：**

- 应用层描述（Agent 做了什么）
- CAW 审计结果（allowed/denied/pending）
- 关联的交易哈希（如果有）

---

## 新增 Tool：getTransactionDetails

```typescript
// lib/tools.ts 新增
const getTransactionDetails = tool({
	description: '查询指定交易的详细信息，包含状态、金额、gas、区块号等。',
	inputSchema: zodSchema(
		z.object({
			txHash: z
				.string()
				.regex(/^0x[a-fA-F0-9]{64}$/, '必须是有效的交易哈希')
				.describe('交易哈希'),
		}),
	),
	execute: async (args) => {
		const { txHash } = args;
		const details = await getTransactionByRequestId(txHash);
		return details;
	},
});
```

---

## 侧边栏钱包卡片改造

### 默认状态（有预配置钱包）

```
┌─────────────────────────┐
│ 💰 Agent Wallet    [▼]  │
├─────────────────────────┤
│ 0x8c25dd...347c1  [📋]  │
│ Wallet: AgentWallet      │
│                         │
│ ETH        0.0100       │
│ USDC      $0.00         │
│                         │
│ [切换钱包] [创建钱包]    │
└─────────────────────────┘
```

### 切换钱包弹窗

```
┌─────────────────────────┐
│ 选择钱包                 │
├─────────────────────────┤
│ ✅ AgentWallet (当前)    │
│    0x8c25dd...347c1     │
│                         │
│    MyOtherWallet         │
│    0x1a2b3c...9f0e      │
│                         │
│ [创建新钱包]             │
└─────────────────────────┘
```

---

## 环境变量设计

### .env.local 配置

```env
# === CAW API 配置（必须）===
AGENT_WALLET_API_URL=https://agentic-wallet.cobo.com
AGENT_WALLET_API_KEY=caw_xxx  # Provision 返回的 api_key
AGENT_WALLET_WALLET_ID=b0681854-xxx  # 钱包 UUID
AGENT_WALLET_ADDRESS=0x8c25ddf08fd51cfc9a3985b765a9be2095a347c1  # 钱包地址

# === AI 模型（OpenAI 兼容）===
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_API_KEY=sk-xxx
AI_MODEL_NAME=qwen3.6-27b

# === Pinata（IPFS 上传）===
PINATA_JWT=

# === x402 服务端 ===
X402_PAYEE_ADDRESS=0x8c25ddf08fd51cfc9a3985b765a9be2095a347c1  # = CAW 钱包地址
```

**说明：**

- `AGENT_WALLET_API_KEY` 是 Provision 返回的 `api_key`，所有 SDK 操作共用
- `AGENT_WALLET_WALLET_ID` 是默认钱包 UUID，可通过钱包列表切换
- `AGENT_WALLET_ADDRESS` 是钱包地址，用于 x402 收款和前端展示
- `AGENT_MAIN_NODE_ID` 是 MPC 钱包创建所需的 TSS 节点 ID
- 这些值通过 Provision API + caw CLI 获取，写入 .env 后项目启动即可用

---

## 新增 API 路由清单

| 路由                               | 方法 | 说明                     |
| ---------------------------------- | ---- | ------------------------ |
| `/api/wallet/list`                 | GET  | 列出所有可用钱包         |
| `/api/wallet/create`               | POST | 创建新钱包               |
| `/api/wallet/status`               | GET  | 查询当前钱包状态         |
| `/api/wallet/balance`              | GET  | 查询余额                 |
| `/api/wallet/transfer`             | POST | 转账                     |
| `/api/wallet/pact`                 | POST | 创建 Pact                |
| `/api/wallet/pact`                 | GET  | 查询 Pact                |
| `/api/wallet/audit`                | GET  | 查询审计日志（真实数据） |
| `/api/wallet/transactions`         | GET  | 查询交易记录（真实数据） |
| `/api/wallet/transaction/[txHash]` | GET  | 查询交易详情             |
| `/api/wallet/faucet`               | POST | 领取测试币               |

---

## 新增 Tool 清单

| Tool                        | 功能               | 底层 API               |
| --------------------------- | ------------------ | ---------------------- |
| `discoverServices`          | 搜索付费服务       | 本地服务列表           |
| `callPaidAPI`               | 调用 x402 付费 API | fetch + CAW payment()  |
| `checkBalance`              | 查询余额           | CAW listBalances       |
| `makePayment`               | 直接转账           | CAW transferTokens     |
| `getTransactionStatus`      | 查询交易记录       | CAW listTransactions   |
| **`getTransactionDetails`** | **查询交易详情**   | **CAW getTransaction** |

---

## 实现优先级

| 优先级 | 功能                                     | 预估时间 |
| ------ | ---------------------------------------- | -------- |
| P0     | 钱包创建 API + UI 流程                   | 2h       |
| P0     | 钱包状态恢复（页面加载时检查）           | 0.5h     |
| P0     | 默认 Pact 自动创建                       | 1h       |
| P0     | TX Log 改为真实数据                      | 1h       |
| P0     | Audit Log 改为真实数据                   | 1h       |
| P1     | 新增 getTransactionDetails Tool          | 0.5h     |
| P1     | Agent Logs 合并展示（应用层 + CAW 审计） | 1.5h     |
| P2     | 钱包配对流程（initiateWalletPair + confirmWalletPair） | 1.5h |
| P2     | 多 Agent 切换（动态 API Key） | 2h |
| P3     | 多用户隔离（每人独立 Agent） | 3h |

**总新增预估：14h（P0-P2: 9h, P3: 3h + 缓冲）**

---

## 多 Agent / 多钱包架构

### CAW 支持情况

| 能力 | 支持？ | 说明 |
|---|---|---|
| 一个用户多个 Agent | ✅ | 多次 `provisionAgent()` |
| 一个 Agent 多个钱包 | ✅ | 多次 `createWallet()` |
| 隔离 | ✅ | 每个 Agent 有独立 `api_key` |

### 存储结构

```typescript
// 服务端内存存储（Hackathon 用，生产用数据库）
interface UserSession {
  userId: string;
  agents: AgentRecord[];
  activeAgentId: string;
}

interface AgentRecord {
  agentId: string;        // Provision 返回
  apiKey: string;         // Provision 返回（敏感！仅服务端存储）
  wallets: WalletRecord[];
  activeWalletId: string;
}

interface WalletRecord {
  walletUuid: string;     // createWallet 返回
  address: string;        // createWalletAddress 返回
  name: string;
}

// 服务端：Map<userId, UserSession>
// 客户端：localStorage 存 userId, activeAgentId, activeWalletId
```

### API 隔离（每个 Agent 独立 API Key）

```typescript
// 按 Agent 动态创建 CAW 客户端
function getCawClient(apiKey: string) {
  const config = new Configuration({
    apiKey: apiKey,
    basePath: process.env.AGENT_WALLET_API_URL,
  });
  return {
    walletsApi: new WalletsApi(config),
    transactionsApi: new TransactionsApi(config),
    balanceApi: new BalanceApi(config),
  };
}

// API 路由中使用
export async function GET(req: NextRequest) {
  const userId = getUserIdFromSession(req);
  const session = userSessions.get(userId);
  const agent = session.agents.find(a => a.agentId === session.activeAgentId);
  const client = getCawClient(agent.apiKey);
  // 使用 client 操作该 Agent 的钱包
}
```

### 前端 UI（多 Agent + 多钱包切换）

```
┌─────────────────────────────────────┐
│ 💰 Agent 钱包                  [+新建] │
├─────────────────────────────────────┤
│ Agent: CoboAgent (caw_agent_xxx)    │
│ ┌─────────────────────────────────┐ │
│ │ ▼ 切换 Agent                    │ │
│ │   CoboAgent (当前)              │ │
│ │   MyOtherAgent                  │ │
│ │   + 创建新 Agent                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 钱包: AgentWallet (0x8c25...)       │
│ ┌─────────────────────────────────┐ │
│ │ ▼ 切换钱包                      │ │
│ │   AgentWallet (当前)            │ │
│ │   MyOtherWallet                 │ │
│ │   + 创建新钱包                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ETH: 0.0100  USDC: $0.00           │
│                                     │
│ [配对钱包] [充值]                    │
└─────────────────────────────────────┘
```

### 实现优先级

| 优先级 | 功能 | 说明 | 预估 |
|---|---|---|---|
| **P0** | 单 Agent + 单钱包 | .env 预配置，Hackathon 演示 | 已完成 |
| **P1** | 单 Agent + 多钱包 | 钱包切换，同一 API Key | 2h |
| **P2** | 多 Agent + 多钱包 | Agent 切换，需要动态 API Key | 2h |
| **P3** | 多用户隔离 | 每人独立 Agent，需要数据库 | 3h |

**建议：Hackathon 先做 P0 + P1，P2/P3 作为扩展功能展示。**

---

## 关键决策

1. **钱包创建流程：Provision → Create Wallet → Create Wallet Address**（三步缺一不可）
2. **API Key 是 Provision 返回的 `api_key`**，固定在 .env，项目启动即可用
3. **`main_node_id` 手动配置**（`AGENT_MAIN_NODE_ID`），不是 Provision 返回的
4. **`AGENT_ID` 和 `NEXT_PUBLIC_AGENT_ID` 合并**，只保留 `NEXT_PUBLIC_AGENT_ID`（前端+后端都可用）
5. **钱包切换**通过 UUID 实现，同一个 API Key 可操作多个钱包
6. **x402 收款地址 = CAW 钱包地址**，随钱包切换自动更新
7. **链选择：ETH Sepolia**（Cobo 链 ID: SETH）
8. **TX Log 和 Audit Log 改为真实数据**，通过 CAW SDK 查询
9. **Agent Logs 合并展示**，应用层日志 + CAW 审计日志统一展示

## 付款与收款实现

### 付款（Agent 调用付费服务）

```
Agent 调用 /api/data/eth-analysis
    ↓
服务端返回 402 + x402 挑战
    ↓
Agent 调用 CAW payment() API
  → protocol: "x402"
  → x402_payment_required: Base64(挑战对象)
    ↓
CAW 后端签名 + 链上 USDC 转账
    ↓
返回 retry_headers（支付凭证）
    ↓
Agent 用 retry_headers 重试请求
    ↓
服务端验证支付 → 返回数据
```

**付款地址：** CAW 钱包地址（扣款方）

**实现代码（lib/caw.ts）：**
```typescript
export async function payX402(challenge: Record<string, unknown>, walletUuid?: string) {
  const uuid = walletUuid || currentWalletUuid;
  const response = await transactionsApi.payment(uuid, {
    protocol: "x402",
    x402_payment_required: Buffer.from(JSON.stringify(challenge)).toString("base64"),
    request_id: `x402-${Date.now()}`,
  });
  return response.data;
}
```

### 收款（Agent 提供付费服务）

```
其他 Agent 调用 /api/data/eth-analysis
    ↓
@x402/next 中间件拦截
  → 返回 402 + 支付指令
  → payTo = CAW 钱包地址
  → price = "$0.0001"
    ↓
其他 Agent 支付 USDC 到 payTo 地址
    ↓
@x402/next 验证支付
    ↓
执行 handler → 返回数据
```

**收款地址：** CAW 钱包地址（`AGENT_WALLET_ADDRESS`）

**实现代码（app/api/data/eth-analysis/route.ts）：**
```typescript
import { withX402 } from "@x402/next";
import { resourceServer } from "@/lib/x402-server";
import { getCurrentWalletAddress } from "@/lib/caw";

const handler = async (req: NextRequest) => {
  return NextResponse.json({ data: "ETH analysis report..." });
};

export const GET = withX402(handler, {
  accepts: {
    scheme: "exact",
    price: "$0.0001",
    network: "eip155:11155111",
    payTo: getCurrentWalletAddress(),  // CAW 钱包地址
  },
  description: "ETH Chain Analysis Report",
}, server);
```

### 汇总

| 方向 | 实现 | 地址 | 说明 |
|---|---|---|---|
| **付款** | CAW `payment()` API | 从 CAW 钱包扣款 | 无需 @x402/fetch |
| **收款** | `@x402/next` 中间件 | 收到 CAW 钱包 | 服务端需要 @x402 依赖 |

**同一个地址，同一个钱包。** CAW 钱包既是付款方也是收款方。

---

## ERC-8004 链上注册实现

**当前状态：** Mock 数据，需要实现真实注册。

**实现方案：** 使用 CAW `contractCall()` 调用 Identity Registry 合约。

```typescript
// 注册 Agent 到 ERC-8004
async function registerAgent(name: string, description: string, serviceUrl: string) {
  // 1. 上传元数据到 IPFS（via Pinata）
  const metadata = { name, description, serviceUrl, address: currentWalletAddress };
  const ipfsHash = await uploadToPinata(metadata);

  // 2. 编码合约调用（viem encodeFunctionData）
  const calldata = encodeFunctionData({
    abi: IDENTITY_REGISTRY_ABI,
    functionName: 'mint',
    args: [currentWalletAddress, `ipfs://${ipfsHash}`],
  });

  // 3. CAW contractCall 注册
  const result = await transactionsApi.contractCall(currentWalletUuid, {
    chain_id: 'SETH',
    contract_addr: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
    calldata: calldata,
    value: '0',
  });

  return result.data.result;
}
```

## 错误处理策略

| 场景 | 处理方式 |
|---|---|
| 余额不足 | 记录日志，提示用户充值，不重试 |
| x402 支付失败（非余额原因） | 重试 1 次，记录日志 |
| CAW API 不可用 | 返回错误信息，记录日志 |
| 配对码过期（30 分钟） | 提示用户重新生成 |
| 配对确认但未在 Cobo App 操作 | 提示用户先在 App 中确认 |

```typescript
// x402 支付错误处理示例
async function callPaidAPIWithRetry(url: string) {
  try {
    const response = await fetch(url);
    if (response.status !== 402) return response.json();

    const challenge = await response.json();
    const result = await txApi.payment(walletId, { ... });

    if (result.data.result.status === 'failed') {
      // 检查是否余额不足
      if (result.data.result.error?.includes('insufficient')) {
        log('Payment failed: insufficient balance');
        throw new Error('余额不足，请先充值');
      }
      // 其他失败，重试 1 次
      log('Payment failed, retrying...');
      const retry = await txApi.payment(walletId, { ... });
      return retry.data.result;
    }

    return result.data.result;
  } catch (error) {
    log(`Payment error: ${error.message}`);
    throw error;
  }
}
```

## TODO

- [ ] 实现 ERC-8004 链上注册（CAW contractCall + viem encodeFunctionData）
- [x] 确认 MPC 钱包创建所需的 main_node_id 获取方式（.env 配置 AGENT_MAIN_NODE_ID）
- [ ] 实现错误处理中间件
