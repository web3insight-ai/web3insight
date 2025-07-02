import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";

import type { User } from "~/strapi/typing";
import { getUser } from "~/auth/repository";
import { fetchListForUser } from "~/query/repository";

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

  // Clean up OAuth URL parameters
  useEffect(() => {
    const authSuccess = searchParams.get("auth_success");
    const authError = searchParams.get("auth_error");

    if (authSuccess || authError) {
      // Clean up URL parameters without showing notifications
      setSearchParams(params => {
        params.delete("auth_success");
        params.delete("auth_error");
        return params;
      });
    }
  }, [searchParams, setSearchParams]);

  // Combine pinned and regular history for display
  // This ensures we show both the user's history and pinned queries
  const combinedHistory = [...(pinned || []), ...(history || [])];

  return (
    <DefaultLayout history={combinedHistory} user={user}>
      <Outlet context={{ user, setUser }} />
    </DefaultLayout>
  );
}
