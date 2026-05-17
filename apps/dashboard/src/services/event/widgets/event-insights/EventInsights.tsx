"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui";
import { ArrowRight, Lock, Loader2 } from "lucide-react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { addToastAtom } from "#/atoms";
import { canManageEvents } from "~/auth/helper";
import type { ApiUser } from "~/auth/typing";
import { Panel } from "$/blueprint";
import { SmallCapsLabel } from "$/primitives";
import type { EventInsight } from "../../typing";

type EventInsightsProps = {
  dataSource: EventInsight[];
  loading?: boolean;
  user?: ApiUser | null | undefined;
  variant?: "admin" | "public";
};

function EventInsightsWidget({
  dataSource,
  loading = false,
  user,
  variant = "admin",
}: EventInsightsProps) {
  const [, addToast] = useAtom(addToastAtom);
  const router = useRouter();
  const [navigatingEventId, setNavigatingEventId] = useState<string | null>(
    null,
  );
  const isAdminVariant = variant === "admin";
  const userHasAdminAccess = canManageEvents(user);
  const isLockedForUser = isAdminVariant && !userHasAdminAccess;

  const handleViewDetailsClick = async (eventId: string) => {
    if (isAdminVariant && !canManageEvents(user)) {
      addToast({
        type: "warning",
        title: "Access Restricted",
        message: "You don't have enough role to manage events",
      });
      return;
    }

    setNavigatingEventId(eventId);

    // Set a timeout to clear loading state in case navigation gets stuck
    const timeoutId = setTimeout(() => {
      setNavigatingEventId(null);
    }, 5000);

    const targetPath = isAdminVariant
      ? `/admin/events/${eventId}`
      : `/events/${eventId}`;

    try {
      await router.push(targetPath);
      clearTimeout(timeoutId);
    } catch (error) {
      console.error("Navigation error:", error);
      clearTimeout(timeoutId);
      setNavigatingEventId(null);
    }
  };

  if (loading) {
    return (
      <Panel
        label={{ text: "events · recent", position: "tl" }}
        code="E1"
        className="overflow-hidden"
      >
        <div className="px-5 pt-5 pb-3 border-b border-rule">
          <SmallCapsLabel>recent events</SmallCapsLabel>
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-3/4 rounded-[2px]" />
              <Skeleton className="h-3 w-1/2 rounded-[2px]" />
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  if (!dataSource.length) {
    return (
      <Panel
        label={{ text: "events · recent", position: "tl" }}
        code="E1"
        className="overflow-hidden"
      >
        <div className="px-5 pt-5 pb-3 border-b border-rule">
          <SmallCapsLabel>recent events</SmallCapsLabel>
        </div>
        <div className="p-6">
          <p className="text-fg-muted text-center py-8 font-mono text-sm">
            No recent events available
          </p>
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      label={{ text: "events · recent", position: "tl" }}
      code="E1"
      className="overflow-hidden"
    >
      <div className="px-5 pt-5 pb-3 border-b border-rule">
        <SmallCapsLabel>recent events</SmallCapsLabel>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-rule bg-bg-sunken">
              <th className="px-6 py-3 text-left font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em] w-12">
                #
              </th>
              <th className="px-6 py-3 text-left font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                Event
              </th>
              <th className="px-6 py-3 text-left font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                Created
              </th>
              <th className="px-6 py-3 text-right font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {dataSource.map((event, i) => {
              const createdDate = new Date(event.created_at);
              const formattedDate = createdDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <tr
                  key={event.id}
                  className="hover:bg-bg-sunken transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-[11px] text-fg-muted tabular-nums">
                      {String(i + 1).padStart(3, "0")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-fg truncate max-w-xs">
                      {event.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-sm text-fg-muted tabular-nums">
                      {formattedDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleViewDetailsClick(event.id)}
                      disabled={navigatingEventId !== null}
                      className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${isLockedForUser ? "text-fg-subtle cursor-not-allowed disabled:opacity-30" : "text-fg hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed"}`}
                    >
                      {isLockedForUser && <Lock size={12} />}
                      View Details
                      {navigatingEventId === event.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ArrowRight size={14} />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-rule">
        <Link
          href={isAdminVariant ? "/admin/events" : "/events"}
          className="flex items-center justify-center gap-2 text-sm font-medium text-fg-muted hover:text-accent transition-colors duration-200"
        >
          View All Events
          <ArrowRight size={16} />
        </Link>
      </div>
    </Panel>
  );
}

export default EventInsightsWidget;
