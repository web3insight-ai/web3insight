import type { Metadata } from "next";
import EventsPageClient from "./EventsPageClient";
import { api } from "@/lib/api/client";
import { getUser } from "~/auth/repository";
import { headers } from "next/headers";
import DefaultLayoutWrapper from "../DefaultLayoutWrapper";
import { env } from "@/env";

export const metadata: Metadata = {
  title: "All Events | Web3 Insights",
  openGraph: {
    title: "All Events | Web3 Insights",
  },
  description:
    "Comprehensive overview of Web3 development events and hackathons with insights and analytics",
};

export default async function EventsPage() {
  // Get current user from session
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/events`;

  const _request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });
  const user = await getUser();

  try {
    const eventInsightsResult = await api.events.getPublicList({
      take: 100, // Fetch more for the dedicated page
      intent: "hackathon",
    });

    const eventInsights = eventInsightsResult.success
      ? eventInsightsResult.data
      : [];

    if (!eventInsightsResult.success) {
      console.warn("Event insights fetch failed:", eventInsightsResult.message);
    }

    const pageData = {
      eventInsights,
    };

    return (
      <DefaultLayoutWrapper user={user}>
        <EventsPageClient {...pageData} />
      </DefaultLayoutWrapper>
    );
  } catch (error) {
    console.error("Error in events route:", error);

    const fallbackData = {
      eventInsights: [],
    };

    return (
      <DefaultLayoutWrapper user={user}>
        <EventsPageClient {...fallbackData} />
      </DefaultLayoutWrapper>
    );
  }
}
