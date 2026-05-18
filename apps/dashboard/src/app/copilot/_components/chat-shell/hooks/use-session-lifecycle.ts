import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChatStatus } from "ai";
import { useSetAtom, useStore } from "jotai";
import { usePathname } from "next/navigation";
import type { RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";
import type { CopilotUIMessage } from "~/ai/copilot-types";
import {
  applyPreferredLeafSelection,
  buildLatestBranchSelection,
  resolveActivePathFromHistory,
} from "../lib/branch-graph";
import type {
  CopilotChatFinishEvent,
  CopilotChatInstanceEntry,
} from "../lib/chat-instance-cache";
import {
  getCopilotSessionIdFromPathname,
  pushCopilotPath,
  replaceCopilotPath,
} from "../lib/navigation";
import { mapHistoryRowsToEntries } from "../lib/thread-mappers";
import {
  copilotBranchSelectionAtom,
  copilotIsBootstrappingAtom,
  copilotIsSessionMenuOpenAtom,
  copilotIsThreadActionPendingAtom,
  copilotSessionIdAtom,
  copilotThreadHistoryAtom,
} from "../state/atoms";
import type {
  SessionNavigationMode,
  SwitchSessionOptions,
  ThreadHistoryEntry,
} from "../types";

type ThreadHistoryRows = Parameters<typeof mapHistoryRowsToEntries>[0];

interface ThreadHistoryResponse {
  messages: Array<{ message: CopilotUIMessage; parentId: string | null }>;
}

interface ThreadHistorySnapshot {
  history: ThreadHistoryEntry[];
  messages: CopilotUIMessage[];
  selections: Record<string, string>;
}

interface UseCopilotSessionLifecycleProps {
  getChatEntry: (sessionId: string | null) => CopilotChatInstanceEntry;
  invalidateThreadQueries: () => void;
  isCreatingSessionRef: RefObject<Promise<string> | null>;
  lastSyncedAssistantMessageIdRef: RefObject<string | null>;
  sessionRef: RefObject<string | null>;
  statusRef: RefObject<ChatStatus>;
  switchRequestIdRef: RefObject<number>;
}

interface SessionLifecycleResult {
  ensureSession: () => Promise<string>;
  handleChatFinish: (event: CopilotChatFinishEvent) => void;
  selectPathToMessageId: (targetMessageId: string) => boolean;
  selectBranchByMessageId: (parentKey: string, targetMessageId: string) => void;
  switchToSession: (
    nextSessionId: string | null,
    options?: SwitchSessionOptions,
  ) => Promise<boolean>;
}

const HISTORY_SYNC_RETRY_DELAY_MS = 750;
const THREAD_HISTORY_QUERY_KEY = "threadHistory";

function getThreadHistoryQueryKey(sessionId: string) {
  return ["copilot", THREAD_HISTORY_QUERY_KEY, sessionId] as const;
}

async function fetchThreadHistoryFromApi(
  sessionId: string,
): Promise<ThreadHistoryResponse> {
  const res = await fetch(`/api/ai/sessions/${sessionId}/history`);
  if (!res.ok) {
    throw new Error("Failed to load thread history");
  }
  return res.json() as Promise<ThreadHistoryResponse>;
}

function buildThreadHistorySnapshot(
  historyRows: ThreadHistoryRows,
  preferredLeafMessageId?: string,
): ThreadHistorySnapshot {
  const history = mapHistoryRowsToEntries(historyRows);
  const latestSelection = buildLatestBranchSelection(history);
  const selectionSeed = preferredLeafMessageId
    ? applyPreferredLeafSelection(
        history,
        latestSelection,
        preferredLeafMessageId,
      )
    : latestSelection;
  const { messages, selections } = resolveActivePathFromHistory(
    history,
    selectionSeed,
  );

  return { history, messages, selections };
}

/**
 * Manages the full session lifecycle: creating sessions, switching between
 * them, syncing thread history after the AI finishes a response, and keeping
 * the active session in step with the URL path.
 *
 * Two big departures from the previous version:
 *   1. Completion is driven by a `handleChatFinish` callback wired through
 *      `chat-instance-cache`'s `onFinishRef`, instead of a `useEffect` on
 *      `status`. The callback runs once per finished stream — no race with
 *      mid-stream renders.
 *   2. Route sync uses Next's `usePathname` instead of a custom `popstate`
 *      listener; `pathSessionId` is derived from `pathname` and effects react
 *      to changes. This matches the App Router's own navigation model.
 */
export function useCopilotSessionLifecycle({
  getChatEntry,
  invalidateThreadQueries,
  isCreatingSessionRef,
  lastSyncedAssistantMessageIdRef,
  sessionRef,
  statusRef,
  switchRequestIdRef,
}: UseCopilotSessionLifecycleProps): SessionLifecycleResult {
  const jotaiStore = useStore();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const setSessionId = useSetAtom(copilotSessionIdAtom);
  const setBranchSelection = useSetAtom(copilotBranchSelectionAtom);
  const setIsBootstrapping = useSetAtom(copilotIsBootstrappingAtom);
  const setIsSessionMenuOpenState = useSetAtom(copilotIsSessionMenuOpenAtom);
  const setIsThreadActionPending = useSetAtom(copilotIsThreadActionPendingAtom);
  const setThreadHistory = useSetAtom(copilotThreadHistoryAtom);

  const didBootstrapInitialSessionRef = useRef(false);
  const didMountRouteSyncRef = useRef(false);
  const skipPathSyncRef = useRef(false);

  const initializeThreadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localId: crypto.randomUUID() }),
      });
      if (!res.ok) {
        throw new Error("Failed to create session");
      }
      return res.json() as Promise<{ remoteId: string }>;
    },
  });

  const resetThreadState = useCallback(() => {
    setThreadHistory([]);
    setBranchSelection({});
    lastSyncedAssistantMessageIdRef.current = null;
  }, [lastSyncedAssistantMessageIdRef, setBranchSelection, setThreadHistory]);

  const applyMessages = useCallback(
    (targetSessionId: string | null, nextMessages: CopilotUIMessage[]) => {
      // Reason: We mutate Chat.messages directly (mirroring euka) so the
      // change is visible synchronously — feeding through React state would
      // race with the next sendMessage call.
      const chat = getChatEntry(targetSessionId).chat;
      chat.messages = nextMessages;
      chat.clearError();
    },
    [getChatEntry],
  );

  const navigateToSessionPath = useCallback(
    (targetSessionId: string | null, navigation: SessionNavigationMode) => {
      if (navigation === "push") {
        pushCopilotPath(targetSessionId);
        return;
      }
      if (navigation === "replace") {
        replaceCopilotPath(targetSessionId);
      }
    },
    [],
  );

  const clearActiveSession = useCallback(() => {
    sessionRef.current = null;
    setSessionId(null);
    resetThreadState();
    applyMessages(null, []);
  }, [applyMessages, resetThreadState, sessionRef, setSessionId]);

  const applyActiveSession = useCallback(
    (targetSessionId: string, nextMessages: CopilotUIMessage[]) => {
      sessionRef.current = targetSessionId;
      setSessionId(targetSessionId);
      applyMessages(targetSessionId, nextMessages);
    },
    [applyMessages, sessionRef, setSessionId],
  );

  const resolveDisplayMessages = useCallback(
    (targetSessionId: string, persistedMessages: CopilotUIMessage[]) => {
      const isActiveSession = sessionRef.current === targetSessionId;
      const isStreaming =
        statusRef.current === "streaming" || statusRef.current === "submitted";
      if (!isActiveSession || !isStreaming) {
        return persistedMessages;
      }

      const liveMessages = getChatEntry(targetSessionId).chat.messages;
      if (
        liveMessages.length === 0 ||
        persistedMessages.length > liveMessages.length
      ) {
        return persistedMessages;
      }

      const persistedIsPrefixOfLive = persistedMessages.every(
        (message, index) => liveMessages[index]?.id === message.id,
      );

      // Reason: During first-message bootstrap the DB snapshot can briefly lag
      // behind the optimistic client state. If persisted is just a prefix of
      // live, preserve live so the user's submitted message does not vanish.
      return persistedIsPrefixOfLive ? liveMessages : persistedMessages;
    },
    [getChatEntry, sessionRef, statusRef],
  );

  const applyHistoryRows = useCallback(
    (
      targetSessionId: string,
      historyRows: ThreadHistoryRows,
      preferredLeafMessageId?: string,
    ) => {
      const { history, messages, selections } = buildThreadHistorySnapshot(
        historyRows,
        preferredLeafMessageId,
      );

      setThreadHistory(history);
      setBranchSelection(selections);
      applyMessages(
        targetSessionId,
        resolveDisplayMessages(targetSessionId, messages),
      );
    },
    [
      applyMessages,
      resolveDisplayMessages,
      setBranchSelection,
      setThreadHistory,
    ],
  );

  const fetchThreadHistory = useCallback(
    async (
      targetSessionId: string,
      options?: { fresh?: boolean },
    ): Promise<ThreadHistoryResponse> => {
      return queryClient.fetchQuery({
        queryKey: getThreadHistoryQueryKey(targetSessionId),
        queryFn: () => fetchThreadHistoryFromApi(targetSessionId),
        staleTime: options?.fresh ? 0 : 60_000,
      });
    },
    [queryClient],
  );

  const getCachedThreadHistory = useCallback(
    (targetSessionId: string) => {
      return queryClient.getQueryData<ThreadHistoryResponse>(
        getThreadHistoryQueryKey(targetSessionId),
      );
    },
    [queryClient],
  );

  const syncCompletedResponse = useCallback(
    async (targetSessionId: string, assistantMessageId: string) => {
      const fetchPersisted = async (): Promise<ThreadHistoryRows | null> => {
        const { messages: rows } = await fetchThreadHistory(targetSessionId, {
          fresh: true,
        });
        if (sessionRef.current !== targetSessionId) {
          return null;
        }
        return rows;
      };

      const hasAssistantMessage = (rows: ThreadHistoryRows) =>
        mapHistoryRowsToEntries(rows).some(
          (entry) => entry.message.id === assistantMessageId,
        );

      try {
        let rows = await fetchPersisted();
        if (!rows) {
          return;
        }

        if (!hasAssistantMessage(rows)) {
          await new Promise((resolve) =>
            setTimeout(resolve, HISTORY_SYNC_RETRY_DELAY_MS),
          );
          rows = await fetchPersisted();
          if (!rows) {
            return;
          }
        }

        if (!hasAssistantMessage(rows)) {
          console.warn(
            "[copilot-thread] Assistant message not yet persisted after retry:",
            assistantMessageId,
          );
          return;
        }

        if (lastSyncedAssistantMessageIdRef.current === assistantMessageId) {
          return;
        }

        lastSyncedAssistantMessageIdRef.current = assistantMessageId;
        invalidateThreadQueries();
        applyHistoryRows(targetSessionId, rows, assistantMessageId);
      } catch (syncError) {
        console.error(
          "[copilot-thread] Failed to sync completed response history:",
          syncError,
        );
      }
    },
    [
      applyHistoryRows,
      fetchThreadHistory,
      invalidateThreadQueries,
      lastSyncedAssistantMessageIdRef,
      sessionRef,
    ],
  );

  const selectBranchByMessageId = useCallback(
    (parentKey: string, targetMessageId: string) => {
      const currentSelections = jotaiStore.get(copilotBranchSelectionAtom);
      if (currentSelections[parentKey] === targetMessageId) {
        return;
      }

      const nextSelections = {
        ...currentSelections,
        [parentKey]: targetMessageId,
      };

      const currentHistory = jotaiStore.get(copilotThreadHistoryAtom);
      const { messages: nextMessages, selections } =
        resolveActivePathFromHistory(currentHistory, nextSelections);

      setBranchSelection(selections);
      applyMessages(sessionRef.current, nextMessages);
    },
    [applyMessages, jotaiStore, sessionRef, setBranchSelection],
  );

  const selectPathToMessageId = useCallback(
    (targetMessageId: string) => {
      const currentHistory = jotaiStore.get(copilotThreadHistoryAtom);
      if (
        !currentHistory.some((entry) => entry.message.id === targetMessageId)
      ) {
        return false;
      }

      const currentSelections = jotaiStore.get(copilotBranchSelectionAtom);
      const nextSelections = applyPreferredLeafSelection(
        currentHistory,
        currentSelections,
        targetMessageId,
      );

      const { messages: nextMessages, selections } =
        resolveActivePathFromHistory(currentHistory, nextSelections);

      if (!nextMessages.some((message) => message.id === targetMessageId)) {
        return false;
      }

      setBranchSelection(selections);
      applyMessages(sessionRef.current, nextMessages);
      return true;
    },
    [applyMessages, jotaiStore, sessionRef, setBranchSelection],
  );

  const bootstrapActiveSession = useCallback(
    async (targetSessionId: string) => {
      const requestId = ++switchRequestIdRef.current;
      const isLatestRequest = () => requestId === switchRequestIdRef.current;

      try {
        const cachedHistoryResponse = getCachedThreadHistory(targetSessionId);
        if (cachedHistoryResponse) {
          applyHistoryRows(targetSessionId, cachedHistoryResponse.messages);
        } else {
          setIsBootstrapping(true);
        }

        const { messages: historyRows } =
          await fetchThreadHistory(targetSessionId);
        if (!isLatestRequest() || sessionRef.current !== targetSessionId) {
          return true;
        }

        applyHistoryRows(targetSessionId, historyRows);
        return true;
      } catch (bootstrapError) {
        if (!isLatestRequest()) {
          return true;
        }

        console.error(
          "[copilot-thread] Failed to bootstrap active thread:",
          bootstrapError,
        );
        return false;
      } finally {
        if (isLatestRequest()) {
          setIsBootstrapping(false);
        }
      }
    },
    [
      applyHistoryRows,
      fetchThreadHistory,
      getCachedThreadHistory,
      sessionRef,
      setIsBootstrapping,
      switchRequestIdRef,
    ],
  );

  const ensureSession = useCallback(async () => {
    if (sessionRef.current) {
      return sessionRef.current;
    }

    if (isCreatingSessionRef.current) {
      return isCreatingSessionRef.current;
    }

    const createPromise = initializeThreadMutation
      .mutateAsync()
      .then((thread) => {
        resetThreadState();
        applyActiveSession(thread.remoteId, []);
        navigateToSessionPath(thread.remoteId, "push");
        invalidateThreadQueries();
        return thread.remoteId;
      })
      .finally(() => {
        if (isCreatingSessionRef.current === createPromise) {
          isCreatingSessionRef.current = null;
        }
      });

    isCreatingSessionRef.current = createPromise;
    return createPromise;
  }, [
    applyActiveSession,
    initializeThreadMutation,
    invalidateThreadQueries,
    isCreatingSessionRef,
    navigateToSessionPath,
    resetThreadState,
    sessionRef,
  ]);

  const switchToSession = useCallback(
    async (
      nextSessionId: string | null,
      options: SwitchSessionOptions = {},
    ) => {
      const navigation = options.navigation ?? "none";
      const isSameSession =
        nextSessionId !== null && nextSessionId === sessionRef.current;

      if (isSameSession) {
        navigateToSessionPath(nextSessionId, navigation);
        return true;
      }

      const requestId = ++switchRequestIdRef.current;
      const isLatestRequest = () => requestId === switchRequestIdRef.current;

      if (!nextSessionId) {
        if (!isLatestRequest()) {
          return true;
        }
        setIsBootstrapping(false);
        clearActiveSession();
        navigateToSessionPath(null, navigation);
        return true;
      }

      try {
        resetThreadState();
        applyActiveSession(nextSessionId, []);
        navigateToSessionPath(nextSessionId, navigation);

        const cachedHistoryResponse = getCachedThreadHistory(nextSessionId);
        if (cachedHistoryResponse) {
          applyHistoryRows(nextSessionId, cachedHistoryResponse.messages);
        } else {
          setIsBootstrapping(true);
        }

        const { messages: historyRows } =
          await fetchThreadHistory(nextSessionId);
        if (!isLatestRequest()) {
          return true;
        }

        applyHistoryRows(nextSessionId, historyRows);
        return true;
      } catch (switchError) {
        if (!isLatestRequest()) {
          return true;
        }
        console.error("[copilot-thread] Failed to switch thread:", switchError);
        clearActiveSession();
        navigateToSessionPath(null, "replace");
        return false;
      } finally {
        if (isLatestRequest()) {
          setIsBootstrapping(false);
        }
      }
    },
    [
      applyActiveSession,
      applyHistoryRows,
      clearActiveSession,
      fetchThreadHistory,
      getCachedThreadHistory,
      navigateToSessionPath,
      resetThreadState,
      sessionRef,
      setIsBootstrapping,
      switchRequestIdRef,
    ],
  );

  const pathSessionId = getCopilotSessionIdFromPathname(pathname);

  useEffect(() => {
    setIsSessionMenuOpenState(false);
    setIsThreadActionPending(false);
  }, [setIsSessionMenuOpenState, setIsThreadActionPending]);

  useEffect(() => {
    if (didBootstrapInitialSessionRef.current) {
      return;
    }
    didBootstrapInitialSessionRef.current = true;

    if (!pathSessionId) {
      return;
    }

    // Reason: First-mount bootstrap — sync sessionRef + active state before
    // fetching history, so resolveDisplayMessages can pick the right path.
    sessionRef.current = pathSessionId;
    setSessionId(pathSessionId);

    void bootstrapActiveSession(pathSessionId).catch((bootstrapError) => {
      console.error(
        "[copilot-route] Failed to bootstrap initial session:",
        bootstrapError,
      );
    });
  }, [bootstrapActiveSession, pathSessionId, sessionRef, setSessionId]);

  useEffect(() => {
    if (skipPathSyncRef.current) {
      skipPathSyncRef.current = false;
      return;
    }

    if (!didMountRouteSyncRef.current) {
      didMountRouteSyncRef.current = true;
      return;
    }

    if (pathSessionId === sessionRef.current) {
      return;
    }

    void switchToSession(pathSessionId, { navigation: "none" }).catch(
      (navigationError) => {
        console.error(
          "[copilot-route] Failed to sync route session:",
          navigationError,
        );
      },
    );
  }, [pathSessionId, sessionRef, switchToSession]);

  const handleChatFinish = useCallback(
    ({
      isAbort,
      isDisconnect,
      isError,
      message,
      sessionId,
    }: CopilotChatFinishEvent) => {
      if (isAbort || isDisconnect || isError || message.role !== "assistant") {
        return;
      }
      if (!sessionId || sessionRef.current !== sessionId) {
        return;
      }
      if (lastSyncedAssistantMessageIdRef.current === message.id) {
        return;
      }
      void syncCompletedResponse(sessionId, message.id);
    },
    [lastSyncedAssistantMessageIdRef, sessionRef, syncCompletedResponse],
  );

  return {
    ensureSession,
    handleChatFinish,
    selectPathToMessageId,
    selectBranchByMessageId,
    switchToSession,
  };
}
