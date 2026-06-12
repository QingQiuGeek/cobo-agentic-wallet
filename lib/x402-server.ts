/**
 * x402 Payment Protocol Server Configuration
 *
 * Configures the x402 resource server for accepting payments on ETH Sepolia.
 * Uses @x402/next for Next.js native integration.
 * Payment token: SETH (ETH on Sepolia testnet)
 */

import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

// Facilitator client - validates and settles payments
// 4mica supports ETH Sepolia + native token payments
const facilitatorUrl = process.env.X402_FACILITATOR_URL || "https://x402.4mica.xyz";
const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });

// Network: ETH Sepolia testnet
const NETWORK = "eip155:11155111";

// Create resource server with EVM scheme
export const resourceServer = new x402ResourceServer(facilitatorClient)
  .register(NETWORK, new ExactEvmScheme());

// Payee address (CAW wallet address)
export const PAYEE_ADDRESS = process.env.X402_PAYEE_ADDRESS || process.env.NEXT_PUBLIC_AGENT_WALLET_ADDRESS || "";

// Default price in ETH (not USDC)
export const DEFAULT_PRICE = "0.0001"; // 0.0001 ETH per request

// Network identifier
export { NETWORK };
