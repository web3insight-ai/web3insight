'use client';

import AuthFormDialogViewWidget from "~/auth/views/auth-form-dialog";
import Navbar from "../src/components/navbar";
import NavigationMenu from "../src/components/navbar/NavigationMenu";
import type { ApiUser } from "~/auth/typing";

interface DefaultLayoutWrapperProps {
  children: React.ReactNode;
  user: ApiUser | null;
}

export default function DefaultLayoutWrapper({ children, user }: DefaultLayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border dark:border-border-dark">
        <Navbar className="max-w-content mx-auto" user={user} extra={<NavigationMenu />} />
      </header>

      <main className="pb-24">
        {children}
      </main>

      {/* Auth Modal for login/register/password reset */}
      <AuthFormDialogViewWidget />
    </div>
  );
}
