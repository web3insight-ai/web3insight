import "server-only";

import { createHmac, randomBytes } from "node:crypto";

// Reason: Prefix lets the MCP route distinguish manually-issued bearer tokens
// from any other auth scheme we add later (e.g. OAuth bridges) without parsing
// the token body.
export const MCP_TOKEN_PREFIX = "w3i_mcp_";

export function createMcpBearerToken(): string {
  return `${MCP_TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;
}

export function isGeneratedMcpBearerToken(token: string): boolean {
  return token.startsWith(MCP_TOKEN_PREFIX);
}

export function hashMcpBearerToken(token: string): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET must be set for MCP bearer tokens");
  }

  return createHmac("sha256", secret).update(token, "utf8").digest("hex");
}

export function tokenPreview(token: string): string {
  return `${token.slice(0, 18)}...`;
}
