/**
 * x402 Payment Protocol Server Configuration
 *
 * Configures the x402 resource server for accepting payments.
 * Uses @x402/next for Next.js native integration.
 */

import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

// Facilitator client - validates and settles payments
const facilitatorUrl = process.env.X402_FACILITATOR_URL || "https://facilitator.payai.network";
const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });

// Network: Base Sepolia testnet
const NETWORK = "eip155:84532";

// Create resource server with EVM scheme
export const resourceServer = new x402ResourceServer(facilitatorClient)
  .register(NETWORK, new ExactEvmScheme());

// Payee address (CAW wallet address)
export const PAYEE_ADDRESS = process.env.X402_PAYEE_ADDRESS || process.env.AGENT_WALLET_ADDRESS || "";

// Default price
export const DEFAULT_PRICE = process.env.X402_PRICE || "$0.001";

// Network identifier
export { NETWORK };
