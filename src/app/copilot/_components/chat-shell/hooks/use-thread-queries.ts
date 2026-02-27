import { useInfiniteQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useQueryState } from "nuqs";
import { useMemo } from "react";

import {
  COPILOT_ARCHIVED_CHATS_DIALOG_QUERY_KEY,
  copilotDialogOpenParser,
} from "../components/settings/query-state";
import { SESSION_LIST_LIMIT } from "../constants";
import { mapThreads } from "../lib/thread-mappers";
import { copilotIsSessionMenuOpenAtom } from "../state/atoms";
import type { CopilotThreadQueryState, ThreadItem } from "../types";

/** Response shape from GET /api/ai/sessions */
interface ThreadListPage {
  threads: Array<{
    remoteId: string;
    title?: string | null;
    createdAt?: string;
    lastActiveAt?: string;
  }>;
  nextOffset: number | null;
}

/**
 * Manages paginated thread list queries for both active and archived sessions.
 * Replaces euka's oRPC-based infinite query with manual fetch + TanStack Query.
 *
 * Queries are lazily enabled -- the active list fires only when the session
 * sidebar is open, and the archived list fires only when the archived-chats
 * dialog is open.
 */
export function useCopilotThreadQueries() {
  const [archivedDialogQueryState] = useQueryState(
    COPILOT_ARCHIVED_CHATS_DIALOG_QUERY_KEY,
    copilotDialogOpenParser,
  );
  const isArchivedDialogOpen = archivedDialogQueryState === "open";
  const isSessionMenuOpen = useAtomValue(copilotIsSessionMenuOpenAtom);

  const historyQuery = useInfiniteQuery({
    queryKey: ["copilot", "threads", { archived: false }],
    queryFn: async ({ pageParam = 0 }): Promise<ThreadListPage> => {
      const params = new URLSearchParams({
        archived: "false",
        limit: String(SESSION_LIST_LIMIT),
        offset: String(pageParam),
      });
      const res = await fetch(`/api/ai/sessions?${params}`);
      if (!res.ok) {
        throw new Error("Failed to load threads");
      }
      return res.json() as Promise<ThreadListPage>;
    },
    initialPageParam: 0,
    getNextPageParam: (page: ThreadListPage) => page.nextOffset ?? undefined,
    enabled: isSessionMenuOpen,
  });

  const archivedQuery = useInfiniteQuery({
    queryKey: ["copilot", "threads", { archived: true }],
    queryFn: async ({ pageParam = 0 }): Promise<ThreadListPage> => {
      const params = new URLSearchParams({
        archived: "true",
        limit: String(SESSION_LIST_LIMIT),
        offset: String(pageParam),
      });
      const res = await fetch(`/api/ai/sessions?${params}`);
      if (!res.ok) {
        throw new Error("Failed to load archived threads");
      }
      return res.json() as Promise<ThreadListPage>;
    },
    initialPageParam: 0,
    getNextPageParam: (page: ThreadListPage) => page.nextOffset ?? undefined,
    enabled: isArchivedDialogOpen,
  });

  const historyThreads = useMemo<ThreadItem[]>(() => {
    const rawThreads =
      historyQuery.data?.pages.flatMap((page) => page.threads) ?? [];
    return mapThreads(rawThreads, false);
  }, [historyQuery.data?.pages]);

  const archivedThreads = useMemo<ThreadItem[]>(() => {
    const rawThreads =
      archivedQuery.data?.pages.flatMap((page) => page.threads) ?? [];
    return mapThreads(rawThreads, true);
  }, [archivedQuery.data?.pages]);

  const historyQueryState = useMemo<CopilotThreadQueryState>(() => {
    return {
      hasNextPage: Boolean(historyQuery.hasNextPage),
      isFetchingNextPage: historyQuery.isFetchingNextPage,
      isLoading: historyQuery.isLoading,
    };
  }, [
    historyQuery.hasNextPage,
    historyQuery.isFetchingNextPage,
    historyQuery.isLoading,
  ]);

  const archivedQueryState = useMemo<CopilotThreadQueryState>(() => {
    return {
      hasNextPage: Boolean(archivedQuery.hasNextPage),
      isFetchingNextPage: archivedQuery.isFetchingNextPage,
      isLoading: archivedQuery.isLoading,
    };
  }, [
    archivedQuery.hasNextPage,
    archivedQuery.isFetchingNextPage,
    archivedQuery.isLoading,
  ]);

  return {
    archivedQuery,
    archivedQueryState,
    archivedThreads,
    historyQuery,
    historyQueryState,
    historyThreads,
  };
}
