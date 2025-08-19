import type { Metadata } from 'next';
import EventsPageClient from './EventsPageClient';
import { fetchPublicEventInsights } from "~/event/repository/public";
import DefaultLayoutWrapper from '../DefaultLayoutWrapper';

export const metadata: Metadata = {
  title: "All Events | Web3 Insights",
  openGraph: {
    title: "All Events | Web3 Insights",
  },
  description: "Comprehensive overview of Web3 development events and hackathons with insights and analytics",
};

export default async function EventsPage() {
  try {
    const eventInsightsResult = await fetchPublicEventInsights({
      take: 100, // Fetch more for the dedicated page
      intent: "hackathon",
    });

    const eventInsights = eventInsightsResult.success ? eventInsightsResult.data : [];

    if (!eventInsightsResult.success) {
      console.warn("Event insights fetch failed:", eventInsightsResult.message);
    }

    const pageData = {
      eventInsights,
    };

    return (
      <DefaultLayoutWrapper user={null}>
        <EventsPageClient {...pageData} />
      </DefaultLayoutWrapper>
    );
  } catch (error) {
    console.error("Error in events route:", error);

    const fallbackData = {
      eventInsights: [],
    };

    return (
      <DefaultLayoutWrapper user={null}>
        <EventsPageClient {...fallbackData} />
      </DefaultLayoutWrapper>
    );
  }
}
