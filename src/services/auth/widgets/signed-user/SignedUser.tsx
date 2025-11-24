'use client';

import { Avatar, Popover, PopoverTrigger, PopoverContent, Button } from "@nextui-org/react";
import { LogIn, LogOut, User, Shield, Layers, Calendar } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import type { SignedUserProps } from "./typing";
import type { ApiUser } from "../../typing";
import ActionItem from "./ActionItem";
import { canManageEcosystems, canManageEvents } from "../../helper";

function SignedUser({ onSignIn }: SignedUserProps) {
  const { ready, authenticated, user: privyUser, logout } = usePrivy();
  const router = useRouter();
  const [backendUser, setBackendUser] = useState<ApiUser | null>(null);

  // Fetch backend user data
  useEffect(() => {
    if (!authenticated) {
      setBackendUser(null);
      return;
    }

    // Fetch user data from backend
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setBackendUser(data.data);
        }
      })
      .catch(() => {
        // Silent error handling
      });
  }, [authenticated]);

  // Only show if Privy is authenticated
  const isPrivyAuthenticated = ready && authenticated && privyUser;

  if (isPrivyAuthenticated) {
    // Use Privy user data for display
    const displayName = privyUser.email?.address || privyUser.wallet?.address || 'User';
    const firstLetter = displayName.substring(0, 1).toUpperCase();

    // Check user roles from backend
    const isAdmin = backendUser?.role?.allowed_roles?.includes('admin') || false;
    const canManageEco = canManageEcosystems(backendUser);
    const canManageEvt = canManageEvents(backendUser);

    const handleLogout = async () => {
      try {
        // Logout from Privy
        await logout();

        // Clear backend session
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Redirect and refresh
        router.push('/');
        router.refresh();
      } catch (error) {
        // Still redirect even if there's an error
        router.push('/');
        router.refresh();
      }
    };

    return (
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <Avatar
            src={backendUser?.avatar_url}
            name={firstLetter}
            size="sm"
            className="cursor-pointer"
            color="primary"
            isBordered
            as="button"
          />
        </PopoverTrigger>
        <PopoverContent className="p-0 rounded-lg bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark" style={{ width: "240px" }}>
          <div className="flex flex-col">
            {/* User info section */}
            <div className="px-4 py-3 border-b border-border dark:border-border-dark bg-gray-50 dark:bg-surface-elevated rounded-t-lg">
              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                {backendUser?.username || displayName}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                {displayName}
              </p>
              {backendUser?.role && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-surface-dark rounded-md text-xs">
                  <Shield size={12} className="text-primary" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {backendUser.role.default_role}
                  </span>
                </div>
              )}
            </div>

            {/* Menu items */}
            <div className="py-2">
              <ActionItem
                text="Profile"
                icon={User}
                action="/profile"
                renderType="link"
              />

              {canManageEco && (
                <ActionItem
                  text="Ecosystem Manager"
                  icon={Layers}
                  action="/admin/ecosystems"
                  renderType="link"
                />
              )}

              {canManageEvt && (
                <ActionItem
                  text="Event Manager"
                  icon={Calendar}
                  action="/admin/events"
                  renderType="link"
                />
              )}

              {isAdmin && (
                <ActionItem
                  text="Admin Panel"
                  icon={Shield}
                  action="/admin"
                  renderType="link"
                />
              )}
            </div>

            {/* Logout button */}
            <div className="p-2 border-t border-border dark:border-border-dark">
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
