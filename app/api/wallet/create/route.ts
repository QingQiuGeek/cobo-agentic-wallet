import { NextRequest, NextResponse } from "next/server";
import { walletsApi, setCurrentWalletUuid } from "@/lib/caw";

// POST /api/wallet/create - Create a new wallet (with async polling)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name = "CoboAgent" } = body;

    console.log("[/api/wallet/create] Starting wallet creation:", name);

    // Step 0: Check for existing wallets that are still preparing
    try {
      const existingWallets = await walletsApi.listWallets(undefined, undefined, 0, 50);
      const wallets = existingWallets.data.result || [];

      // Find a wallet that's still preparing
      const preparingWallet = wallets.find((w: any) => w.status === "preparing");
      if (preparingWallet) {
        console.log("[/api/wallet/create] Found existing wallet in 'preparing' status:", preparingWallet.uuid);
        console.log("[/api/wallet/create] Waiting for it to become active...");

        const activeWallet = await waitForWalletActive(preparingWallet.uuid, 120);
        if (activeWallet) {
          setCurrentWalletUuid(preparingWallet.uuid);
          return NextResponse.json({
            success: true,
            wallet: {
              uuid: preparingWallet.uuid,
              name: preparingWallet.name,
              status: "active",
            },
            message: "Using existing wallet that was still preparing",
          });
        }
      }

      // Find an existing active wallet
      const activeWallet = wallets.find((w: any) => w.status === "active");
      if (activeWallet) {
        console.log("[/api/wallet/create] Found existing active wallet:", activeWallet.uuid);
        setCurrentWalletUuid(activeWallet.uuid);
        return NextResponse.json({
          success: true,
          wallet: {
            uuid: activeWallet.uuid,
            name: activeWallet.name,
            status: "active",
          },
          message: "Using existing active wallet",
        });
      }
    } catch (e: any) {
      console.warn("[/api/wallet/create] Error checking existing wallets:", e?.message);
    }

    // Step 1: Create MPC wallet
    console.log("[/api/wallet/create] Creating new wallet...");
    const walletResp = await walletsApi.createWallet({
      wallet_type: "MPC",
      name: name,
      main_node_id: process.env.AGENT_MAIN_NODE_ID || "",
    });

    const wallet = walletResp.data.result;
    const walletUuid = wallet.uuid;
    console.log("[/api/wallet/create] Wallet created, UUID:", walletUuid, "Status:", wallet.status);

    // Step 2: Wait for wallet to become active
    const activeWallet = await waitForWalletActive(walletUuid, 120);

    if (!activeWallet) {
      return NextResponse.json({
        success: false,
        error: `Wallet creation timed out. Status: preparing. UUID: ${walletUuid}`,
        walletUuid: walletUuid,
      }, { status: 408 });
    }

    console.log("[/api/wallet/create] Wallet is active!");

    // Step 3: Create address
    const addressResp = await walletsApi.createWalletAddress(walletUuid, {
      chain_id: "SETH",
    });

    const addrResult = addressResp.data.result as any;
    const addressList = Array.isArray(addrResult) ? addrResult : addrResult?.items || [];
    const evmAddress = addressList.find((a: any) => a.address?.startsWith('0x'))?.address
      || addressList[0]?.address
      || "";

    console.log("[/api/wallet/create] Address created:", evmAddress);

    // Step 4: Set as current wallet
    setCurrentWalletUuid(walletUuid);

    return NextResponse.json({
      success: true,
      wallet: {
        uuid: walletUuid,
        name: wallet.name,
        status: "active",
        evmAddress: evmAddress,
      },
    });
  } catch (error: any) {
    console.error("[/api/wallet/create] Error:", error?.response?.data || error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: error?.response?.data?.error?.reason || error?.response?.data?.message || error?.message || "Unknown error",
        details: error?.response?.data,
      },
      { status: error?.response?.status || 500 }
    );
  }
}

// Helper: Poll wallet status until it becomes active
async function waitForWalletActive(walletUuid: string, maxSeconds: number) {
  const maxAttempts = Math.floor(maxSeconds / 3);
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3s

    try {
      const statusResp = await walletsApi.getWallet(walletUuid);
      const status = statusResp.data.result.status;
      console.log(`[waitForWalletActive] Attempt ${i + 1}/${maxAttempts}: status = ${status}`);

      if (status === "active") {
        return statusResp.data.result;
      }

      if (status === "archived") {
        console.error(`[waitForWalletActive] Wallet archived with status: ${status}`);
        return null;
      }
    } catch (e: any) {
      console.warn("[waitForWalletActive] Status check failed:", e?.message);
    }
  }
  return null;
}
