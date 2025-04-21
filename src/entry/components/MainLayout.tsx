import { NavToolbar } from "~/components/NavToolbar";
import AuthModal from "~/components/auth/AuthModal";
import type { StrapiUser } from "~/services/auth/strapi.server";

type MainLayoutProps = {
  children: React.ReactNode;
  history: {
    query: string;
    id: string;
    documentId: string;
  }[];
  user: StrapiUser | null;
};

export function MainLayout({ children, history, user }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white">
        <NavToolbar
          history={history}
          user={user}
        />
      </header>

      <main className="pb-20">
        {children}
      </main>

      {/* Auth Modal for login/register/password reset */}
      <AuthModal />
    </div>
  );
}