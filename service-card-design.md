# ServiceCard 组件设计

## 单个服务卡片排版

### 收起状态（默认）

```
┌──────────────────────────────────────────────────────────────┐
│ ▶ Trending Tokens API                   0.00 USD Coin  base │
└──────────────────────────────────────────────────────────────┘
```

### 展开状态（点击 ▶ 后）

```
┌──────────────────────────────────────────────────────────────┐
│ ▼ #ID Trending Tokens API                   0.00 USD Coin  base │
├──────────────────────────────────────────────────────────────┤
│ 🔗 Link                                                      │
│                                                              │
│ Returns trending tokens across the entire blockchain for a   │
│ specified activity window and optional category.             │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ▼ accepts (1)                              [📋 复制JSON] │ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │ {                                                        │ │
│ │   "scheme": "exact",                                     │ │
│ │   "network": "base",                                     │ │
│ │   "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", │ │
│ │   "payTo": "0xd85096fAeC1aC03075667B4C1a1661F5623Bf111", │ │
│ │   "maxAmountRequired": "1000",                           │ │
│ │   "maxTimeoutSeconds": 300,                              │ │
│ │   "mimeType": "application/json",                        │ │
│ │   "resource": "https://api.slamai.dev/...",              │ │
│ │   "outputSchema": { ... }                                │ │
│ │ }                                                        │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## 布局规则

### 首行（Header Row）

```
▶ Trending Tokens API                   0.00 USD Coin    base
│ │                    │                    │              │
│ │                    │                    │              │
│ 展开/收起按钮         服务名               价格 Badge     网络 Badge
│   ▶ 收起（默认）      (12px 粗体)          (10px 绿色)    (10px 灰色)
│   ▼ 展开              最多 1 行，超出截断
```

### 展开内容区

**第一行：Link**

```
🔗 Link
```

- 11px 蓝色，带下划线
- 点击在新窗口打开 `service.url`
- 左侧有链接图标

**第二行：描述**

```
Returns trending tokens across the entire blockchain for a specified
activity window and optional category.
```

- 11px 灰色
- 最多 2 行，超出截断

**第三行：Accepts 卡片（可展开/收起）**

收起状态：

```
▶ accepts (1)
```

- 11px 灰色等宽
- 显示 accepts 数组长度

展开状态：

```
┌──────────────────────────────────────────────────────────┐
│ ▼ accepts (1)                              [📋 复制JSON] │
├──────────────────────────────────────────────────────────┤
│ {                                                        │
│   "scheme": "exact",                                     │
│   "network": "base",                                     │
│   "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", │
│   "payTo": "0xd85096fAeC1aC03075667B4C1a1661F5623Bf111", │
│   "maxAmountRequired": "1000",                           │
│   "maxTimeoutSeconds": 300,                              │
│   "mimeType": "application/json",                        │
│   "resource": "https://api.slamai.dev/...",              │
│   "outputSchema": {                                      │
│     "input": {                                           │
│       "type": "http",                                    │
│       "method": "GET"                                    │
│     }                                                    │
│   }                                                      │
│ }                                                        │
└──────────────────────────────────────────────────────────┘
```

- 背景：`bg-zinc-50 dark:bg-zinc-900`
- 边框：`border border-zinc-200 dark:border-zinc-800`
- 圆角：`rounded-md`
- 内边距：`p-3`
- JSON：`JSON.stringify(accepts, null, 2)` 格式化
- 字体：`text-[10px] font-mono`
- 长地址/URL：完整展示，卡片内可左右滚动
- 右上角复制按钮：复制整个 accepts JSON
- 多个 accepts 元素全部展示

## 多个服务卡片

```
┌──────────────────────────────────────────────────────────────┐
│ ▶ Trending Tokens API                   0.00 USD Coin  base │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ ▼ Current Weather                        0.01 USD Coin  base │
├──────────────────────────────────────────────────────────────┤
│ 🔗 Link                                                      │
│ Get current weather for a location                           │
│ [▶ accepts (1)]                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ ▶ Crypto Prices                          0.005 USDC  eip155 │
└──────────────────────────────────────────────────────────────┘
```

## 交互

| 交互             | 行为                            |
| ---------------- | ------------------------------- |
| 点击 ▶/▼         | 切换服务详情展开/收起           |
| 点击 🔗 Link     | 新窗口打开服务 URL              |
| 点击 accepts ▶/▼ | 切换 JSON 展开/收起             |
| 点击 📋 复制     | 复制 accepts JSON，按钮变 ✓ 2秒 |
| hover 卡片       | 背景微变                        |
