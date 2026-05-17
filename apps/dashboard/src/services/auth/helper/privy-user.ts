import type { User as PrivyUser } from "@privy-io/react-auth";

export interface UserDisplayInfo {
  displayName: string;
  avatarUrl: string | undefined;
  primaryAccount: string;
  accountType: "github" | "google" | "email" | "wallet" | "unknown";
}

/**
 * Extract display information from Privy user based on login method priority:
 * 1. GitHub OAuth (username + avatar)
 * 2. Google OAuth (email + avatar)
 * 3. Email (address)
 * 4. Wallet (address)
 */
export function getPrivyUserDisplayInfo(
  privyUser: PrivyUser | null | undefined,
): UserDisplayInfo {
  if (!privyUser || !privyUser.linkedAccounts) {
    return {
      displayName: "User",
      avatarUrl: undefined,
      primaryAccount: "",
      accountType: "unknown",
    };
  }

  const { linkedAccounts } = privyUser;

  // Priority 1: GitHub OAuth
  const githubAccount = linkedAccounts.find((acc) => acc.type === "github_oauth");
  if (githubAccount) {
    const username = githubAccount.username || "GitHub User";
    return {
      displayName: username,
      avatarUrl: `https://github.com/${username}.png`,
      primaryAccount: username,
      accountType: "github",
    };
  }

  // Priority 2: Google OAuth
  const googleAccount = linkedAccounts.find((acc) => acc.type === "google_oauth");
  if (googleAccount && googleAccount.email) {
    const name = googleAccount.name || googleAccount.email.split("@")[0];
    return {
      displayName: name,
      avatarUrl: undefined, // Google doesn't provide avatar URL directly
      primaryAccount: googleAccount.email,
      accountType: "google",
    };
  }

  // Priority 3: Email
  const emailAccount = linkedAccounts.find((acc) => acc.type === "email");
  if (emailAccount && emailAccount.address) {
    const name = emailAccount.address.split("@")[0];
    return {
      displayName: name,
      avatarUrl: undefined,
      primaryAccount: emailAccount.address,
      accountType: "email",
    };
  }

  // Priority 4: Wallet
  const walletAccount = linkedAccounts.find((acc) => acc.type === "wallet");
  if (walletAccount && walletAccount.address) {
    const shortAddress = `${walletAccount.address.slice(0, 6)}...${walletAccount.address.slice(-4)}`;
    return {
      displayName: shortAddress,
      avatarUrl: undefined,
      primaryAccount: walletAccount.address,
      accountType: "wallet",
    };
  }

  return {
    displayName: "User",
    avatarUrl: undefined,
    primaryAccount: "",
    accountType: "unknown",
  };
}

