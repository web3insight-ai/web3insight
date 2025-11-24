'use client';

import { Avatar, Popover, PopoverTrigger, PopoverContent, Button } from "@nextui-org/react";
import { LogIn, LogOut } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

import type { SignedUserProps } from "./typing";

function SignedUser({ onSignIn }: SignedUserProps) {
  const { ready, authenticated, user: privyUser, logout } = usePrivy();
  const router = useRouter();

  // Only show if Privy is authenticated
  const isPrivyAuthenticated = ready && authenticated && privyUser;

  if (isPrivyAuthenticated) {
    // Use Privy user data
    const displayName = privyUser.email?.address || privyUser.wallet?.address || 'User';
    const firstLetter = displayName.substring(0, 1).toUpperCase();

    const handleLogout = async () => {
      await logout();
      router.push('/');
      router.refresh();
    };

    return (
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <Avatar
            name={firstLetter}
            size="sm"
            className="cursor-pointer"
            color="primary"
            isBordered
            as="button"
          />
        </PopoverTrigger>
        <PopoverContent className="p-0 rounded-lg bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark" style={{ width: "220px" }}>
          <div className="flex flex-col">
            {/* User info section */}
            <div className="px-4 py-3 border-b border-border dark:border-border-dark bg-gray-50 dark:bg-surface-elevated rounded-t-lg">
              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{displayName}</p>
              <p className="text-xs text-primary mt-1">Via Privy</p>
            </div>

            {/* Logout button */}
            <div className="p-2">
              <Button
                fullWidth
                size="sm"
                color="danger"
                variant="flat"
                startContent={<LogOut size={16} />}
                onPress={handleLogout}
                className="justify-start"
              >
                Logout
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <button
      onClick={() => onSignIn()}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
    >
      <LogIn size={16} />
      Sign In
    </button>
  );
}

export default SignedUser;
