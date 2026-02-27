import type { ChatStatus } from "ai";
import { useSetAtom, useStore } from "jotai";
import type { RefObject } from "react";
import { useCallback, useEffect, useMemo } from "react";
import type { CopilotUIMessage } from "~/ai/copilot-types";
import {
  copilotIsSessionMenuOpenAtom,
  copilotIsThreadActionPendingAtom,
  copilotRuntimeActionsAtom,
  copilotSessionIdAtom,
} from "../state/atoms";
import type {
  CopilotRuntimeActions,
  FeedbackType,
  MessageBranchMeta,
  SwitchSessionOptions,
  ThreadAction,
  ThreadItem,
} from "../types";

interface ThreadQueryControls {
  fetchNextPage: () => Promise<unknown>;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
}

type SendMessageFn = (message?: {
  text: string;
  messageId?: string;
}) => Promise<void>;
type RegenerateFn = (options: { messageId: string }) => Promise<void>;
type SetMessagesFn = (
  messages:
    | CopilotUIMessage[]
    | ((messages: CopilotUIMessage[]) => CopilotUIMessage[]),
) => void;

interface UseCopilotRuntimeActionsProps {
  archivedQuery: ThreadQueryControls;
  ensureSession: () => Promise<string>;
  getCurrentMessages: () => CopilotUIMessage[];
  historyQuery: ThreadQueryControls;
  invalidateThreadQueries: () => void;
  regenerate: RegenerateFn;
  selectPathToMessageId: (targetMessageId: string) => boolean;
  selectBranchByMessageId: (parentKey: string, targetMessageId: string) => void;
  setMessages: SetMessagesFn;
  sendMessage: SendMessageFn;
  sessionRef: RefObject<string | null>;
  statusRef: RefObject<ChatStatus>;
  stopRef: RefObject<() => void>;
  switchToSession: (
    nextSessionId: string | null,
    options?: SwitchSessionOptions,
  ) => Promise<boolean>;
}

/**
 * Wires up all runtime actions (send, regenerate, feedback, thread CRUD,
 * pagination, branch selection) and publishes them to Jotai so that any
 * component in the tree can trigger copilot operations.
 *
 * All backend mutations use direct fetch calls instead of oRPC.
 */
export function useCopilotRuntimeActions({
  archivedQuery,
  ensureSession,
  getCurrentMessages,
  historyQuery,
  invalidateThreadQueries,
  regenerate,
  selectPathToMessageId,
  selectBranchByMessageId,
  setMessages,
  sendMessage,
  sessionRef,
  statusRef,
  stopRef,
  switchToSession,
}: UseCopilotRuntimeActionsProps) {
  const jotaiStore = useStore();
  const setIsSessionMenuOpenState = useSetAtom(copilotIsSessionMenuOpenAtom);
  const setIsThreadActionPending = useSetAtom(copilotIsThreadActionPendingAtom);
  const setRuntimeActions = useSetAtom(copilotRuntimeActionsAtom);
  const {
    fetchNextPage: fetchNextArchivedPage,
    hasNextPage: hasNextArchivedPage,
    isFetchingNextPage: isFetchingArchivedNextPage,
  } = archivedQuery;
  const {
    fetchNextPage: fetchNextHistoryPage,
    hasNextPage: hasNextHistoryPage,
    isFetchingNextPage: isFetchingHistoryNextPage,
  } = historyQuery;

  const handleSendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      await ensureSession();
      await sendMessage({ text: trimmed });
    },
    [ensureSession, sendMessage],
  );

  const handleRegenerate = useCallback(
    async (messageId: string) => {
      if (statusRef.current !== "ready") {
        return;
      }

      await ensureSession();

      const currentMessages = getCurrentMessages();
      if (!currentMessages.some((message) => message.id === messageId)) {
        const didSelectPath = selectPathToMessageId(messageId);
        if (!didSelectPath) {
          return;
        }
      }

      try {
        await regenerate({ messageId });
      } catch (regenerateError) {
        // Reason: The message might not be in the Chat instance's internal state
        // if the user navigated branches. Attempt to sync the branch first.
        const isMissingMessageError =
          regenerateError instanceof Error &&
          regenerateError.message.includes(`message ${messageId} not found`);
        if (!isMissingMessageError) {
          console.error(
            "[copilot-thread] Failed to regenerate message:",
            regenerateError,
          );
          return;
        }

        const didSelectPath = selectPathToMessageId(messageId);
        if (!didSelectPath) {
          console.error(
            "[copilot-thread] Regenerate target message is not available:",
            messageId,
          );
          return;
        }

        try {
          await regenerate({ messageId });
        } catch (retryError) {
          console.error(
            "[copilot-thread] Failed to regenerate message after branch sync:",
            retryError,
          );
        }
      }
    },
    [
      ensureSession,
      getCurrentMessages,
      regenerate,
      selectPathToMessageId,
      statusRef,
    ],
  );

  const submitFeedbackForMessage = useCallback(
    async (messageId: string, type: FeedbackType, comment?: string) => {
      const activeSessionId = sessionRef.current;
      if (!activeSessionId) {
        return false;
      }

      const trimmedComment = comment?.trim();

      try {
        const res = await fetch(
          `/api/ai/sessions/${activeSessionId}/feedback`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messageId,
              type,
              comment:
                trimmedComment && trimmedComment.length > 0
                  ? trimmedComment
                  : undefined,
            }),
          },
        );

        return res.ok;
      } catch (feedbackError) {
        console.error(
          "[copilot-feedback] Failed to submit feedback:",
          feedbackError,
        );
        return false;
      }
    },
    [sessionRef],
  );

  const handleSubmitEditedMessage = useCallback(
    async (messageId: string, nextText: string) => {
      if (statusRef.current !== "ready") {
        return false;
      }

      const trimmed = nextText.trim();
      if (!trimmed) {
        return false;
      }

      const currentMessages = getCurrentMessages();
      const messageIndex = currentMessages.findIndex(
        (message) => message.id === messageId,
      );
      const targetMessage = currentMessages[messageIndex];
      if (
        messageIndex === -1 ||
        !targetMessage ||
        targetMessage.role !== "user"
      ) {
        return false;
      }

      const editedUserMessage: CopilotUIMessage = {
        ...targetMessage,
        id: crypto.randomUUID(),
        parts: [{ type: "text", text: trimmed }],
        role: "user",
      };

      await ensureSession();
      setMessages([
        ...currentMessages.slice(0, messageIndex),
        editedUserMessage,
      ]);
      await sendMessage();
      return true;
    },
    [ensureSession, getCurrentMessages, sendMessage, setMessages, statusRef],
  );

  const handleBranchChange = useCallback(
    (branchMeta: MessageBranchMeta, nextIndex: number) => {
      if (statusRef.current !== "ready") {
        return;
      }

      const nextNode = branchMeta.siblings[nextIndex];
      if (!nextNode) {
        return;
      }

      selectBranchByMessageId(branchMeta.parentKey, nextNode.message.id);
    },
    [selectBranchByMessageId, statusRef],
  );

  /**
   * Executes a thread mutation (archive/unarchive/delete) by calling the
   * appropriate REST endpoint. Resets the active session when archiving or
   * deleting the currently active thread.
   */
  const mutateThreadById = useCallback(
    async (targetSessionId: string, action: ThreadAction) => {
      if (
        !targetSessionId ||
        jotaiStore.get(copilotIsThreadActionPendingAtom)
      ) {
        return false;
      }

      setIsThreadActionPending(true);

      try {
        switch (action) {
        case "archive": {
          const res = await fetch(
            `/api/ai/sessions/${targetSessionId}/archive`,
            { method: "POST" },
          );
          if (!res.ok) {
            throw new Error("Failed to archive thread");
          }
          break;
        }
        case "unarchive": {
          const res = await fetch(
            `/api/ai/sessions/${targetSessionId}/unarchive`,
            { method: "POST" },
          );
          if (!res.ok) {
            throw new Error("Failed to unarchive thread");
          }
          break;
        }
        case "delete": {
          const res = await fetch(`/api/ai/sessions/${targetSessionId}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            throw new Error("Failed to delete thread");
          }
          break;
        }
        default: {
          const unreachableAction: never = action;
          throw new Error(`Unhandled thread action: ${unreachableAction}`);
        }
        }

        const activeSessionId = jotaiStore.get(copilotSessionIdAtom);
        const shouldResetActiveSession =
          activeSessionId === targetSessionId &&
          (action === "archive" || action === "delete");
        if (shouldResetActiveSession) {
          await switchToSession(null, { navigation: "push" });
        }

        invalidateThreadQueries();
        return true;
      } catch (actionError) {
        console.error(
          `[copilot-thread] Failed to ${action} thread ${targetSessionId}:`,
          actionError,
        );
        return false;
      } finally {
        setIsThreadActionPending(false);
      }
    },
    [
      invalidateThreadQueries,
      jotaiStore,
      setIsThreadActionPending,
      switchToSession,
    ],
  );

  const executeThreadAction = useCallback(
    async (action: ThreadAction) => {
      const activeSessionId = jotaiStore.get(copilotSessionIdAtom);
      if (!activeSessionId) {
        return;
      }

      await mutateThreadById(activeSessionId, action);
    },
    [jotaiStore, mutateThreadById],
  );

  const unarchiveThreadById = useCallback(
    async (sessionId: string) => {
      return mutateThreadById(sessionId, "unarchive");
    },
    [mutateThreadById],
  );

  const deleteThreadById = useCallback(
    async (sessionId: string) => {
      return mutateThreadById(sessionId, "delete");
    },
    [mutateThreadById],
  );

  const loadMoreArchived = useCallback(() => {
    if (!isFetchingArchivedNextPage && hasNextArchivedPage) {
      void fetchNextArchivedPage();
    }
  }, [fetchNextArchivedPage, hasNextArchivedPage, isFetchingArchivedNextPage]);

  const loadMoreHistory = useCallback(() => {
    if (!isFetchingHistoryNextPage && hasNextHistoryPage) {
      void fetchNextHistoryPage();
    }
  }, [fetchNextHistoryPage, hasNextHistoryPage, isFetchingHistoryNextPage]);

  const selectHistoryThread = useCallback(
    (thread: ThreadItem) => {
      setIsSessionMenuOpenState(false);
      void switchToSession(thread.remoteId, {
        fallbackToNewOnError: true,
        navigation: "push",
      });
    },
    [setIsSessionMenuOpenState, switchToSession],
  );

  const runtimeActions = useMemo<CopilotRuntimeActions>(() => {
    return {
      createNewChat: () => {
        void switchToSession(null, { navigation: "push" });
      },
      deleteThreadById,
      executeThreadAction,
      loadMoreArchived,
      loadMoreHistory,
      regenerateMessage: handleRegenerate,
      selectBranch: handleBranchChange,
      selectHistoryThread,
      sendMessage: handleSendMessage,
      submitEditedMessage: handleSubmitEditedMessage,
      submitFeedback: submitFeedbackForMessage,
      stopGeneration: () => {
        stopRef.current();
      },
      unarchiveThreadById,
    };
  }, [
    deleteThreadById,
    executeThreadAction,
    loadMoreArchived,
    loadMoreHistory,
    handleRegenerate,
    handleBranchChange,
    selectHistoryThread,
    handleSendMessage,
    handleSubmitEditedMessage,
    submitFeedbackForMessage,
    stopRef,
    unarchiveThreadById,
    switchToSession,
  ]);

  // Reason: Publish the runtime actions to a global Jotai atom so that any
  // component (e.g. the sidebar, message toolbar) can invoke them without
  // deep prop drilling.
  useEffect(() => {
    setRuntimeActions(runtimeActions);

    return () => {
      setRuntimeActions(null);
    };
  }, [runtimeActions, setRuntimeActions]);
}
