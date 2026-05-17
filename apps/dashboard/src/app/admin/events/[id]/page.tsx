import { notFound } from "next/navigation";

import { fetchCurrentUser } from "~/auth/repository";
import { canManageEvents } from "~/auth/helper";
import { getSession } from "~/auth/helper/server";
import { api } from "@/lib/api/client";
import type { DataValue } from "@/types";
import { resolveEventDetail } from "~/event/helper";
import type { EventReport } from "~/event/typing";
import EventDetailViewWidget from "~/event/views/event-detail";
import { SectionHeader } from "$/primitives";

interface AdminEventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function fetchEventData(
  eventId: number,
): Promise<{ success: boolean; data: EventReport }> {
  const session = await getSession();
  const userToken = session.get("userToken") as string | undefined as
    | string
    | undefined;

  if (!userToken) {
    return { success: false, data: {} as EventReport };
  }

  const res = await api.custom.getAnalysisUser(userToken, eventId);

  if (!res.success) {
    return { success: false, data: {} as EventReport };
  }

  const eventReport = resolveEventDetail(res.data as Record<string, DataValue>);

  return { success: true, data: eventReport };
}

export async function generateMetadata({ params }: AdminEventDetailPageProps) {
  const resolvedParams = await params;
  const eventId = Number(resolvedParams.id);

  try {
    const eventRes = await fetchEventData(eventId);
    const eventName =
      eventRes.success && eventRes.data
        ? eventRes.data.description || "Unknown Event"
        : "Event";

    return {
      title: `${eventName} (${eventId}) | Admin Panel`,
      description: `Event details and analytics for ${eventName}`,
    };
  } catch {
    return {
      title: "Event Details | Admin Panel",
      description: "Event details and analytics",
    };
  }
}

async function getEventDetailData(eventId: number) {
  const res = await fetchCurrentUser();

  if (!canManageEvents(res.data)) {
    notFound();
  }

  const eventRes = await fetchEventData(eventId);

  if (!eventRes.success) {
    notFound();
  }

  return {
    eventId,
    eventName: eventRes.data.description || "Unknown Event",
  };
}

export default async function AdminEventDetailPage({
  params,
}: AdminEventDetailPageProps) {
  const resolvedParams = await params;
  const eventId = Number(resolvedParams.id);
  const { eventName } = await getEventDetailData(eventId);

  return (
    <div className="min-h-dvh bg-bg py-8">
      <div className="w-full max-w-content mx-auto px-6">
        <SectionHeader
          kicker="admin · event"
          title={eventName}
          deck="Comprehensive analytics and insights for event participants and their contributions."
          level={1}
        />

        {/* Event Detail Content */}
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <EventDetailViewWidget id={eventId} />
        </div>
      </div>
    </div>
  );
}
