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
    <div className={clsx("flex items-center justify-between w-full px-6 py-4", className)}>
      <div className="flex item-center gap-6">
        <Link className="flex items-center gap-3 group" title="Back to home" to="/">
          <BrandLogo width={isDesktop ? 28 : 24} />
          {!isMobile && (
            <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
              {getTitle()}
            </span>
          )}
        </Link>
        {extra}
      </div>
      <div className="flex items-center gap-3">
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
