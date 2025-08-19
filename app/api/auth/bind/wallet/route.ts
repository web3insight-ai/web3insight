import { bindWallet } from "~/auth/repository";
import type { WalletBindRequest } from "~/auth/typing";

export async function POST(request: Request) {
  try {
    const body = await request.json() as WalletBindRequest;

    // Validate required fields
    if (!body.address || !body.magic || !body.signature) {
      return Response.json(
        { error: "Missing required fields: address, magic, signature" },
        { status: 400 }
      );
    }

    // Validate address format (basic check for Ethereum address)
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.address)) {
      return Response.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    const result = await bindWallet(body, request);

    if (!result.success) {
      return Response.json(
        { error: result.message || "Failed to bind wallet" },
        { status: parseInt(result.code) || 500 }
      );
    }

    return Response.json(result.data);
  } catch (error) {
    console.error("Wallet binding API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
