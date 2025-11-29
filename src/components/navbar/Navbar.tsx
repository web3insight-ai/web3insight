'use client';

import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { getTitle } from "@/utils/app";

import SignedUserWidget from "~/auth/widgets/signed-user";

import type { NavbarProps } from "./typing";
import useSessionActions from "./useSessionActions";
import PrefersColorSchemeSelector from "./PrefersColorSchemeSelector";

function Navbar({ className, children, user, extra }: NavbarProps) {
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { signIn, signOut, resetPassword } = useSessionActions();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if dark mode is active
  const isDark = mounted && (theme === 'system' ? systemTheme === 'dark' : theme === 'dark');

  return (
    <div className={clsx("flex items-center w-full px-6 py-4", className)}>
      {/* Left side - Logo */}
      <div className="flex items-center gap-3 flex-1">
        <Link className="flex items-center gap-3 group" title="Back to home" href="/">
          {mounted ? (
            <Image
              src={isDark ? "/web3insight_logo_white.svg" : "/web3insight_logo.svg"}
              width={isDesktop ? 150 : 120}
              height={isDesktop ? 26 : 20}
              alt={`${getTitle()} Logo`}
              priority
            />
          ) : (
            <div style={{ width: isDesktop ? 150 : 120, height: isDesktop ? 26 : 20 }} />
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
