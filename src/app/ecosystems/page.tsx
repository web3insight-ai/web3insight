import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import {
  prefetchEcosystems,
  prefetchStatistics,
} from "@/lib/query/server-prefetch";
import { getUser } from "~/auth/repository";
import { headers } from "next/headers";
import DefaultLayoutWrapper from "../DefaultLayoutWrapper";
import EcosystemsPageClient from "./EcosystemsPageClient";

export const metadata: Metadata = {
  title: "All Ecosystems | Web3 Insights",
  openGraph: {
    title: "All Ecosystems | Web3 Insights",
  },
  description:
    "Comprehensive overview of all blockchain and Web3 ecosystems with analytics and insights",
};

export default async function EcosystemsPage() {
  // Get current user from session
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/ecosystems`;

  const _request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });
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
