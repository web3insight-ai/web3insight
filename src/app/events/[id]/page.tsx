import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { Calendar } from "lucide-react";

import DefaultLayoutWrapper from "../../DefaultLayoutWrapper";
import { getUser } from "~/auth/repository";
import { env } from "@/env";
import { api } from "@/lib/api/client";
import { resolveEventDetail } from "~/event/helper";
import type { DataValue } from "@/types";
import type { EventReport } from "~/event/typing";
import EventDetailViewWidget from "~/event/views/event-detail";

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
      title: "Event Details | Web3 Insights",
      description: "Explore Web3 event analytics and insights.",
    };
  }

  try {
    const result = await fetchEventDetail(eventId);

    if (result.success && result.data) {
      const eventName = result.data.description || `Event ${eventId}`;

      return {
        title: `${eventName} | Web3 Insights`,
        description: `Analytics and insights for ${eventName}.`,
      };
    }
  } catch (error) {
    console.error("[Events] generateMetadata error:", error);
  }

  return {
    title: "Event Details | Web3 Insights",
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

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/events/${eventId}`;

  const _request = new Request(url, {
    headers: Object.fromEntries(headersList.entries()),
  });

  const user = await getUser();
  const eventDetail = await getEventDetail(eventId);
  const eventName = eventDetail.description || `Event ${eventId}`;

  return (
    <DefaultLayoutWrapper user={user}>
      <div className="min-h-dvh bg-background dark:bg-background-dark py-8">
        <div className="w-full max-w-content mx-auto px-6">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Calendar size={28} className="text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {eventName}
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  Event Insights &amp; Analytics
                </p>
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
              Explore top contributors, ecosystem performance, and key
              statistics captured from this Web3 event.
            </p>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <EventDetailViewWidget
              id={eventId}
              mode="public"
              showParticipants={false}
            />
          </div>
        </div>
      </div>
    </DefaultLayoutWrapper>
  );
}
