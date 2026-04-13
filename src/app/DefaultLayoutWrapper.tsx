"use client";

import { getTitle } from "@/utils/app";
import AuthFormDialogViewWidget from "~/auth/views/auth-form-dialog";
import Navbar from "$/navbar";
import NavigationMenu from "$/navbar/NavigationMenu";
import { SmallCapsLabel } from "$/primitives";
import type { ApiUser } from "~/auth/typing";

interface DefaultLayoutWrapperProps {
  children: React.ReactNode;
  user: ApiUser | null;
  hideFooter?: boolean;
}

export default function DefaultLayoutWrapper({
  children,
  user,
  hideFooter,
}: DefaultLayoutWrapperProps) {
  const title = getTitle();

  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col">
      <header className="sticky top-0 z-20 bg-bg/85 backdrop-blur-sm border-b border-rule">
        <Navbar
          className="max-w-content mx-auto"
          user={user}
          extra={<NavigationMenu />}
        />
      </header>

      <main className="flex-1 pb-20">{children}</main>

      {!hideFooter && (
        <footer className="border-t border-rule bg-bg">
          <div className="max-w-content mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="flex flex-col gap-2">
                <SmallCapsLabel tone="subtle">Supported by</SmallCapsLabel>
                <a
                  href="https://openbuild.xyz/"
                  className="font-display text-[1.125rem] text-fg hover:text-accent transition-colors w-fit"
                >
                  OpenBuild
                </a>
                <p className="text-[0.8125rem] text-fg-muted max-w-[var(--measure)]">
                  Web3 developer analytics — ecosystems, repositories, and
                  contributors in one instrument.
                </p>
              </div>
              <div className="flex flex-col gap-1 md:items-end md:text-right">
                <SmallCapsLabel tone="subtle">
                  © {new Date().getFullYear()}
                </SmallCapsLabel>
                <p className="text-[0.8125rem] font-mono text-fg-muted">
                  {title.toLowerCase()} · v.{new Date().getFullYear() % 100}.
                  {String(new Date().getMonth() + 1).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>
        </footer>
      )}

      <AuthFormDialogViewWidget />
    </div>
  );
}
