import { useQueryClient } from "@tanstack/react-query";
import type { ChatStatus } from "ai";
import { useAtom, useSetAtom, useStore } from "jotai";
import type { RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";
import type { CopilotUIMessage } from "~/ai/copilot-types";
import {
  applyPreferredLeafSelection,
  buildLatestBranchSelection,
  resolveActivePathFromHistory,
} from "../lib/branch-graph";
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

type SetMessagesFn = (
  messages:
    | CopilotUIMessage[]
    | ((messages: CopilotUIMessage[]) => CopilotUIMessage[]),
) => void;

interface UseCopilotSessionLifecycleProps {
  clearErrorRef: RefObject<() => void>;
  getCurrentMessages: () => CopilotUIMessage[];
  initialRemoteId: string | null;
  invalidateThreadQueries: () => void;
  isCreatingSessionRef: RefObject<Promise<string> | null>;
  lastSyncedAssistantMessageIdRef: RefObject<string | null>;
  sessionRef: RefObject<string | null>;
  setMessagesRef: RefObject<SetMessagesFn>;
  status: ChatStatus;
  statusRef: RefObject<ChatStatus>;
  stopRef: RefObject<() => void>;
  switchRequestIdRef: RefObject<number>;
}

interface SessionLifecycleResult {
  ensureSession: () => Promise<string>;
  selectPathToMessageId: (targetMessageId: string) => boolean;
  selectBranchByMessageId: (parentKey: string, targetMessageId: string) => void;
  switchToSession: (
    nextSessionId: string | null,
    options?: SwitchSessionOptions,
  ) => Promise<boolean>;
}

/** Response shape from GET /api/ai/sessions/[sessionId]/history */
interface ThreadHistoryResponse {
  messages: Array<{ message: CopilotUIMessage; parentId: string | null }>;
}

/**
 * Manages the full session lifecycle: creating sessions, switching between them,
 * handling browser navigation (popstate), bootstrapping from URL, and syncing
 * thread history after the AI finishes a response.
 *
 * Replaces euka's oRPC mutation-based session creation with direct fetch calls.
 */
export function useCopilotSessionLifecycle({
  clearErrorRef,
  getCurrentMessages,
  initialRemoteId,
  invalidateThreadQueries,
  isCreatingSessionRef,
  lastSyncedAssistantMessageIdRef,
  sessionRef,
  setMessagesRef,
  status,
  statusRef,
  stopRef,
  switchRequestIdRef,
}: UseCopilotSessionLifecycleProps): SessionLifecycleResult {
  const jotaiStore = useStore();
  const queryClient = useQueryClient();

  const [sessionId, setSessionId] = useAtom(copilotSessionIdAtom);
  const setBranchSelection = useSetAtom(copilotBranchSelectionAtom);
  const setIsBootstrapping = useSetAtom(copilotIsBootstrappingAtom);
  const setIsSessionMenuOpenState = useSetAtom(copilotIsSessionMenuOpenAtom);
  const setIsThreadActionPending = useSetAtom(copilotIsThreadActionPendingAtom);
  const setThreadHistory = useSetAtom(copilotThreadHistoryAtom);

  // Reason: Keep the ref in sync so imperative code outside React's render
  // cycle always sees the latest session ID without triggering re-renders.
  useEffect(() => {
    sessionRef.current = sessionId;
  }, [sessionId, sessionRef]);

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
    setThreadHistory([]);
    setBranchSelection({});
    lastSyncedAssistantMessageIdRef.current = null;
    setMessagesRef.current([]);
    clearErrorRef.current();
  }, [
    clearErrorRef,
    lastSyncedAssistantMessageIdRef,
    sessionRef,
    setBranchSelection,
    setMessagesRef,
    setSessionId,
    setThreadHistory,
  ]);

  const applyActiveSession = useCallback(
    (targetSessionId: string, nextMessages: CopilotUIMessage[]) => {
      sessionRef.current = targetSessionId;
      setSessionId(targetSessionId);
      setMessagesRef.current(nextMessages);
      clearErrorRef.current();
    },
    [clearErrorRef, sessionRef, setMessagesRef, setSessionId],
  );

  const applyThreadHistoryToChat = useCallback(
    (
      nextHistory: ThreadHistoryEntry[],
      preferredSelections?: Record<string, string>,
      options?: { skipMessageUpdate?: boolean },
    ) => {
      const selectionSeed =
        preferredSelections ?? buildLatestBranchSelection(nextHistory);
      const { messages: nextMessages, selections } =
        resolveActivePathFromHistory(nextHistory, selectionSeed);

      setThreadHistory(nextHistory);
      setBranchSelection(selections);

      // Reason: After streaming completes, the chat already has messages with
      // rich tool output from the streaming protocol. Replacing them with
      // DB-loaded messages would lose the output data (race condition with
      // onFinish persistence) or have different serialization. Only update
      // messages when explicitly needed (e.g. session switch, page load).
      if (!options?.skipMessageUpdate) {
        setMessagesRef.current(nextMessages);
      }

      clearErrorRef.current();
    },
    [clearErrorRef, setBranchSelection, setMessagesRef, setThreadHistory],
  );

  /**
   * Fetches thread history via the REST endpoint, leveraging TanStack Query's
   * cache and deduplication. When `fresh` is true the cache is bypassed.
   */
  const fetchThreadHistory = useCallback(
    async (
      targetSessionId: string,
      options?: { fresh?: boolean },
    ): Promise<ThreadHistoryResponse> => {
      const queryKey = ["copilot", "threadHistory", targetSessionId];
      return queryClient.fetchQuery({
        queryKey,
        queryFn: async (): Promise<ThreadHistoryResponse> => {
          const res = await fetch(
            `/api/ai/sessions/${targetSessionId}/history`,
          );
          if (!res.ok) {
            throw new Error("Failed to load thread history");
          }
          return res.json() as Promise<ThreadHistoryResponse>;
        },
        staleTime: options?.fresh ? 0 : 60_000,
      });
    },
    [queryClient],
  );

  const getCachedThreadHistory = useCallback(
    (targetSessionId: string) => {
      const queryKey = ["copilot", "threadHistory", targetSessionId];
      return queryClient.getQueryData<ThreadHistoryResponse>(queryKey);
    },
    [queryClient],
  );

  /**
   * Re-fetches history from the server and re-applies it to the chat.
   * Called after the AI finishes responding so the branch graph stays current.
   *
   * When `skipMessageUpdate` is true, only thread history and branch state
   * are updated — chat messages are NOT replaced. This is used after streaming
   * completes to avoid overwriting rich tool output with DB-loaded versions.
   */
  const refreshThreadHistory = useCallback(
    async (
      targetSessionId: string,
      preferredLeafMessageId?: string,
      options?: { skipMessageUpdate?: boolean },
    ) => {
      try {
        const { messages: historyRows } = await fetchThreadHistory(
          targetSessionId,
          { fresh: true },
        );

        if (sessionRef.current !== targetSessionId) {
          return;
        }

        const nextHistory = mapHistoryRowsToEntries(historyRows);

        const latestSelection = buildLatestBranchSelection(nextHistory);
        const selectionSeed = preferredLeafMessageId
          ? applyPreferredLeafSelection(
            nextHistory,
            latestSelection,
            preferredLeafMessageId,
          )
          : latestSelection;

        applyThreadHistoryToChat(nextHistory, selectionSeed, {
          skipMessageUpdate: options?.skipMessageUpdate,
        });
      } catch (refreshError) {
        console.error(
          "[copilot-thread] Failed to refresh thread history:",
          refreshError,
        );
      }
    },
    [applyThreadHistoryToChat, fetchThreadHistory, sessionRef],
  );

  const selectBranchByMessageId = useCallback(
    (parentKey: string, targetMessageId: string) => {
      const currentSelections = jotaiStore.get(copilotBranchSelectionAtom);
      if (currentSelections[parentKey] === targetMessageId) {
        return;
      }

      const nextPreferredSelections = {
        ...currentSelections,
        [parentKey]: targetMessageId,
      };

      const currentHistory = jotaiStore.get(copilotThreadHistoryAtom);
      const { messages: nextMessages, selections } =
        resolveActivePathFromHistory(currentHistory, nextPreferredSelections);

      setBranchSelection(selections);
      setMessagesRef.current(nextMessages);
      clearErrorRef.current();
    },
    [clearErrorRef, jotaiStore, setBranchSelection, setMessagesRef],
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
      const nextPreferredSelections = applyPreferredLeafSelection(
        currentHistory,
        currentSelections,
        targetMessageId,
      );

      const { messages: nextMessages, selections } =
        resolveActivePathFromHistory(currentHistory, nextPreferredSelections);
      if (!nextMessages.some((message) => message.id === targetMessageId)) {
        return false;
      }

      setBranchSelection(selections);
      setMessagesRef.current(nextMessages);
      clearErrorRef.current();
      return true;
    },
    [clearErrorRef, jotaiStore, setBranchSelection, setMessagesRef],
  );

  /**
   * Lazily creates a new backend session via POST /api/ai/sessions.
   * Returns the existing session ID if one is already active, and deduplicates
   * concurrent calls by sharing a single in-flight promise.
   */
  const ensureSession = useCallback(async () => {
    if (sessionRef.current) {
      return sessionRef.current;
    }

    if (isCreatingSessionRef.current) {
      return isCreatingSessionRef.current;
    }

    const createSessionPromise = fetch("/api/ai/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ localId: crypto.randomUUID() }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to create session");
        }
        return res.json() as Promise<{ remoteId: string }>;
      })
      .then((thread) => {
        setThreadHistory([]);
        setBranchSelection({});
        lastSyncedAssistantMessageIdRef.current = null;
        applyActiveSession(thread.remoteId, []);
        navigateToSessionPath(thread.remoteId, "push");
        invalidateThreadQueries();
        return thread.remoteId;
      })
      .finally(() => {
        if (isCreatingSessionRef.current === createSessionPromise) {
          isCreatingSessionRef.current = null;
        }
      });

    isCreatingSessionRef.current = createSessionPromise;
    return createSessionPromise;
  }, [
    applyActiveSession,
    invalidateThreadQueries,
    isCreatingSessionRef,
    lastSyncedAssistantMessageIdRef,
    navigateToSessionPath,
    sessionRef,
    setBranchSelection,
    setThreadHistory,
  ]);

  /**
   * Switches the active session. Handles loading history from cache first
   * for a fast optimistic UI, then fetches fresh data from the server.
   * Supports rollback on error and concurrent-request deduplication.
   */
  const switchToSession = useCallback(
    async (
      nextSessionId: string | null,
      options: SwitchSessionOptions = {},
    ) => {
      const { fallbackToNewOnError = false, navigation = "none" } = options;
      const previousSessionId = sessionRef.current;
      const previousThreadHistory = jotaiStore.get(copilotThreadHistoryAtom);
      const previousBranchSelection = jotaiStore.get(
        copilotBranchSelectionAtom,
      );
      const previousMessages = getCurrentMessages();

      if (nextSessionId === sessionRef.current) {
        navigateToSessionPath(nextSessionId, navigation);
        return true;
      }

      const requestId = ++switchRequestIdRef.current;
      const isLatestRequest = () => requestId === switchRequestIdRef.current;

      if (
        statusRef.current === "streaming" ||
        statusRef.current === "submitted"
      ) {
        stopRef.current();
      }

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
        navigateToSessionPath(nextSessionId, navigation);

        setThreadHistory([]);
        setBranchSelection({});
        lastSyncedAssistantMessageIdRef.current = null;
        applyActiveSession(nextSessionId, []);

        // Reason: Show cached data immediately for a snappy UX, then replace
        // with fresh data below.
        const cachedHistoryResponse = getCachedThreadHistory(nextSessionId);
        if (cachedHistoryResponse) {
          const cachedHistory = mapHistoryRowsToEntries(
            cachedHistoryResponse.messages,
          );
          const { messages: cachedMessages, selections: cachedSelections } =
            resolveActivePathFromHistory(
              cachedHistory,
              buildLatestBranchSelection(cachedHistory),
            );

          setThreadHistory(cachedHistory);
          setBranchSelection(cachedSelections);
          lastSyncedAssistantMessageIdRef.current = null;
          applyActiveSession(nextSessionId, cachedMessages);
        } else {
          setIsBootstrapping(true);
        }

        const { messages: historyRows } =
          await fetchThreadHistory(nextSessionId);

        if (!isLatestRequest()) {
          return true;
        }

        const nextHistory = mapHistoryRowsToEntries(historyRows);

        const { messages: nextMessages, selections } =
          resolveActivePathFromHistory(
            nextHistory,
            buildLatestBranchSelection(nextHistory),
          );

        setThreadHistory(nextHistory);
        setBranchSelection(selections);
        lastSyncedAssistantMessageIdRef.current = null;
        applyActiveSession(nextSessionId, nextMessages);

        return true;
      } catch (switchError) {
        if (!isLatestRequest()) {
          return true;
        }

        console.error("[copilot-thread] Failed to switch thread:", switchError);

        if (!fallbackToNewOnError) {
          if (previousSessionId) {
            setThreadHistory(previousThreadHistory);
            setBranchSelection(previousBranchSelection);
            applyActiveSession(previousSessionId, previousMessages);
          } else {
            clearActiveSession();
          }

          if (navigation !== "none") {
            navigateToSessionPath(previousSessionId, "replace");
          }
          return false;
        }

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
      clearActiveSession,
      fetchThreadHistory,
      getCachedThreadHistory,
      getCurrentMessages,
      jotaiStore,
      lastSyncedAssistantMessageIdRef,
      navigateToSessionPath,
      sessionRef,
      setIsBootstrapping,
      setBranchSelection,
      setThreadHistory,
      statusRef,
      stopRef,
      switchRequestIdRef,
    ],
  );

  const switchToSessionRef = useRef(switchToSession);

  useEffect(() => {
    switchToSessionRef.current = switchToSession;
  }, [switchToSession]);

  // Reason: Bootstrap the session from the URL on mount. Resets all state
  // and attempts to load the session specified in the initial URL path.
  useEffect(() => {
    let cancelled = false;

    setIsSessionMenuOpenState(false);
    setIsThreadActionPending(false);
    setBranchSelection({});
    setThreadHistory([]);
    setMessagesRef.current([]);
    clearErrorRef.current();
    setIsBootstrapping(Boolean(initialRemoteId));

    const bootstrap = async () => {
      const didSwitch = await switchToSessionRef.current(initialRemoteId, {
        fallbackToNewOnError: true,
        navigation: "replace",
      });

      if (!cancelled && !didSwitch) {
        clearActiveSession();
      }

      if (!cancelled) {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [
    clearActiveSession,
    clearErrorRef,
    initialRemoteId,
    setBranchSelection,
    setIsBootstrapping,
    setIsSessionMenuOpenState,
    setIsThreadActionPending,
    setMessagesRef,
    setThreadHistory,
  ]);

  // Reason: Handle browser back/forward navigation to keep session state
  // in sync with the URL without a full page reload.
  useEffect(() => {
    let disposed = false;

    const handlePopState = () => {
      const pathSessionId = getCopilotSessionIdFromPathname(
        window.location.pathname,
      );
      if (pathSessionId === sessionRef.current) {
        return;
      }

      void switchToSessionRef
        .current(pathSessionId, {
          fallbackToNewOnError: true,
          navigation: "none",
        })
        .catch((navigationError) => {
          if (!disposed) {
            console.error(
              "[copilot-route] Failed to switch from browser navigation:",
              navigationError,
            );
          }
        });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      disposed = true;
      window.removeEventListener("popstate", handlePopState);
    };
  }, [sessionRef]);

  const previousStatusRef = useRef<ChatStatus>("ready");

  // Reason: After the AI completes a response (status transitions from
  // streaming/submitted to ready), refresh the thread history so the branch
  // graph and sidebar reflect the new message.
  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = status;

    const didCompleteResponse =
      status === "ready" &&
      (previousStatus === "streaming" || previousStatus === "submitted");

    if (!didCompleteResponse) {
      return;
    }

    const activeSessionId = sessionRef.current;
    if (!activeSessionId) {
      return;
    }

    const currentMessages = getCurrentMessages();
    const lastMessage = currentMessages[currentMessages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") {
      return;
    }

    if (lastSyncedAssistantMessageIdRef.current === lastMessage.id) {
      return;
    }

    lastSyncedAssistantMessageIdRef.current = lastMessage.id;
    invalidateThreadQueries();

    // Reason: After streaming completes, the chat already has messages with
    // correct tool output from the streaming protocol. We refresh thread
    // history for sidebar/branch UI but skip replacing chat messages to
    // avoid overwriting rich output with DB-loaded versions that may be
    // incomplete (race with server-side onFinish persistence) or serialized
    // differently.
    void refreshThreadHistory(activeSessionId, lastMessage.id, {
      skipMessageUpdate: true,
    });
  }, [
    getCurrentMessages,
    invalidateThreadQueries,
    lastSyncedAssistantMessageIdRef,
    refreshThreadHistory,
    sessionRef,
    status,
  ]);

  return {
    ensureSession,
    selectPathToMessageId,
    selectBranchByMessageId,
    switchToSession,
  };
}
