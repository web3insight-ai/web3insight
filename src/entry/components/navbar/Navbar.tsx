import clsx from "clsx";
import { Link } from "@remix-run/react";
import { useMediaQuery } from "react-responsive";

import { getTitle } from "@/utils/app";
import BrandLogo from "@/components/control/brand-logo";

import SignedUserWidget from "~/auth/widgets/signed-user";

import type { NavbarProps } from "./typing";
import useSessionActions from "./useSessionActions";
import PrefersColorSchemeSelector from "./PrefersColorSchemeSelector";

function Navbar({ className, children, user, extra }: NavbarProps) {
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const { signIn, signOut, resetPassword } = useSessionActions();

  return (
    <div className={clsx("flex items-center w-full px-6 py-4", className)}>
      {/* Left side - Logo */}
      <div className="flex items-center gap-3 flex-1">
        <Link className="flex items-center gap-3 group" title="Back to home" href="/">
          <BrandLogo width={isDesktop ? 28 : 24} />
          {!isMobile && (
            <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
              {getTitle()}
            </span>
          )}
        </Link>
      </div>

      {/* Center - Navigation Menu */}
      <div className="flex items-center justify-center flex-1">
        {extra}
      </div>

      {/* Right side - User controls */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {children}
        <SignedUserWidget
          user={user}
          onSignIn={signIn}
          onSignOut={signOut}
          onResetPassword={resetPassword}
        />
        <PrefersColorSchemeSelector />
      </div>
    </div>
  );
}

export default Navbar;
