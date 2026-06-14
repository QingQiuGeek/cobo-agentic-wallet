# 黑客松路演 PPT 内容资料

> **风格**: 炫酷黑白简约 · 深色主题为主，白色文字 + 高对比度点缀
> **建议配色**: #000000 背景 / #FFFFFF 文字 / #22D3EE 亮色强调 / #6366F1 紫色渐变点缀

---

## Slide 1 · 封面

**COBO AGENTIC WALLET**
*Agent-Native Payments on Web3*

> Cobo Hackathon · Track 01: Agent-Native Payments
> 团队名称 · 2026

---

## Slide 2 · 背景

### AI Agent 正在改变一切

- 2026 年，AI Agent 从"对话助手"进化为**自主行动者**
- Agent 需要：发现服务 → 支付 → 获取数据 → 决策 → 执行
- **核心问题：Agent 如何自主管理资金和支付？**

> 现有方案：人工充值、中心化托管、无权限控制
> → 无法满足 Agent 自主经济活动的需求

---

## Slide 3 · 解决的问题

### 三个核心痛点

| 痛点 | 传统方案 | 我们的方案 |
|------|---------|-----------|
| **Agent 无法自主支付** | 人工充值 + 手动授权 | x402 协议自动支付 |
| **资金安全无保障** | 私钥暴露 / 无权限控制 | CAW MPC 多签 + Pact 权限 |
| **链上身份不可信** | 无身份 / 可伪造 | ERC-8004 链上注册 |

---

## Slide 4 · 产品目标

### 让 AI Agent 成为真正的经济主体

```
Agent 自主发现服务 → 自主支付 → 自主获取数据 → 自主决策
```

- ✅ Agent 独立管理钱包（无私钥暴露）
- ✅ Agent 自动完成 x402 支付
- ✅ Agent 在链上注册身份（ERC-8004）
- ✅ 人类通过 Pact 控制 Agent 权限边界

---

## Slide 5 · 核心功能

### 🤖 AI Agent 对话式操作

用户用自然语言下达指令，Agent 自主执行：

- "帮我分析 ETH 链上数据" → Agent 发现服务 → x402 支付 → 获取数据 → 返回分析结果
- "查一下我的余额" → Agent 调用 CAW API → 返回实时余额
- "注册我的 Agent 身份" → Agent 调用 contractCall → 链上写入 ERC-8004

---

## Slide 6 · 核心功能

### 💰 Cobo Agentic Wallet 集成

- **钱包管理**: 创建 / 切换 / 查看余额（MPC 多签）
- **资金操作**: 充值 / 转账 / 水龙头领取测试币
- **权限控制**: Pact 策略管理（transfer / contract_call / message_sign）
- **审计日志**: SSE 实时推送，完整操作链路追溯

---

## Slide 7 · 核心功能

### 🔐 x402 支付协议

```
Agent 请求 API → 402 Payment Required → Agent 自动支付 → 获取数据
```

- 基于 HTTP 402 状态码的原生支付协议
- CAW `payment()` API 原生支持 x402
- 支持 ETH/USDC 等多种代币
- 4mica Facilitator 链上结算

---

## Slide 8 · 核心功能

### 📜 ERC-8004 链上身份

- Agent 在以太坊 Sepolia 测试网注册身份
- 通过 CAW `contractCall()` + viem 编码实现
- 链上可验证、不可伪造
- 为 Agent 信誉系统奠定基础

---

## Slide 9 · 产品架构

```
┌─────────────────────────────────────────────────────┐
│                    用户界面层                         │
│  Chat Interface · Wallet Dashboard · Transaction Log │
├─────────────────────────────────────────────────────┤
│                   AI Agent 层                        │
│     ToolLoopAgent (Vercel AI SDK + DashScope)        │
│     Tools: discover · pay · balance · transfer       │
├─────────────────────────────────────────────────────┤
│                  服务层 (Next.js API)                 │
│  x402 Paid APIs · Wallet APIs · Audit SSE · A2A      │
├─────────────────────────────────────────────────────┤
│                  基础设施层                           │
│  Cobo Agentic Wallet · x402 Protocol · ERC-8004     │
│  Ethereum Sepolia · 4mica Facilitator                │
└─────────────────────────────────────────────────────┘
```

---

## Slide 10 · 技术栈

### 前端
- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS v4** + shadcn/ui
- **Zustand** 状态管理

### AI / Agent
- **Vercel AI SDK** (`generateText` + `streamText`)
- **DashScope** (qwen3.6-27b 模型)
- **ToolLoopAgent** 架构

### Web3 / 区块链
- **Cobo Agentic Wallet SDK** (`@cobo/cobo-agentic-wallet-kit`)
- **viem** 编码 ERC-8004 calldata
- **x402 协议** (`@x402/next`)

### 基础设施
- **Ethereum Sepolia** 测试网
- **Pinata** IPFS 存储
- **SSE** 实时审计日志

---

## Slide 11 · x402 支付流程

```
1. Agent 请求 /api/data/eth-analysis
2. 服务端返回 402 + Payment Required (含价格 & 收款地址)
3. CAW payment() API 自动完成 USDC/ETH 转账
4. 携带支付凭证重新请求
5. 服务端验证支付 → 返回数据
```

> **关键**: CAW 原生支持 x402，无需额外客户端 SDK
> Agent 只需调用一个 API，支付全自动

---

## Slide 12 · 权限控制 (Pact)

### 人类控制 Agent 的边界

```
Owner (人类)
   │
   ├─ 创建 Pact（定义权限策略）
   │   ├─ can_transfer: 允许转账
   │   ├─ can_contract_call: 允许合约调用
   │   └─ can_message_sign: 允许消息签名
   │
   └─ Agent 使用 Pact API Key 操作
       └─ 超出权限 → 自动拒绝
```

> Agent 有能力，但有边界
> 人类授权，Agent 执行

---

## Slide 13 · 项目亮点

### 🏆 为什么选择我们

| 亮点 | 说明 |
|------|------|
| **Agent-Native** | 不是"给 Agent 加个钱包"，而是"钱包就是 Agent 的一部分" |
| **安全优先** | MPC 多签 + Pact 权限，无私钥暴露 |
| **协议原生** | x402 + ERC-8004，不是自造轮子 |
| **完整闭环** | 发现 → 支付 → 获取 → 决策 → 执行 |
| **可扩展** | A2A 协议支持 Agent 间通信 |

---

## Slide 14 · 未来展望

### Phase 2+

- 🔗 **多链支持**: Base / Polygon / Arbitrum
- 🤖 **多 Agent 协作**: A2A 协议 Agent 间服务发现与支付
- 📊 **Agent 信誉系统**: 基于 ERC-8004 的链上评分
- 🏦 **主网部署**: 从测试网到真实经济环境
- 🔌 **MCP 集成**: 标准化工具接口

---

## Slide 15 · 团队 / 致谢

### Thank You

> Cobo Agentic Wallet · 让 AI Agent 成为真正的经济主体

- GitHub: [项目链接]
- Demo: [演示地址]

---

## PPT 设计建议

### 视觉风格
- **背景**: 纯黑 #000000 或深灰 #0A0A0A
- **文字**: 纯白 #FFFFFF，标题加粗
- **强调色**: 青色 #22D3EE（链接、按钮、图标）
- **渐变点缀**: 紫→蓝 #6366F1 → #3B82F6（背景装饰）
- **字体**: Inter / SF Pro Display（英文），思源黑体（中文）

### 动画建议
- 标题淡入 + 上移
- 架构图逐步展开
- 代码块逐行高亮
- 流程图箭头动画

### 图表建议
- 架构图：分层框图，每层不同灰度
- 流程图：箭头 + 图标，简洁线条
- 对比表：左暗右亮，强调差异
- 技术栈：图标网格，hover 放大
