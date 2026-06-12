/**
 * Cobo Agentic Wallet (CAW) Service Layer
 *
 * Wraps the @cobo/agentic-wallet SDK into a clean service interface.
 * All CAW operations go through this module.
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
const walletsApi = new WalletsApi(config);
const balanceApi = new BalanceApi(config);
const transactionsApi = new TransactionsApi(config);
const transactionRecordsApi = new TransactionRecordsApi(config);
const pactsApi = new PactsApi(config);
const faucetApi = new FaucetApi(config);
const auditApi = new AuditApi(config);
const identityApi = new IdentityApi(config);
const metadataApi = new MetadataApi(config);

// Wallet ID from env
const WALLET_ID = process.env.AGENT_WALLET_WALLET_ID || "";

// ============================================================
// Wallet Operations
// ============================================================

export async function getWalletInfo() {
  const response = await walletsApi.getWallet(WALLET_ID);
  return response.data;
}

export async function listWallets() {
  const response = await walletsApi.listWallets();
  return response.data;
}

export async function createWalletAddress(chainId: string) {
  const response = await walletsApi.createWalletAddress(WALLET_ID, {
    chain_id: chainId,
  });
  return response.data;
}

// ============================================================
// Balance Operations
// ============================================================

export async function getBalances() {
  const response = await balanceApi.listBalances(WALLET_ID);
  return response.data;
}

export async function getBalanceForToken(tokenId: string) {
  const response = await balanceApi.listBalances(WALLET_ID, undefined, undefined, tokenId);
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
}) {
  const response = await transactionsApi.transferTokens(WALLET_ID, {
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
}) {
  const response = await transactionsApi.contractCall(WALLET_ID, {
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
}) {
  const response = await transactionsApi.estimateTransferFee(WALLET_ID, {
    token_id: params.tokenId,
    dst_addr: params.dstAddr,
    amount: params.amount,
  });
  return response.data;
}

// ============================================================
// x402 Payment
// ============================================================

export async function payX402(challenge: Record<string, unknown>) {
  const response = await transactionsApi.payment(WALLET_ID, {
    protocol: "x402",
    x402_payment_required: Buffer.from(JSON.stringify(challenge)).toString("base64"),
    request_id: `x402-${Date.now()}`,
  });
  return response.data;
}

// ============================================================
// Transaction Records
// ============================================================

export async function getTransactionRecords(limit = 20) {
  const response = await transactionRecordsApi.listUserTransactions(WALLET_ID, undefined, undefined, undefined, limit);
  return response.data;
}

export async function getTransactionByRequestId(requestId: string) {
  const response = await transactionRecordsApi.getUserTransactionByRequestId(WALLET_ID, requestId);
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
}) {
  const response = await pactsApi.submitPact({
    wallet_id: WALLET_ID,
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

export async function listPacts() {
  const response = await pactsApi.listPacts();
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

export async function getAuditLogs(limit = 20) {
  const response = await auditApi.listAuditLogs(
    WALLET_ID, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, limit
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

export async function initiateWalletPair() {
  const response = await walletsApi.initiateWalletPair({
    wallet_id: WALLET_ID,
  });
  return response.data;
}

export async function confirmWalletPair(token: string) {
  const response = await walletsApi.confirmWalletPair({
    token,
  });
  return response.data;
}

// ============================================================
// Export all API instances for advanced usage
// ============================================================

export {
  walletsApi,
  balanceApi,
  transactionsApi,
  transactionRecordsApi,
  pactsApi,
  faucetApi,
  auditApi,
  identityApi,
  metadataApi,
  config,
  WALLET_ID,
};
