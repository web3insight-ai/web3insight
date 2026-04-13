import { notFound } from "next/navigation";
import type { Metadata } from "next";

import DefaultLayoutWrapper from "../../DefaultLayoutWrapper";
import { getUser } from "~/auth/repository";
import { api } from "@/lib/api/client";
import { resolveEventDetail } from "~/event/helper";
import type { DataValue } from "@/types";
import type { EventReport } from "~/event/typing";
import EventDetailViewWidget from "~/event/views/event-detail";
import { SectionHeader } from "$/primitives";

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function fetchEventDetail(
  eventId: number,
): Promise<{ success: boolean; data: EventReport | null }> {
  const result = await api.events.getPublicDetail(eventId);

  if (!result.success || !result.data) {
    return { success: false, data: null };
  }

  const eventReport = resolveEventDetail(
    result.data as Record<string, DataValue>,
  );
  return { success: true, data: eventReport };
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const eventId = Number(resolvedParams.id);

  if (Number.isNaN(eventId)) {
    return {
      title: "Event Details",
      description: "Explore Web3 event analytics and insights.",
    };
  }

  try {
    const result = await fetchEventDetail(eventId);

    if (result.success && result.data) {
      const eventName = result.data.description || `Event ${eventId}`;

      return {
        title: eventName,
        description: `Analytics and insights for ${eventName}.`,
      };
    }
  } catch (error) {
    console.error("[Events] generateMetadata error:", error);
  }

  return {
    title: "Event Details",
    description: "Explore Web3 event analytics and insights.",
  };
}

async function getEventDetail(eventId: number) {
  const result = await fetchEventDetail(eventId);

  if (!result.success || !result.data) {
    notFound();
  }

  return result.data;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const resolvedParams = await params;
  const eventId = Number(resolvedParams.id);

  if (Number.isNaN(eventId)) {
    notFound();
  }

  const user = await getUser();
  const eventDetail = await getEventDetail(eventId);
  const eventName = eventDetail.description || `Event ${eventId}`;

  return (
    <DefaultLayoutWrapper user={user}>
      <div className="w-full max-w-content mx-auto px-6 py-10">
        <div className="mb-10 animate-fade-in">
          <SectionHeader
            kicker={`event · #${eventId}`}
            title={eventName}
            deck="Explore top contributors, ecosystem performance, and key statistics captured from this Web3 event."
          />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <EventDetailViewWidget
            id={eventId}
            mode="public"
            showParticipants={false}
          />
        </div>
      </div>
    </DefaultLayoutWrapper>
  );
}
