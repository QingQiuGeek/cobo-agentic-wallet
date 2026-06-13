/**
 * x402 Payment Protocol Server Configuration
 *
 * Configures the x402 resource server for accepting payments on ETH Sepolia.
 * Uses @x402/next for Next.js native integration.
 * Payment token: ETH (SETH on Cobo)
 *
 * x402 收款地址 = CAW 钱包地址（延迟初始化，首次请求时从 CAW API 查询）
 */

import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

// Facilitator client - validates and settles payments
// 4mica supports ETH Sepolia
const facilitatorUrl = process.env.X402_FACILITATOR_URL || "https://x402.4mica.xyz";
const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });

// Network: ETH Sepolia testnet (eip155:11155111)
const NETWORK = "eip155:11155111";

// Create resource server with EVM scheme
export const resourceServer = new x402ResourceServer(facilitatorClient)
  .register(NETWORK, new ExactEvmScheme());

// Payee address = CAW wallet address（延迟初始化）
export let PAYEE_ADDRESS = process.env.X402_PAYEE_ADDRESS || "";

export async function initPayeeAddress(): Promise<void> {
  if (PAYEE_ADDRESS) return;
  try {
    const { walletsApi } = await import("./caw");
    const walletsResp = await walletsApi.listWallets();
    const walletList = walletsResp.data.result;
    if (walletList.length > 0) {
      const addressesResp = await walletsApi.listWalletAddresses(walletList[0].uuid);
      const addrList = addressesResp.data.result;
      PAYEE_ADDRESS = addrList?.[0]?.address || "";
    }
  } catch (e) {
    console.error("[x402] Failed to get payee address from CAW:", e);
  }
}

// Default price in ETH
export const DEFAULT_PRICE = "0.0001"; // 0.0001 ETH per request

// Network identifier
export { NETWORK };
