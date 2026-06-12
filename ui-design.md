# Cobo Agentic Wallet — UI 设计规范

## 1. 设计原则

- **黑白简约**：以黑、白、灰为主色调，无多余装饰
- **信息密度高**：一屏展示尽可能多的有效信息
- **层次分明**：通过间距、字重、颜色深浅区分层级
- **响应式**：桌面端优先，支持平板适配

---

## 2. 配色方案

### 2.1 Light 主题

```css
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  --popover: #ffffff;
  --popover-foreground: #0a0a0a;
  --primary: #0a0a0a;
  --primary-foreground: #fafafa;
  --secondary: #f5f5f5;
  --secondary-foreground: #0a0a0a;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --accent: #f5f5f5;
  --accent-foreground: #0a0a0a;
  --destructive: #ef4444;
  --destructive-foreground: #fafafa;
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: #0a0a0a;
  --success: #22c55e;
  --warning: #f59e0b;
  --info: #3b82f6;
}
```

### 2.2 Dark 主题

```css
.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --card: #0a0a0a;
  --card-foreground: #fafafa;
  --popover: #0a0a0a;
  --popover-foreground: #fafafa;
  --primary: #fafafa;
  --primary-foreground: #0a0a0a;
  --secondary: #262626;
  --secondary-foreground: #fafafa;
  --muted: #262626;
  --muted-foreground: #a3a3a3;
  --accent: #262626;
  --accent-foreground: #fafafa;
  --destructive: #ef4444;
  --destructive-foreground: #fafafa;
  --border: #262626;
  --input: #262626;
  --ring: #d4d4d4;
  --success: #22c55e;
  --warning: #f59e0b;
  --info: #3b82f6;
}
```

### 2.3 语义色

| 用途 | 颜色 | Tailwind Class |
|---|---|---|
| 成功/已确认 | `#22c55e` | `text-green-500` |
| 警告/Pending | `#f59e0b` | `text-amber-500` |
| 错误/失败 | `#ef4444` | `text-red-500` |
| 信息/链接 | `#3b82f6` | `text-blue-500` |
| 禁用/次要文字 | `#737373` / `#a3a3a3` | `text-muted-foreground` |

---

## 3. 字体

```css
/* 主字体 — Geist Sans */
font-family: "Geist Sans", "Inter", system-ui, -apple-system, sans-serif;

/* 等宽字体 — 用于地址、哈希、金额 */
font-family: "Geist Mono", "JetBrains Mono", "Fira Code", monospace;
```

### 字号规范

| 层级 | 大小 | 字重 | 用途 |
|---|---|---|---|
| h1 | `text-2xl` (24px) | `font-bold` (700) | 页面标题 |
| h2 | `text-xl` (20px) | `font-semibold` (600) | 区块标题 |
| h3 | `text-lg` (18px) | `font-semibold` (600) | 卡片标题 |
| body | `text-sm` (14px) | `font-normal` (400) | 正文 |
| caption | `text-xs` (12px) | `font-normal` (400) | 辅助文字、时间戳 |
| mono | `text-sm` (14px) | `font-mono` | 地址、哈希、金额 |

---

## 4. 间距系统

基于 Tailwind 的 `4px` 网格：

| Token | 值 | 用途 |
|---|---|---|
| `gap-1` | 4px | 紧凑元素间距 |
| `gap-2` | 8px | 按钮内间距、标签间距 |
| `gap-3` | 12px | 列表项间距 |
| `gap-4` | 16px | 卡片内间距 |
| `gap-6` | 24px | 区块间距 |
| `gap-8` | 32px | 大区块间距 |

---

## 5. 圆角

| 元素 | 圆角 | Tailwind |
|---|---|---|
| 按钮 | 6px | `rounded-md` |
| 卡片 | 8px | `rounded-lg` |
| 输入框 | 6px | `rounded-md` |
| 头像 | 50% | `rounded-full` |
| Badge | 9999px | `rounded-full` |

---

## 6. 阴影

仅在 Light 主题下使用阴影，Dark 主题通过边框区分层级：

```css
/* Light 主题 */
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);   /* 卡片 */
shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);    /* 弹窗 */

/* Dark 主题 — 无阴影，用边框 */
border: 1px solid hsl(var(--border));
```

---

## 7. 页面布局

### 7.1 整体结构

```
┌─────────────────────────────────────────────────────────────┐
│                        Navbar (h-14)                         │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   Sidebar    │              Main Content                    │
│   (w-64)     │              (flex-1)                        │
│              │                                              │
│              │                                              │
│              │                                              │
│              ├──────────────────────────────────────────────┤
│              │         Bottom Panel (可收缩)                 │
│              │         (min-h-48, max-h-[50vh])             │
└──────────────┴──────────────────────────────────────────────┘
```

- **Navbar**: 固定顶部，`h-14` (56px)
- **Sidebar**: 固定左侧，`w-64` (256px)
- **Main Content**: 自适应剩余空间
- **Bottom Panel**: 可拖拽收缩，默认 `h-64` (256px)

### 7.2 Navbar

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Cobo Agentic Wallet         [🌐 Base Sepolia] [🌓] │
└─────────────────────────────────────────────────────────────┘
```

**组件：** `div.flex.items-center.justify-between.h-14.px-6.border-b`

| 元素 | 实现 |
|---|---|
| Logo + 标题 | `text-lg.font-semibold` + "Cobo Agentic Wallet" |
| 网络选择 | shadcn `Badge` — "Base Sepolia" (绿色圆点 + 文字) |
| 主题切换 | shadcn `Button` variant="ghost" size="icon" — 太阳/月亮图标 |

### 7.3 Sidebar

```
┌──────────────┐
│              │
│  💰 钱包     │  ← 可折叠区块
│  0xCAW...    │  ← monospace 地址
│  ETH: 0.5   │
│  USDC: $10  │
│              │
│  ─────────── │
│              │
│  🆔 注册     │  ← 可折叠区块
│  Base ✅ #123│  ← 已注册：Badge(success)
│  ETH  ❌     │  ← 未注册：Badge(secondary)
│  [注册到ETH] │  ← shadcn Button size="sm"
│              │
│  ─────────── │
│              │
│  🏪 我的服务 │  ← 可折叠区块
│  /api/eth... │  ← 服务列表
│  /api/mkt... │
│              │
└──────────────┘
```

**组件：** `div.w-64.h-full.border-r.flex.flex-col.gap-4.p-4.overflow-y-auto`

| 区块 | 实现 |
|---|---|
| 钱包信息 | shadcn `Card` + `Collapsible` |
| 注册状态 | shadcn `Card` + 每条链一行（Badge + Button） |
| 我的服务 | shadcn `Card` + `Collapsible` + 服务列表 |

**钱包卡片详细：**

```
┌─────────────────────────┐
│ 💰 钱包            [▼]  │  ← Collapsible trigger
├─────────────────────────┤
│ 0xCAW1234...5678  [📋]  │  ← 地址 + 复制按钮
│                         │
│ ETH        0.5000       │  ← 代币行
│ USDC      $10.0000      │  ← 代币行（绿色=正数）
│                         │
│ [充值] [转账]           │  ← 操作按钮
└─────────────────────────┘
```

**注册卡片详细：**

```
┌─────────────────────────┐
│ 🆔 ERC-8004 注册   [▼]  │
├─────────────────────────┤
│ ⚠️ 注册后不可撤销       │  ← 警告文字 (text-amber-500)
│                         │
│ Base Sepolia  ✅ #1234  │  ← Badge(success) + tokenId
│               8004scan↗ │  ← 链接 (text-blue-500)
│                         │
│ ETH Sepolia   ❌ 未注册  │  ← Badge(secondary)
│ [注册到 ETH Sepolia]    │  ← Button variant="outline" size="sm"
│                         │
│ Polygon Amoy  🔜 即将   │  ← Badge(muted) + 禁用
└─────────────────────────┘
```

---

## 8. Main Content — Agent 对话

### 8.1 对话区布局

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ 👤 用户                      14:01       │   │
│  │ 帮我获取 ETH 链上分析报告                │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ 🤖 Agent                    14:02       │   │
│  │                                          │   │
│  │ 正在搜索付费数据服务...                  │   │
│  │                                          │   │
│  │ ┌ 🔍 discoverServices ────────────────┐ │   │
│  │ │ query: "ETH analysis"               │ │   │  ← 工具调用卡片
│  │ │ 结果: 3 个服务                       │ │   │
│  │ └─────────────────────────────────────┘ │   │
│  │                                          │   │
│  │ 找到 3 个付费服务，正在调用 eth-analysis │   │
│  │                                          │   │
│  │ ┌ 💰 callPaidAPI ────────────────────┐ │   │
│  │ │ url: /api/data/eth-analysis        │ │   │  ← 工具调用卡片
│  │ │ 支付: $0.001 USDC                  │ │   │
│  │ │ 状态: ✅ 成功                       │ │   │
│  │ │ TxHash: 0xABC...DEF                │ │   │
│  │ └─────────────────────────────────────┘ │   │
│  │                                          │   │
│  │ 已获取 ETH 分析报告。支付了 $0.001 USDC │   │
│  │ (tx: 0xABC...DEF)。报告如下：           │   │
│  │                                          │   │
│  │ ┌ 报告内容 ─────────────────────────┐  │   │
│  │ │ ETH 链上活跃度分析...              │  │   │  ← 数据卡片
│  │ └──────────────────────────────────┘  │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ [输入消息...]                         [→] │   │  ← 输入框
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

### 8.2 消息气泡

**用户消息：**
```tsx
<div className="flex justify-end mb-4">
  <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
    <p className="text-sm">{content}</p>
    <span className="text-xs opacity-70 mt-1 block text-right">{time}</span>
  </div>
</div>
```

**Agent 消息：**
```tsx
<div className="flex justify-start mb-4">
  <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs font-medium">🤖 Agent</span>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
    <p className="text-sm">{content}</p>
    {toolCalls.map(call => <ToolCallCard key={call.id} {...call} />)}
  </div>
</div>
```

### 8.3 工具调用卡片

```
┌─────────────────────────────────────┐
│ 🔍 discoverServices         ✅ 完成 │  ← 图标 + 工具名 + 状态 Badge
├─────────────────────────────────────┤
│ query: "ETH analysis"               │  ← 参数 (monospace, text-xs)
│ 结果: 3 个服务                       │  ← 结果摘要
└─────────────────────────────────────┘
```

**组件：** `div.border.rounded-md.p-3.my-2.bg-background`

| 状态 | 图标 | 颜色 |
|---|---|---|
| 执行中 | `Loader2` (spin) | `text-muted-foreground` |
| 成功 | `Check` | `text-green-500` |
| 失败 | `X` | `text-red-500` |

### 8.4 输入框

**组件：** shadcn `Input` + `Button`

```tsx
<div className="flex gap-2 p-4 border-t">
  <Input
    placeholder="输入消息..."
    className="flex-1"
  />
  <Button size="icon">
    <ArrowRight className="h-4 w-4" />
  </Button>
</div>
```

---

## 9. Bottom Panel — 交易记录 & 操作日志

### 9.1 面板结构

```
┌──────────────────────────────────────────────────────────────┐
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ (拖拽条) ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
├──────────────────────────────────────────────────────────────┤
│ [交易记录] [操作日志]                           [▲ 收起/展开] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  内容区 (可滚动)                                              │
│                                                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                      [< 1 2 3 ... 5 >]                       │
└──────────────────────────────────────────────────────────────┘
```

**组件：** shadcn `ResizablePanel` 或自定义 `Collapsible` + `Tabs`

| 部件 | shadcn 组件 | 说明 |
|---|---|---|
| 面板容器 | `ResizablePanel` | 可拖拽调整高度 |
| 拖拽条 | `ResizableHandle` | 顶部水平拖拽条 |
| Tab 切换 | `Tabs` + `TabsList` + `TabsTrigger` | "交易记录" / "操作日志" |
| 内容区 | `ScrollArea` | 可滚动内容 |
| 分页 | `Pagination` | 10 条/页 |
| 收起按钮 | `Button` variant="ghost" size="icon" | ChevronUp/ChevronDown |

### 9.2 交易记录 Tab

```
┌──────────────────────────────────────────────────────────────────┐
│ #   │ 时间    │ 类型 │ 对方地址    │ 代币 │ 金额    │ 状态 │ TxHash │
├──────────────────────────────────────────────────────────────────┤
│ 1   │ 14:02   │ x402 │ 0xABC...DEF │ USDC │ $0.001  │ ✅   │ 0x123… │
│ 2   │ 14:01   │ 转账 │ 0x111...222 │ ETH  │ 0.005   │ ✅   │ 0x456… │
│ 3   │ 13:58   │ x402 │ 0xABC...DEF │ USDC │ $0.002  │ ⏳   │ 0x789… │
│ 4   │ 13:55   │ x402 │ 0xABC...DEF │ USDC │ $0.001  │ ❌   │ —      │
└──────────────────────────────────────────────────────────────────┘
                              [< 1 2 3 >]
```

**组件：** shadcn `Table`

| 列 | 宽度 | 格式 |
|---|---|---|
| # | `w-8` | 数字 |
| 时间 | `w-16` | `HH:mm` |
| 类型 | `w-12` | Badge (x402/转账) |
| 对方地址 | `flex-1` | `font-mono text-xs` + 截断 |
| 代币 | `w-12` | Badge |
| 金额 | `w-20` | `font-mono text-sm text-right` |
| 状态 | `w-12` | 图标：✅/⏳/❌ |
| TxHash | `w-24` | `font-mono text-xs` + 截断 + 复制 |

**状态映射：**

| 状态 | 图标 | 颜色 |
|---|---|---|
| success | `CheckCircle2` | `text-green-500` |
| pending | `Loader2` (spin) | `text-amber-500` |
| failed | `XCircle` | `text-red-500` |

### 9.3 操作日志 Tab

```
┌──────────────────────────────────────────────────────────┐
│ 14:02  💰 支付    支付 $0.001 USDC 获取 ETH 分析报告  ✅ │
│ 14:02  🔍 发现    搜索 "ETH analysis"，找到 3 个结果   ✅ │
│ 14:01  📋 查询    查询余额：ETH 0.5, USDC $10.00      ✅ │
│ 14:00  ⚠️ 错误    支付失败：余额不足                    ❌ │
│ 13:58  🆔 注册    注册到 Base Sepolia，tokenId: #1234  ✅ │
└──────────────────────────────────────────────────────────┘
                              [< 1 2 3 >]
```

**组件：** 自定义列表（非 Table）

每行结构：
```tsx
<div className="flex items-center gap-3 py-2 px-4 hover:bg-muted/50">
  <span className="text-xs text-muted-foreground w-12">{time}</span>
  <span className="text-base w-6">{category_icon}</span>
  <span className="text-xs font-medium w-12">{category_name}</span>
  <span className="text-sm flex-1">{description}</span>
  <StatusBadge status={status} />
</div>
```

**日志分类图标：**

| 分类 | 图标 | Badge 颜色 |
|---|---|---|
| 发现 | `Search` | `bg-blue-500/10 text-blue-500` |
| 支付 | `DollarSign` | `bg-green-500/10 text-green-500` |
| 转账 | `Send` | `bg-purple-500/10 text-purple-500` |
| 查询 | `List` | `bg-gray-500/10 text-gray-500` |
| 注册 | `Fingerprint` | `bg-cyan-500/10 text-cyan-500` |
| A2A | `Users` | `bg-orange-500/10 text-orange-500` |
| 错误 | `AlertTriangle` | `bg-red-500/10 text-red-500` |

---

## 10. 注册确认弹窗

```
┌─────────────────────────────────────────┐
│                                         │
│  🆔 确认注册到 Base Sepolia             │
│                                         │
│  ⚠️ 此操作不可撤销，链上记录永久存在    │
│                                         │
│  Agent 名称: CoboAgent                  │
│  钱包地址: 0xCAW1234...5678             │
│  注册链: Base Sepolia                   │
│  Registry 合约: 0x8004...4BD9e          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 预估 Gas: ~0.001 ETH            │   │
│  └─────────────────────────────────┘   │
│                                         │
│        [取消]    [确认注册]             │
│                 (Button variant=        │
│                  "default")             │
└─────────────────────────────────────────┘
```

**组件：** shadcn `AlertDialog`

---

## 11. 创建钱包弹窗

```
┌─────────────────────────────────────────┐
│                                         │
│  💰 创建 Agent 钱包                     │
│                                         │
│  Agent 名称                             │
│  ┌─────────────────────────────────┐   │
│  │ CoboAgent                       │   │  ← Input
│  └─────────────────────────────────┘   │
│                                         │
│  钱包类型                               │
│  ┌─────────────────────────────────┐   │
│  │ ● Agent 自有钱包 (推荐)         │   │  ← RadioGroup
│  │ ○ 用户配对钱包                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  配对码 (仅配对模式)                    │
│  ┌─────────────────────────────────┐   │
│  │ _ _ _ _ _ _ _ _                 │   │  ← Input (disabled if not paired)
│  └─────────────────────────────────┘   │
│                                         │
│        [取消]    [创建钱包]             │
└─────────────────────────────────────────┘
```

**组件：** shadcn `Dialog` + `Input` + `RadioGroup` + `Button`

---

## 12. 组件清单

### shadcn/ui 组件

| 组件 | 用途 |
|---|---|
| `Button` | 操作按钮（注册、充值、转账、发送） |
| `Card` | 侧边栏区块容器 |
| `Input` | 消息输入、搜索、表单 |
| `Badge` | 状态标签（已注册/未注册/成功/失败） |
| `Table` | 交易记录表格 |
| `Tabs` | 底部面板 Tab 切换 |
| `Dialog` / `AlertDialog` | 注册确认、创建钱包弹窗 |
| `Collapsible` | 侧边栏可折叠区块 |
| `ScrollArea` | 可滚动内容区 |
| `Pagination` | 分页控件 |
| `Tooltip` | 地址截断时的完整提示 |
| `Separator` | 分割线 |
| `Avatar` | 用户/Agent 头像 |
| `DropdownMenu` | 网络选择、更多操作 |
| `Sheet` | 移动端侧边栏抽屉 |
| `Skeleton` | 加载状态骨架屏 |
| `Toast` | 操作反馈通知 |
| `ResizablePanel` | 底部面板可拖拽调整 |

### 自定义组件

| 组件 | 文件 | 说明 |
|---|---|---|
| `ChatMessage` | `components/chat/message.tsx` | 消息气泡 |
| `ToolCallCard` | `components/chat/tool-call-card.tsx` | 工具调用卡片 |
| `ChatInput` | `components/chat/input.tsx` | 消息输入框 |
| `WalletCard` | `components/sidebar/wallet-card.tsx` | 钱包信息卡片 |
| `RegistrationCard` | `components/sidebar/registration-card.tsx` | 注册状态卡片 |
| `ServiceList` | `components/sidebar/service-list.tsx` | 服务列表 |
| `TransactionTable` | `components/panel/transaction-table.tsx` | 交易记录表格 |
| `ActivityLog` | `components/panel/activity-log.tsx` | 操作日志列表 |
| `BottomPanel` | `components/panel/bottom-panel.tsx` | 可收缩底部面板 |
| `ThemeToggle` | `components/theme-toggle.tsx` | 主题切换按钮 |
| `NetworkBadge` | `components/network-badge.tsx` | 网络状态 Badge |
| `StatusBadge` | `components/status-badge.tsx` | 通用状态 Badge |
| `AddressDisplay` | `components/address-display.tsx` | 地址截断显示 + 复制 |

---

## 13. 动画

| 元素 | 动画 | Tailwind |
|---|---|---|
| 消息出现 | 从下方淡入 | `animate-in slide-in-from-bottom-2 fade-in duration-300` |
| 工具调用卡片 | 展开动画 | `animate-in slide-in-from-top-1 fade-in duration-200` |
| 底部面板 | 高度过渡 | `transition-all duration-300 ease-in-out` |
| 主题切换 | 颜色过渡 | `transition-colors duration-200` |
| 按钮 hover | 背景色变 | `transition-colors duration-150` |
| 加载 spinner | 旋转 | `animate-spin` (Loader2) |

---

## 14. 响应式断点

| 断点 | 宽度 | 布局变化 |
|---|---|---|
| `sm` | ≥640px | 移动端：侧边栏隐藏，Sheet 抽屉 |
| `md` | ≥768px | 平板：侧边栏收窄为图标模式 |
| `lg` | ≥1024px | 桌面：完整布局 |
| `xl` | ≥1280px | 大屏：内容区最大宽度 `max-w-7xl` |

---

## 15. 文件结构

```
app/
├── layout.tsx              # RootLayout (ThemeProvider, 全局样式)
├── page.tsx                # 主页面 (Dashboard)
└── globals.css             # Tailwind + CSS 变量

components/
├── chat/
│   ├── message.tsx         # ChatMessage
│   ├── tool-call-card.tsx  # ToolCallCard
│   └── input.tsx           # ChatInput
├── sidebar/
│   ├── wallet-card.tsx     # WalletCard
│   ├── registration-card.tsx # RegistrationCard
│   └── service-list.tsx    # ServiceList
├── panel/
│   ├── bottom-panel.tsx    # BottomPanel (可收缩容器)
│   ├── transaction-table.tsx # TransactionTable
│   └── activity-log.tsx    # ActivityLog
├── navbar.tsx              # Navbar
├── theme-toggle.tsx        # ThemeToggle
├── theme-provider.tsx      # ThemeProvider (next-themes)
├── network-badge.tsx       # NetworkBadge
├── status-badge.tsx        # StatusBadge
└── address-display.tsx     # AddressDisplay
```
