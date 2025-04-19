import { NavToolbar } from "~/components/NavToolbar";
import AuthModal from "~/components/auth/AuthModal";

type UserData = {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type MainLayoutProps = {
  children: React.ReactNode;
  history: {
    query: string;
    id: string;
  }[];
  user: UserData | null;
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