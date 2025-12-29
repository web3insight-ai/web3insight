import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import {
  prefetchRepositories,
  prefetchStatistics,
} from "@/lib/query/server-prefetch";
import { getUser } from "~/auth/repository";
import { headers } from "next/headers";
import DefaultLayoutWrapper from "../DefaultLayoutWrapper";
import RepositoriesPageClient from "./RepositoriesPageClient";

export const metadata: Metadata = {
  title: "All Repositories | Web3 Insights",
  openGraph: {
    title: "All Repositories | Web3 Insights",
  },
  description:
    "Top repositories by developer engagement and contributions across Web3 ecosystems",
};

export default async function RepositoriesPage() {
  // Get current user from session
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/repositories`;

  const _request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });
  const user = await getUser();

  // Prefetch data for TanStack Query
  const queryClient = getQueryClient();

  await Promise.all([
    prefetchRepositories(queryClient),
    prefetchStatistics(queryClient),
  ]);

  return (
    <DefaultLayoutWrapper user={user}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RepositoriesPageClient />
      </HydrationBoundary>
    </DefaultLayoutWrapper>
  );
}
