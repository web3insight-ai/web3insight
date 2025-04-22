import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";
import DefaultLayout from "#/layouts/default";
import { getUser } from "#/services/auth/session.server";
import { fetchPinnedQueries, fetchUserQueries } from "#/services/strapi";
import type { StrapiUser } from "#/services/auth/strapi.server";

// Define query history type
type QueryHistory = {
  query: string;
  id: string;
  documentId: string;
}[];

type RootContext = {
  user: StrapiUser | null;
  setUser: (user: StrapiUser | null) => void;
};

export const loader = async (ctx: LoaderFunctionArgs) => {
  const user = await getUser(ctx.request);

  let history: QueryHistory = [];
  let pinned: QueryHistory = [];

  // Fetch user's query history from Strapi if user is logged in
  if (user && user.id) {
    const userQueries = await fetchUserQueries(user.id, 10);

    history = userQueries
      .filter(query => query.query)
      .map(query => ({
        id: query.id.toString(),
        documentId: query.documentId,
        query: query.query
      }))
      .filter(item => item.query && item.query.trim() !== "" && item.query !== "Untitled query");
  }

  // Fetch pinned queries
  const pinnedQueriesData = await fetchPinnedQueries();

  pinned = pinnedQueriesData
    .filter(query => query.query)
    .map(query => ({
      id: query.id.toString(),
      documentId: query.documentId,
      query: query.query
    }))
    .filter(item => item.query && item.query.trim() !== "" && item.query !== "Untitled query");

  return json({
    user,
    pinned,
    history,
  });
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
