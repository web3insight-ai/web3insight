import { Popover, PopoverContent, PopoverTrigger, Avatar } from "@nextui-org/react";
import { LogIn, LogOut, User as UserIcon, Settings, Warehouse, Calendar } from "lucide-react";

import { canManageEcosystems, canManageEvents, isAdmin } from "../../helper";
import { signOut } from "../../repository";

import type { SignedUserProps } from "./typing";
import ActionItem from "./ActionItem";

function SignedUser({ user, onSignIn, onSignOut }: SignedUserProps) {
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      const res = await signOut();

      if (res.success) {
        onSignOut(null);
      } else {
        console.error(`Logout failed: ${res.message}`);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // More robust check for user data
  if (user && typeof user === 'object' && user.id) {
    const firstLetter = user.username ? user.username.substring(0, 1).toUpperCase() : '?';
    const avatarUrl = user.avatar_url || '';

    return (
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <Avatar
            src={avatarUrl}
            name={avatarUrl ? undefined : firstLetter}
            size="sm"
            className="cursor-pointer"
            color="primary"
            isBordered
          />
        </PopoverTrigger>
        <PopoverContent className="p-0 rounded-lg bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark" style={{ width: "220px" }}>
          <div className="flex flex-col">
            {/* User info section */}
            <div className="px-4 py-3 border-b border-border dark:border-border-dark bg-gray-50 dark:bg-surface-elevated rounded-t-lg">
              <p className="font-medium text-sm text-gray-900 dark:text-white">{user.username || 'User'}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.email || ''}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <ActionItem text="Profile" icon={UserIcon} action="/profile" />
            </div>

            {(canManageEcosystems(user) || canManageEvents(user)) && (
              <div className="py-1 border-t border-border dark:border-border-dark">
                <ActionItem 
                  text="Ecosystems" 
                  icon={Warehouse} 
                  action="/admin"
                  disabled={!canManageEcosystems(user)}
                />
                <ActionItem 
                  text="Events" 
                  icon={Calendar} 
                  action="/admin/events"
                  disabled={!canManageEvents(user)}
                />
                {isAdmin(user) && (
                  <ActionItem text="Settings" icon={Settings} action="/settings" />
                )}
              </div>
            )}

            {/* Logout section */}
            <div className="py-1 border-t border-border dark:border-border-dark">
              <ActionItem text="Logout" icon={LogOut} renderType="button" action={handleLogout} danger />
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
