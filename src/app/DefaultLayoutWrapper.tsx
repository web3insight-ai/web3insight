"use client";

import { getTitle } from "@/utils/app";
import AuthFormDialogViewWidget from "~/auth/views/auth-form-dialog";
import Navbar from "$/navbar";
import NavigationMenu from "$/navbar/NavigationMenu";
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
    <div className="min-h-screen bg-background dark:bg-background-dark flex flex-col">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border dark:border-border-dark">
        <Navbar
          className="max-w-content mx-auto"
          user={user}
          extra={<NavigationMenu />}
        />
      </header>

      <main className="flex-1 pb-16">{children}</main>

      {!hideFooter && (
        <footer className="border-t border-border dark:border-border-dark bg-surface/50 dark:bg-surface-dark/50">
          <div className="max-w-content mx-auto px-6 py-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Supported by{" "}
                <a
                  href="https://openbuild.xyz/"
                  className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
                >
                  OpenBuild
                </a>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-600">
                © {new Date().getFullYear()} {title}. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}

      <AuthFormDialogViewWidget />
    </div>
  );
}
