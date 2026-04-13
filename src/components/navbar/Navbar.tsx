"use client";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark =
    mounted && (theme === "system" ? systemTheme === "dark" : theme === "dark");

  return (
    <div className={clsx("relative w-full", className)}>
      {/* Blueprint ruler strip — shared with web3insight.ai header */}
      <div
        aria-hidden
        className="h-1.5 w-full text-rule"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, currentColor 0 1px, transparent 1px 24px)",
        }}
      />
      <div className="flex items-center w-full px-6 py-3.5 gap-6">
        <div className="flex items-center flex-1 gap-2.5">
          <Link
            className="flex items-center opacity-100 transition-opacity hover:opacity-80"
            title="Back to home"
            href="/"
          >
            {mounted ? (
              <Image
                src={
                  isDark
                    ? "/web3insight_logo_white.svg"
                    : "/web3insight_logo.svg"
                }
                width={isDesktop ? 140 : 112}
                height={isDesktop ? 24 : 20}
                alt={`${getTitle()} Logo`}
                priority
              />
            ) : (
              <div
                style={{
                  width: isDesktop ? 140 : 112,
                  height: isDesktop ? 24 : 20,
                }}
              />
            )}
          </Link>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-fg-muted sm:inline">
            /dashboard
          </span>
        </div>

        <div className="flex items-center justify-center">{extra}</div>

        <div className="flex items-center gap-2 flex-1 justify-end">
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
    </div>
  );
}

export default Navbar;
