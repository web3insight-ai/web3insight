import { Popover, PopoverContent, PopoverTrigger, Button, Avatar } from "@nextui-org/react";
import { Link, useNavigate, useOutletContext } from "@remix-run/react";
import { LogIn, LogOut, User as UserIcon, Key } from "lucide-react";
import { useAtom } from "jotai";
import { authModalOpenAtom, authModalTypeAtom } from "#/atoms";
import type { StrapiUser } from "#/services/auth/strapi.server";

type AuthStatusProps = {
  user: StrapiUser | null;
};

type AuthContext = {
  user: StrapiUser | null;
  setUser: (user: StrapiUser | null) => void;
};

export default function AuthStatus({ user }: AuthStatusProps) {
  const [, setAuthModalOpen] = useAtom(authModalOpenAtom);
  const [, setAuthModalType] = useAtom(authModalTypeAtom);
  const navigate = useNavigate();
  const { setUser } = useOutletContext<AuthContext>();

  // Function to open auth modal with specified type
  const openAuthModal = (type: 'signin' | 'signup' | 'forgotPassword' | 'resetPassword') => {
    setAuthModalType(type);
    setAuthModalOpen(true);
  };

  // Function to handle client-side logout
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientSide: true }),
      });

      if (response.ok) {
        // Immediately update the UI
        setUser(null);
        // Navigate to home page
        navigate('/', { replace: true });
      } else {
        console.error('Logout failed');
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
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <LogOut size={15} className="mr-2" />
                Logout
              </button>
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
