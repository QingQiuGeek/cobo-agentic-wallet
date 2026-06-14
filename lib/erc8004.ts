/**
 * ERC-8004 Agent Registration
 *
 * Registers the agent on-chain via CAW contractCall().
 * The Identity Registry contract mints an NFT representing the agent's identity.
 */

import { encodeFunctionData } from "viem";
import { contractCall, getCurrentWalletUuid } from "./caw";

// ERC-8004 Identity Registry ABI (minimal, only what we need)
const IDENTITY_REGISTRY_ABI = [
  {
    name: "mint",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenURI", type: "string" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
] as const;

// Contract address (same on all chains via CREATE2)
const IDENTITY_REGISTRY_ADDRESS = "0x8004A818BFB912233c491871b3d84c89A494BD9e";

// Chain ID for CAW (ETH Sepolia = SETH)
const CAW_CHAIN_ID = "SETH";

interface AgentMetadata {
  name: string;
  description: string;
  url?: string;
  image?: string;
  capabilities?: string[];
  endpoints?: {
    a2a?: string;
    mcp?: string;
  };
}

/**
 * Upload agent metadata to IPFS via Pinata
 */
export async function uploadMetadataToIPFS(metadata: AgentMetadata): Promise<string> {
  const pinataJwt = process.env.PINATA_JWT;
  if (!pinataJwt) {
    throw new Error("PINATA_JWT not configured");
  }

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pinataJwt}`,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `agent-${metadata.name}-${Date.now()}`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata upload failed: ${error}`);
  }

  const result = await response.json();
  return `ipfs://${result.IpfsHash}`;
}

/**
 * Register agent on ERC-8004 Identity Registry
 */
export async function registerAgent(params: {
  name: string;
  description: string;
  url?: string;
  capabilities?: string[];
  walletAddress: string;
}): Promise<{
  success: boolean;
  txHash?: string;
  ipfsHash?: string;
  explorerUrl?: string;
  ipfsUrl?: string;
  error?: string;
}> {
  try {
    console.log("[erc8004] Starting registration for:", params.name);

    // Step 1: Upload metadata to IPFS
    const metadata: AgentMetadata = {
      name: params.name,
      description: params.description,
      url: params.url,
      capabilities: params.capabilities || ["x402-payment", "balance-query", "transfer"],
      endpoints: {
        a2a: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/a2a`,
      },
    };

    console.log("[erc8004] Uploading metadata to IPFS...");
    const ipfsUri = await uploadMetadataToIPFS(metadata);
    console.log("[erc8004] IPFS URI:", ipfsUri);

    // Step 2: Encode mint calldata
    const calldata = encodeFunctionData({
      abi: IDENTITY_REGISTRY_ABI,
      functionName: "mint",
      args: [params.walletAddress as `0x${string}`, ipfsUri],
    });

    console.log("[erc8004] Encoded calldata:", calldata);

    // Step 3: Call contract via CAW
    const walletUuid = getCurrentWalletUuid();
    console.log("[erc8004] Calling contract via CAW wallet:", walletUuid);

    const result = await contractCall({
      chainId: CAW_CHAIN_ID,
      contractAddr: IDENTITY_REGISTRY_ADDRESS,
      calldata: calldata,
      value: "0",
      requestId: `erc8004-${Date.now()}`,
    });

    console.log("[erc8004] Contract call result:", JSON.stringify(result).slice(0, 300));

    const txHash = result?.result?.transaction_hash || result?.result?.id || "";
    const ipfsHash = ipfsUri.replace("ipfs://", "");

    return {
      success: true,
      txHash,
      ipfsHash,
      explorerUrl: `https://sepolia.etherscan.io/tx/${txHash}`,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    };
  } catch (error: any) {
    console.error("[erc8004] Registration failed:", error?.response?.data || error?.message || error);
    return {
      success: false,
      error: error?.response?.data?.message || error?.message || "Registration failed",
    };
  }
}
