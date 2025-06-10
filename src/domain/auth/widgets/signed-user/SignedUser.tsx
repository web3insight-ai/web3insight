import { Popover, PopoverContent, PopoverTrigger, Button, Avatar } from "@nextui-org/react";
import { LogIn, LogOut, User as UserIcon, Key, Shield } from "lucide-react";

import { isAdmin } from "../../helper";
import { signOut } from "../../repository";

import type { SignedUserProps } from "./typing";
import ActionItem from "./ActionItem";

function SignedUser({ user, onSignIn, onSignOut, onResetPassword }: SignedUserProps) {
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

    return (
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <Avatar
            name={firstLetter}
            size="sm"
            className="cursor-pointer"
            color="primary"
            isBordered
          />
        </PopoverTrigger>
        <PopoverContent className="p-0 rounded-lg shadow-md" style={{ width: "220px" }}>
          <div className="flex flex-col">
            {/* User info section */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
              <p className="font-medium text-sm">{user.username || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <ActionItem text="Profile" icon={UserIcon} action="/profile" />
              <ActionItem text="Change Password" icon={Key} renderType="button" action={() => onResetPassword()} />
            </div>

            {isAdmin(user) && (
              <div className="py-1 border-t border-gray-100">
                <ActionItem text="Manage" icon={Shield} action="/admin" />
              </div>
            )}

            {/* Logout section */}
            <div className="py-1 border-t border-gray-100">
              <ActionItem text="Logout" icon={LogOut} renderType="button" action={handleLogout} danger />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Button
      variant="flat"
      size="sm"
      color="primary"
      startContent={<LogIn size={16} />}
      onPress={() => onSignIn()}
    >
      Sign In
    </Button>
  );
}

export default SignedUser;
