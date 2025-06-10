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
    <div className={clsx("flex items-center justify-between w-full px-4 py-2 sm:px-6 lg:px-8", className)}>
      <div className="flex item-center gap-4">
        <Link className="flex items-center gap-2" title="Back to home" to="/">
          <BrandLogo width={isDesktop ? 32 : 24} />
          {!isMobile && (
            <span className="text-sm font-bold text-gray-800 dark:text-gray-300">
              {getTitle()}
            </span>
          )}
        </Link>
        {extra}
      </div>
      <div className="flex items-center gap-4">
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
