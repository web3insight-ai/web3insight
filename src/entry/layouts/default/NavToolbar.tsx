import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Divider,
} from "@nextui-org/react";
import { Link } from "@remix-run/react";
import { History } from "lucide-react";
import BrandLogo from "@/components/control/brand-logo";
import { useMediaQuery } from "react-responsive";
import AuthStatus from "./AuthStatus";
import type { StrapiUser } from "@/types";
import { useEffect, useState, useMemo } from "react";

import { getTitle } from "@/utils/app";

type NavToolbarProps = {
  history: {
    query: string;
    id: string;
    documentId: string;
  }[];
  user: StrapiUser | null;
};

function NavToolbar({ history, user }: NavToolbarProps) {
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [isOpen, setIsOpen] = useState(false);

  // Deduplicate history items based on documentId
  const uniqueHistory = useMemo(() => {
    const seen = new Set();
    return history.filter(item => {
      const key = item.documentId || item.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [history]);

  useEffect(() => {
    console.log('NavToolbar received history:', history);
    console.log('NavToolbar deduplicated history:', uniqueHistory);
  }, [history, uniqueHistory]);

  return (
    <div className="flex items-center justify-between w-full px-4 py-2 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
      {/* Logo on the left side */}
      <Link to="/" className="flex items-center gap-2">
        <BrandLogo width={isDesktop ? 32 : 24} />
        {!isMobile && (
          <span className="text-sm font-bold text-gray-800">
            {getTitle()}
          </span>
        )}
      </Link>

      {/* Right-side controls */}
      <div className="flex items-center gap-4">
        {/* Recent searches popover */}
        <Popover
          placement="bottom-end"
          isOpen={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (open) {
              console.log('Popover opened with history:', uniqueHistory);
            }
          }}
        >
          <PopoverTrigger>
            <Button
              variant="light"
              size="sm"
              startContent={<History size={16} />}
              className="text-gray-500"
            >
              Recent
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-900 mb-2">
                Recent Searches
              </div>
              <Divider className="my-2" />
              {(!uniqueHistory || uniqueHistory.length === 0) ? (
                <div className="text-center py-3">
                  <p className="text-sm text-gray-500 mb-2">No recent searches</p>
                  {user ? (
                    <p className="text-xs text-gray-400">Your search history will appear here</p>
                  ) : (
                    <p className="text-xs text-gray-400">Sign in to save your search history</p>
                  )}
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {uniqueHistory.map((item, index) => (
                    <Link
                      key={`${item.documentId || item.id}-${index}`}
                      to={`/query/${item.documentId || item.id}`}
                      className="block p-2 text-sm text-gray-600 hover:bg-gray-100 rounded my-1 truncate"
                      onClick={() => {
                        console.log('Clicked on history item:', item);
                        setIsOpen(false);
                      }}
                    >
                      {item.query}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Auth status component */}
        <AuthStatus user={user} />
      </div>
    </div>
  );
}

export default NavToolbar;
