import { Link } from "@remix-run/react";
import { useMediaQuery } from "react-responsive";

import { getTitle } from "@/utils/app";
import BrandLogo from "@/components/control/brand-logo";

import type { NavToolbarProps } from "./typing";
import SearchHistory from "./SearchHistory";
import AuthStatus from "./AuthStatus";

function NavToolbar({ history, user }: NavToolbarProps) {
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isMobile = useMediaQuery({ maxWidth: 767 });

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
        <SearchHistory
          history={history}
          placeholder={user ? "Your search history will appear here" : "Sign in to save your search history"}
        />
        <AuthStatus user={user} />
      </div>
    </div>
  );
}

export default NavToolbar;
