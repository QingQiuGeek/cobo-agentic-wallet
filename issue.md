# Cobo 官方问题记录

> 仅记录 Cobo 平台/SDK/基础设施层面的问题，不包含业务逻辑、开发问题、API Key 获取等。

---

## 1. CAW CLI 无 Windows 安装包

**问题描述：** CAW CLI (`caw`) 仅提供 macOS 和 Linux 安装包，Windows 平台无官方安装方式。

**影响：**

- Windows 开发者无法通过 CLI 创建 Agent、管理钱包
- 无法使用 `caw wallet current --show-api-key` 等 CLI 命令
- 只能通过 REST API 或 TypeScript SDK 操作

**来源：** [CAW Developer CLI 文档](https://www.cobo.com/products/agentic-wallet/manual/developer/cli)

**状态：** 未解决

---

## 2. TSS 节点离线导致 MPC 钱包创建卡在 "preparing"

**问题描述：** 创建 MPC 类型钱包时，需要 Agent 的 TSS 节点与 Cobo 服务器协作完成密钥生成。如果 Agent TSS 节点不在线，钱包会一直停留在 `preparing` 状态，无法变为 `active`。

**影响：**

- 无法创建新的 MPC 钱包
- 已创建但未激活的钱包无法使用（余额、转账、支付全部不可用）
- 无明确的超时或错误提示，只有轮询等待

**诊断方式：**

```
GET /api/v1/wallets/{wallet_uuid}/node-status
返回 { online: false, status: "Valid" }
```

**根因：** MPC 密钥生成需要 Agent TSS 节点（API 类型）和 Cobo 节点同时在线。Agent 节点需要通过 CAW Agent SDK/CLI 保持长连接。如果 Agent 程序未运行，节点就是离线的。

**来源：** [CAW Security Overview](https://www.cobo.com/products/agentic-wallet/manual/security/overview)

**状态：** 未解决

---

## 3. MPC 钱包创建无明确超时机制

**问题描述：** `createWallet()` API 返回后，钱包状态为 `preparing`，但 SDK 文档未说明：

- 最长等待时间是多少
- 超时后钱包会怎样（是否自动清理）
- 如何取消一个卡住的创建请求

**影响：**

- 客户端只能自行实现轮询 + 超时逻辑
- 超时后不确定钱包是否已创建（可能重复创建）
- 无法主动取消卡住的创建请求

**来源：** [Create Wallet API](https://www.cobo.com/products/agentic-wallet/manual/reference/create-wallet)

**状态：** 未解决

---

## 4. x402 支付 API 的 `x402_payment_required` 字段需要 Base64 编码

**问题描述：** `payment()` API 的 `x402_payment_required` 字段要求 Base64 编码的 JSON 字符串，但 SDK 文档和 TypeScript 类型定义中没有明确说明这一点。

**影响：**

- 直接传入 JSON 对象会导致 API 报错
- 需要额外编码：`Buffer.from(JSON.stringify(challenge)).toString("base64")`

**来源：** [Create Payment API](https://www.cobo.com/products/agentic-wallet/manual/reference/payment)

**状态：** 文档不清晰

---

## 5. CAW API 响应结构不一致

**问题描述：** 不同 API 返回的 `result` 字段结构不一致：

- `listBalances()` → `result` 是数组 `BalanceRead[]`
- `listAuditLogs()` → `result` 是对象 `{ items: AuditLog[] }`
- `listWalletAddresses()` → `result` 是数组 `WalletAddressRead[]`

**影响：**

- 不能统一用 `response.data.result.map()` 处理
- 需要针对每个 API 检查 `result` 是数组还是对象
- 容易导致 `result.map is not a function` 运行时错误

**来源：** 各 API 的 TypeScript 类型定义

**状态：** SDK 设计如此

---

## 6. `createWalletAddress()` 返回的地址可能包含 Solana 格式

**问题描述：** 调用 `createWalletAddress({ chain_id: "SETH" })` 时，返回的地址列表可能同时包含 EVM（0x 开头）和 Solana（Base58）格式的地址。没有参数可以指定只返回 EVM 地址。

**影响：**

- 前端需要过滤地址格式
- 可能误将 Solana 地址当作 EVM 地址展示

**来源：** [Create Wallet Address API](https://www.cobo.com/products/agentic-wallet/manual/reference/create-wallet-address)

**状态：** SDK 设计如此

---

## 7. Faucet API 的代币列表因链而异，无统一文档

**问题描述：** `faucet.listTokens()` 返回的可用测试币因链而异，但文档没有列出每个链支持哪些代币。

**影响：**

- 无法在开发前规划测试币领取策略
- 不同链的 token_id 命名不一致（如 `SETH` vs `TBASE_ETH`）

**来源：** [Faucet API](https://www.cobo.com/products/agentic-wallet/manual/reference/faucet)

**状态：** 文档不完善

---

## 总结

| 问题               | 类型     | 影响范围       | 严重程度 |
| ------------------ | -------- | -------------- | -------- |
| Windows 无 CAW CLI | 平台限制 | Windows 开发者 | 中       |
| TSS 节点离线       | 基础设施 | MPC 钱包创建   | 高       |
| 无超时机制         | API 设计 | 钱包创建流程   | 中       |
| x402 字段编码      | 文档     | x402 支付集成  | 低       |
| 响应结构不一致     | SDK 设计 | 所有 API 调用  | 中       |
| 地址格式混合       | SDK 设计 | 地址展示       | 低       |
| Faucet 文档不完善  | 文档     | 测试币领取     | 低       |

audit log支持时间筛选
