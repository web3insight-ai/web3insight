'use client';

import { useState } from "react";
import { Card, Skeleton } from "@nextui-org/react";
import { Calendar, ArrowRight, Lock, Loader2 } from "lucide-react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { addToastAtom } from "#/atoms";
import { canManageEvents } from "~/auth/helper";
import type { ApiUser } from "~/auth/typing";
import type { EventInsight } from "../../typing";

type EventInsightsProps = {
  dataSource: EventInsight[];
  loading?: boolean;
  user?: ApiUser | null | undefined;
  variant?: 'admin' | 'public';
};

function EventInsightsWidget({ dataSource, loading = false, user, variant = 'admin' }: EventInsightsProps) {
  const [, addToast] = useAtom(addToastAtom);
  const router = useRouter();
  const [navigatingEventId, setNavigatingEventId] = useState<string | null>(null);
  const isAdminVariant = variant === 'admin';
  const userHasAdminAccess = canManageEvents(user);
  const isLockedForUser = isAdminVariant && !userHasAdminAccess;

  const handleViewDetailsClick = async (eventId: string) => {
    if (isAdminVariant && !canManageEvents(user)) {
      addToast({
        type: 'warning',
        title: 'Access Restricted',
        message: "You don't have enough role to manage events",
      });
      return;
    }

    setNavigatingEventId(eventId);

    // Set a timeout to clear loading state in case navigation gets stuck
    const timeoutId = setTimeout(() => {
      setNavigatingEventId(null);
    }, 5000);

    const targetPath = isAdminVariant ? `/admin/events/${eventId}` : `/events/${eventId}`;

    try {
      await router.push(targetPath);
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Navigation error:', error);
      clearTimeout(timeoutId);
      setNavigatingEventId(null);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
        <div className="px-6 pt-5 pb-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar size={18} className="text-primary" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Events</h3>
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-3/4 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!dataSource.length) {
    return (
      <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
        <div className="px-6 pt-5 pb-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar size={18} className="text-primary" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Events</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No recent events available
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
      <div className="px-6 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar size={18} className="text-primary" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Events</h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-surface-dark divide-y divide-border dark:divide-border-dark">
            {dataSource.map((event) => {
              const createdDate = new Date(event.created_at);
              const formattedDate = createdDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                        {event.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formattedDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleViewDetailsClick(event.id)}
                      disabled={navigatingEventId !== null}
                      className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${isLockedForUser ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed disabled:opacity-30' : 'text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed'}`}
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
      <div className="px-6 py-4 border-t border-border dark:border-border-dark">
        <Link
          href={isAdminVariant ? '/admin/events' : '/events'}
          className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200"
        >
          View All Events
          <ArrowRight size={16} />
        </Link>
      </div>
    </Card>
  );
}

export default EventInsightsWidget;
