import { Popover, PopoverContent, PopoverTrigger, Button, Avatar } from "@nextui-org/react";
import { Link } from "@remix-run/react";
import { LogIn, LogOut, User as UserIcon, Key } from "lucide-react";
import { useAtom } from "jotai";
import { authModalOpenAtom, authModalTypeAtom } from "~/atoms";

type UserData = {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AuthStatusProps = {
  user: UserData | null;
};

export default function AuthStatus({ user }: AuthStatusProps) {
  const [, setAuthModalOpen] = useAtom(authModalOpenAtom);
  const [, setAuthModalType] = useAtom(authModalTypeAtom);

  // Function to open auth modal with specified type
  const openAuthModal = (type: 'signin' | 'signup' | 'forgotPassword' | 'resetPassword') => {
    setAuthModalType(type);
    setAuthModalOpen(true);
  };

  // More robust check for user data
  if (user && typeof user === 'object' && user.id && user.username) {
    return (
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <Avatar
            name={user.username.substring(0, 1).toUpperCase()}
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
              <p className="font-medium text-sm">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <UserIcon size={15} className="mr-2 text-gray-500" />
                Profile
              </Link>

              <button
                onClick={() => openAuthModal('resetPassword')}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Key size={15} className="mr-2 text-gray-500" />
                Change Password
              </button>
            </div>

            {/* Logout section */}
            <div className="py-1 border-t border-gray-100">
              <Link
                to="/api/auth/logout"
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <LogOut size={15} className="mr-2" />
                Logout
              </Link>
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
      onPress={() => openAuthModal('signin')}
    >
      Sign In
    </Button>
  );
}