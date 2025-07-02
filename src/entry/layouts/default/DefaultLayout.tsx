import AuthFormDialogViewWidget from "~/auth/views/auth-form-dialog";

import Navbar from "../../components/navbar";
import ToastContainer from "../../components/ToastContainer";

import type { DefaultLayoutProps } from "./typing";
import SearchHistory from "./SearchHistory";

function DefaultLayout({ children, history, user }: DefaultLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50  dark:bg-gray-900">
      <header className="sticky top-0 z-20 border-b bg-white dark:bg-gray-900 dark:border-gray-800">
        <Navbar className="max-w-[1200px] mx-auto" user={user}>
          <SearchHistory
            history={history}
            placeholder={user ? "Your search history will appear here" : "Sign in to save your search history"}
          />
        </Navbar>
      </header>

      <main className="pb-20">
        {children}
      </main>

      {/* Auth Modal for login/register/password reset */}
      <AuthFormDialogViewWidget />
      
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default DefaultLayout;
