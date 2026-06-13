/**
 * Cobo Agentic Wallet (CAW) Service Layer
 *
 * Wraps the @cobo/agentic-wallet SDK into a clean service interface.
 * All CAW operations go through this module.
 *
 * 钱包 UUID 动态管理：初始从 .env 读取，用户切换钱包后更新。
 */

import {
  Configuration,
  WalletsApi,
  BalanceApi,
  TransactionsApi,
  TransactionRecordsApi,
  PactsApi,
  FaucetApi,
  AuditApi,
  IdentityApi,
  MetadataApi,
} from "@cobo/agentic-wallet";

// Configuration from environment
const config = new Configuration({
  apiKey: process.env.AGENT_WALLET_API_KEY,
  basePath: process.env.AGENT_WALLET_API_URL || "https://agentic-wallet.cobo.com",
});

// API instances
export const walletsApi = new WalletsApi(config);
export const balanceApi = new BalanceApi(config);
export const transactionsApi = new TransactionsApi(config);
export const transactionRecordsApi = new TransactionRecordsApi(config);
export const pactsApi = new PactsApi(config);
export const faucetApi = new FaucetApi(config);
export const auditApi = new AuditApi(config);
export const identityApi = new IdentityApi(config);
export const metadataApi = new MetadataApi(config);

// Dynamic wallet UUID - initial from env, updated on wallet switch
let currentWalletUuid = process.env.AGENT_WALLET_WALLET_ID || "";

export function getCurrentWalletUuid() {
  return currentWalletUuid;
}

export function setCurrentWalletUuid(uuid: string) {
  currentWalletUuid = uuid;
}

// ============================================================
// Wallet Operations
// ============================================================

export async function getWalletInfo(walletUuid?: string) {
  const uuid = walletUuid || currentWalletUuid;
  const response = await walletsApi.getWallet(uuid);
  return response.data;
}

export async function listWallets(limit = 50) {
  const response = await walletsApi.listWallets(undefined, undefined, 0, limit);
  return response.data;
}

export async function createWalletAddress(chainId: string, walletUuid?: string) {
  const uuid = walletUuid || currentWalletUuid;
  const response = await walletsApi.createWalletAddress(uuid, {
    chain_id: chainId,
  });
  return response.data;
}

export async function listWalletAddresses(walletUuid?: string) {
  const uuid = walletUuid || currentWalletUuid;
  const response = await walletsApi.listWalletAddresses(uuid);
  return response.data;
}

// ============================================================
// Balance Operations
// ============================================================

export async function getBalances(walletUuid?: string) {
  const uuid = walletUuid || currentWalletUuid;
  const response = await balanceApi.listBalances(uuid);
  return response.data;
}

export async function getBalanceForToken(tokenId: string, walletUuid?: string) {
  const uuid = walletUuid || currentWalletUuid;
  const response = await balanceApi.listBalances(uuid, undefined, undefined, tokenId);
  return response.data;
}

// ============================================================
// Transaction Operations
// ============================================================

export async function transferTokens(params: {
  tokenId: string;
  dstAddr: string;
  amount: string;
  requestId?: string;
  walletUuid?: string;
}) {
  const uuid = params.walletUuid || currentWalletUuid;
  const response = await transactionsApi.transferTokens(uuid, {
    token_id: params.tokenId,
    dst_addr: params.dstAddr,
    amount: params.amount,
    request_id: params.requestId || `tx-${Date.now()}`,
  });
  return response.data;
}

export async function contractCall(params: {
  chainId: string;
  contractAddr: string;
  calldata: string;
  value?: string;
  requestId?: string;
  walletUuid?: string;
}) {
  const uuid = params.walletUuid || currentWalletUuid;
  const response = await transactionsApi.contractCall(uuid, {
    chain_id: params.chainId,
    contract_addr: params.contractAddr,
    calldata: params.calldata,
    value: params.value || "0",
    request_id: params.requestId || `call-${Date.now()}`,
  });
  return response.data;
}

export async function estimateTransferFee(params: {
  tokenId: string;
  dstAddr: string;
  amount: string;
  walletUuid?: string;
}) {
  const uuid = params.walletUuid || currentWalletUuid;
  const response = await transactionsApi.estimateTransferFee(uuid, {
    token_id: params.tokenId,
    dst_addr: params.dstAddr,
    amount: params.amount,
  });
  return response.data;
}

// ============================================================
// x402 Payment（CAW 原生支持，无需 @x402/fetch）
// ============================================================

export async function payX402(challenge: Record<string, unknown>, walletUuid?: string) {
  const uuid = walletUuid || currentWalletUuid;
  const response = await transactionsApi.payment(uuid, {
    protocol: "x402",
    x402_payment_required: Buffer.from(JSON.stringify(challenge)).toString("base64"),
    request_id: `x402-${Date.now()}`,
  });
  return response.data;
}

// ============================================================
// Transaction Records
// ============================================================

export async function getTransactionRecords(limit = 20, walletUuid?: string) {
  const uuid = walletUuid || currentWalletUuid;
  const response = await transactionRecordsApi.listUserTransactions(
    uuid, undefined, undefined, undefined, limit
  );
  return response.data;
}

export async function getTransactionByRequestId(requestId: string, walletUuid?: string) {
  const uuid = walletUuid || currentWalletUuid;
  const response = await transactionRecordsApi.getUserTransactionByRequestId(uuid, requestId);
  return response.data;
}

// ============================================================
// Pact Operations
// ============================================================

export async function submitPact(params: {
  intent: string;
  policies: Array<{
    name: string;
    type: "transfer" | "contract_call" | "message_sign";
    rules: Record<string, unknown>;
  }>;
  completionConditions?: Array<{
    type: "time_elapsed" | "tx_count" | "amount_spent" | "amount_spent_usd" | "manual";
    threshold?: string;
  }>;
  walletUuid?: string;
}) {
  const uuid = params.walletUuid || currentWalletUuid;
  const response = await pactsApi.submitPact({
    wallet_id: uuid,
    intent: params.intent,
    spec: {
      policies: params.policies,
      completion_conditions: params.completionConditions || [
        { type: "time_elapsed", threshold: "86400" },
      ],
    },
  });
  return response.data;
}

export async function getPact(pactId: string) {
  const response = await pactsApi.getPact(pactId);
  return response.data;
}

export async function listPacts(walletUuid?: string) {
  const uuid = walletUuid || currentWalletUuid;
  const response = await pactsApi.listPacts(undefined, uuid);
  return response.data;
}

// ============================================================
// Faucet Operations
// ============================================================

export async function requestFaucetTokens(tokenId: string, address: string) {
  const response = await faucetApi.deposit({
    token_id: tokenId,
    address: address,
  });
  return response.data;
}

export async function listFaucetTokens() {
  const response = await faucetApi.listTokens();
  return response.data;
}

// ============================================================
// Audit Operations
// ============================================================

export async function getAuditLogs(limit = 20, walletUuid?: string) {
  const uuid = walletUuid || currentWalletUuid;
  const response = await auditApi.listAuditLogs(
    uuid, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, undefined, limit
  );
  return response.data;
}

// ============================================================
// Metadata Operations
// ============================================================

export async function listSupportedChains() {
  const response = await metadataApi.listChains();
  return response.data;
}

export async function searchTokens(symbol: string) {
  const response = await metadataApi.searchTokens(symbol);
  return response.data;
}

// ============================================================
// Identity Operations
// ============================================================

export async function getAgentStatus(agentId: string) {
  const response = await identityApi.getAgentStatus(agentId);
  return response.data;
}

// ============================================================
// Wallet Pairing
// ============================================================

export async function initiateWalletPair(walletUuid?: string) {
  const uuid = walletUuid || currentWalletUuid;
  const response = await walletsApi.initiateWalletPair({
    wallet_id: uuid,
  });
  return response.data;
}

export async function confirmWalletPair(token: string) {
  const response = await walletsApi.confirmWalletPair({
    token,
  });
  return response.data;
}

export async function getPairInfoByWallet(walletUuid?: string) {
  const uuid = walletUuid || currentWalletUuid;
  const response = await walletsApi.getPairInfoByWallet(uuid);
  return response.data;
}
