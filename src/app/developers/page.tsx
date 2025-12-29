import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import {
  prefetchDevelopers,
  prefetchStatistics,
} from "@/lib/query/server-prefetch";
import { getUser } from "~/auth/repository";
import { headers } from "next/headers";
import DefaultLayoutWrapper from "../DefaultLayoutWrapper";
import DevelopersPageClient from "./DevelopersPageClient";

export const metadata: Metadata = {
  title: "All Developers | Web3 Insights",
  openGraph: {
    title: "All Developers | Web3 Insights",
  },
  description:
    "Top contributors and developers across Web3 ecosystems with activity metrics and contributions",
};

export default async function DevelopersPage() {
  // Get current user from session
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}`;

  const _request = new Request(url, {
    headers: headersList,
  });
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
