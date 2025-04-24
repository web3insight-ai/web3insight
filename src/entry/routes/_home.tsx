import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";

import type { StrapiUser } from "~/strapi";
import { getUser } from "~/auth/repository";
import { fetchListForUser } from "~/query/repository";

import DefaultLayout from "../layouts/default";

type RootContext = {
  user: StrapiUser | null;
  setUser: (user: StrapiUser | null) => void;
};

export const loader = async (ctx: LoaderFunctionArgs) => {
  const user = await getUser(ctx.request);
  const { data } = await fetchListForUser({ user });

  return json({ ...data, user });
};

export default function HomeLayout() {
  const { history, pinned, user } = useLoaderData<typeof loader>();
  const { setUser } = useOutletContext<RootContext>();

  // Combine pinned and regular history for display
  // This ensures we show both the user's history and pinned queries
  const combinedHistory = [...(pinned || []), ...(history || [])];

  return (
    <DefaultLayout history={combinedHistory} user={user}>
      <Outlet context={{ user, setUser }} />
    </DefaultLayout>
  );
}
