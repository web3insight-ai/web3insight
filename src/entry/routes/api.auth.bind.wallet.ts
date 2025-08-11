import { json, ActionFunction } from "@remix-run/node";
import { bindWallet } from "~/auth/repository";
import type { WalletBindRequest } from "~/auth/typing";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json() as WalletBindRequest;
    
    // Validate required fields
    if (!body.address || !body.magic || !body.signature) {
      return json(
        { error: "Missing required fields: address, magic, signature" },
        { status: 400 },
      );
    }
    
    // Validate address format (basic check for Ethereum address)
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.address)) {
      return json(
        { error: "Invalid wallet address format" },
        { status: 400 },
      );
    }
    
    const result = await bindWallet(body, request);
    
    if (!result.success) {
      return json(
        { error: result.message || "Failed to bind wallet" },
        { status: parseInt(result.code) || 500 },
      );
    }
    
    return json(result.data);
  } catch (error) {
    console.error("Wallet binding API error:", error);
    return json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
