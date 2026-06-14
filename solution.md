curl --request GET \
 --url https://api.agenticwallet.cobo.com/api/v1/wallets/b3bfb0e4-cf2b-4a00-866f-c9e41d101ec5/transactions/by-request-id/faucet-e683508a4acd437983527d4891355a4c \
 --header 'X-API-Key: caw_k3bX0Xpk-o9d-c-5NS4BNN8B0PuLyrzKXyJYd3gPWf8'

# 已知问题与解决方案

## 问题 1: SSE Controller 报错

**状态：** ✅ 已解决
**原因：** 客户端断开后 interval 还在尝试 enqueue
**方案：** 添加 `isClosed` 标志 + `cancel()` 回调，轮询时检查状态

## 问题 2 & 3: SOLDEV 代币领取不生效

**状态：** 已定位根因
**根因：** CAW faucet 对 SOLDEV 代币返回 `status: "Submitted"`，但实际没有创建链上交易。CAW 交易记录 API 查询结果为空（只有 SETH 交易）。Solana Devnet 上也看不到入账。

**证据：**

- Faucet API 返回：`status: "Submitted"`, `transaction_id: "30c49cef..."`
- CAW 交易记录查询：无 SOLDEV 相关交易（全部是 SETH deposit）
- Solana Devnet 浏览器：目标地址无入账

**结论：** CAW faucet 的 SOLDEV 代币领取功能不可靠。faucet API 接受请求但后端未真正提交到链上。

**方案：** 只使用 SETH（ETH Sepolia），已验证可用。SOLDEV 从 FaucetCard 中移除。

## 问题 4: 转账失败 - permission_check_failed

**状态：** 待解决
**根因：** 当前 Pact 没有 `can_transfer` 权限。CAW Pact 机制要求 Agent 必须有对应的权限才能执行操作。

**错误信息：**
- `required_permission: "can_transfer"`
- `suggestion: "you need an active pact to execute transfers, contract calls, or message-sign operations"`

**方案：** 创建包含 `can_transfer` 权限的新 Pact，激活后重试转账。参考 planv2.md 中的 Pact 配置。

## 问题 5: SSE 日志限制 100 条

**状态：** 保持现状
**原因：** 防止浏览器内存溢出，SSE 每 3 秒推一条
**方案：** 100 条是合理限制，如需更多可配合分页
