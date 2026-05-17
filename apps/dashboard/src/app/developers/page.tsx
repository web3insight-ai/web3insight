import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import {
  prefetchDevelopers,
  prefetchStatistics,
} from "@/lib/query/server-prefetch";
import { getUser } from "~/auth/repository";
import DefaultLayoutWrapper from "../DefaultLayoutWrapper";
import DevelopersPageClient from "./DevelopersPageClient";

export const metadata: Metadata = {
  title: "All Developers",
  description:
    "Top contributors and developers across Web3 ecosystems with activity metrics and contributions",
};

export default async function DevelopersPage() {
  const user = await getUser();

  // Prefetch data for TanStack Query
  const queryClient = getQueryClient();

  await Promise.all([
    prefetchDevelopers(queryClient),
    prefetchStatistics(queryClient),
  ]);

  return (
    <DefaultLayoutWrapper user={user}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DevelopersPageClient />
      </HydrationBoundary>
    </DefaultLayoutWrapper>
  );
}
