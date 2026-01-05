import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { prefetchDonateRepos } from "@/lib/query/server-prefetch";
import { getUser } from "~/auth/repository";
import DefaultLayoutWrapper from "../../DefaultLayoutWrapper";
import X402PageClient from "./X402PageClient";

export const metadata: Metadata = {
  title: "x402 Donate | Web3 Insights",
  openGraph: {
    title: "x402 Donate | Web3 Insights",
  },
  description:
    "Support open source projects with x402 donations. Register your repository and accept USDC donations from the Web3 community.",
};

export default async function X402Page() {
  // Get current user from session
  const user = await getUser();

  // Prefetch data for TanStack Query
  const queryClient = getQueryClient();
  await prefetchDonateRepos(queryClient);

  return (
    <DefaultLayoutWrapper user={user}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <X402PageClient />
      </HydrationBoundary>
    </DefaultLayoutWrapper>
  );
}
