import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";

import type { User } from "~/strapi/typing";
import { getUser } from "~/auth/repository";
import { fetchListForUser } from "~/query/repository";
import { useToast } from "@/utils/useToast";

import DefaultLayout from "../layouts/default";

type RootContext<U = User | null> = {
  user: U;
  setUser: (user: U) => void;
};

export const loader = async (ctx: LoaderFunctionArgs) => {
  const user = await getUser(ctx.request);
  const { data } = await fetchListForUser({ user });

  return json({ ...data, user });
};

export default function HomeLayout() {
  const { history, pinned, user } = useLoaderData<typeof loader>();
  const { setUser } = useOutletContext<RootContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  // Handle OAuth success/error messages
  useEffect(() => {
    const authSuccess = searchParams.get("auth_success");
    const authError = searchParams.get("auth_error");

    if (authSuccess === "github") {
      // Show success message for GitHub authentication
      toast.success(
        'GitHub Authentication Successful',
        'You have been successfully logged in with GitHub.',
      );

      // Clean up URL parameters
      setSearchParams(params => {
        params.delete("auth_success");
        return params;
      });
    }

    if (authSuccess === "github_new") {
      // Show welcome message for new GitHub users
      toast.success(
        'Welcome to Web3Insights!',
        'Your GitHub account has been linked successfully.',
      );

      // Clean up URL parameters
      setSearchParams(params => {
        params.delete("auth_success");
        return params;
      });
    }

    if (authError) {
      // Show error message
      toast.error('Authentication Failed', authError);

      // Clean up URL parameters
      setSearchParams(params => {
        params.delete("auth_error");
        return params;
      });
    }
  }, [searchParams, setSearchParams, toast]);

  // Combine pinned and regular history for display
  // This ensures we show both the user's history and pinned queries
  const combinedHistory = [...(pinned || []), ...(history || [])];

  return (
    <DefaultLayout history={combinedHistory} user={user}>
      <Outlet context={{ user, setUser }} />
    </DefaultLayout>
  );
}
