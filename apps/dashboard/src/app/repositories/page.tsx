import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import {
  prefetchRepositories,
  prefetchStatistics,
} from "@/lib/query/server-prefetch";
import { getUser } from "~/auth/repository";
import DefaultLayoutWrapper from "../DefaultLayoutWrapper";
import RepositoriesPageClient from "./RepositoriesPageClient";

export const metadata: Metadata = {
  title: "All Repositories",
  description:
    "Top repositories by developer engagement and contributions across Web3 ecosystems",
};

export default async function RepositoriesPage() {
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
