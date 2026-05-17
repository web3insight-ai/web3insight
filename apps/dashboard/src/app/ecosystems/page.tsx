import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import {
  prefetchEcosystems,
  prefetchStatistics,
} from "@/lib/query/server-prefetch";
import { getUser } from "~/auth/repository";
import DefaultLayoutWrapper from "../DefaultLayoutWrapper";
import EcosystemsPageClient from "./EcosystemsPageClient";

export const metadata: Metadata = {
  title: "All Ecosystems",
  description:
    "Comprehensive overview of all blockchain and Web3 ecosystems with analytics and insights",
};

export default async function EcosystemsPage() {
  const user = await getUser();

  // Prefetch data for TanStack Query
  const queryClient = getQueryClient();

  await Promise.all([
    prefetchEcosystems(queryClient),
    prefetchStatistics(queryClient),
  ]);

  return (
    <DefaultLayoutWrapper user={user}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <EcosystemsPageClient />
      </HydrationBoundary>
    </DefaultLayoutWrapper>
  );
}
