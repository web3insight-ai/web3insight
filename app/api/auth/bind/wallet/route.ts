import { NextRequest, NextResponse } from 'next/server';
import { bindWallet } from '~/auth/repository';
import type { WalletBindRequest } from '~/auth/typing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WalletBindRequest;

    // Validate required fields
    if (!body.address || !body.magic || !body.signature) {
      return NextResponse.json(
        { error: "Missing required fields: address, magic, signature" },
        { status: 400 },
      );
    }

    // Validate address format (basic check for Ethereum address)
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.address)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 },
      );
    }

    const result = await bindWallet(body, request);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to bind wallet" },
        { status: parseInt(result.code) || 500 },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Wallet binding API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
