"use client";

const noop = () => {
  /* placeholder assigned by useChatRuntimeActions */
};

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import type { ChatStatus } from "ai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { CopilotUIMessage } from "~/ai/copilot-types";
import { getOrCreateCopilotChatInstance } from "../lib/chat-instance-cache";
import type { CopilotThreadQueryState, ThreadItem } from "../types";
import { useCopilotRuntimeActions } from "./use-chat-runtime-actions";
import { useCopilotSessionLifecycle } from "./use-session-lifecycle";
import { useCopilotThreadQueries } from "./use-thread-queries";

interface UseCopilotChatControllerProps {
  initialRemoteId: string | null;
}

interface CopilotChatControllerState {
  archivedQueryState: CopilotThreadQueryState;
  archivedThreads: ThreadItem[];
  error: Error | undefined;
  historyQueryState: CopilotThreadQueryState;
  historyThreads: ThreadItem[];
  messages: CopilotUIMessage[];
  status: ChatStatus;
}

/**
 * Top-level orchestrator hook that ties together thread queries, session
 * lifecycle, and runtime actions into a single coherent state object.
 *
 * This is the only hook that page-level components need to consume.
 * All euka-specific props (storeId, sellerId, region) have been removed.
 */
export function useCopilotChatController({
  initialRemoteId,
}: UseCopilotChatControllerProps): CopilotChatControllerState {
  const queryClient = useQueryClient();

  const switchRequestIdRef = useRef(0);
  const isCreatingSessionRef = useRef<Promise<string> | null>(null);
  const lastSyncedAssistantMessageIdRef = useRef<string | null>(null);
  const statusRef = useRef<ChatStatus>("ready");
  // Reason: noop callbacks assigned later by useChatRuntimeActions
  const stopRef = useRef<() => void>(noop);
  const clearErrorRef = useRef<() => void>(noop);

  const invalidateThreadQueries = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["copilot", "threads"],
      exact: false,
    });
  }, [queryClient]);

  const chatEntry = useMemo(() => {
    return getOrCreateCopilotChatInstance({
      invalidateThreadQueries,
    });
  }, [invalidateThreadQueries]);

  const {
    clearError,
    error,
    messages,
    regenerate,
    sendMessage,
    setMessages,
    status,
    stop,
  } = useChat<CopilotUIMessage>({
    chat: chatEntry.chat,
    experimental_throttle: 50,
  });

  const setMessagesRef = useRef(setMessages);

  // Reason: Keep refs in sync with the latest callback identities so that
  // imperative code (e.g. session switching, abort) works correctly.
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  useEffect(() => {
    clearErrorRef.current = clearError;
  }, [clearError]);

  useEffect(() => {
    setMessagesRef.current = setMessages;
  }, [setMessages]);

  const getCurrentMessages = useCallback(() => {
    return [...messages];
  }, [messages]);

  const {
    archivedQuery,
    archivedQueryState,
    archivedThreads,
    historyQuery,
    historyQueryState,
    historyThreads,
  } = useCopilotThreadQueries();

  const {
    ensureSession,
    selectPathToMessageId,
    selectBranchByMessageId,
    switchToSession,
  } = useCopilotSessionLifecycle({
    clearErrorRef,
    getCurrentMessages,
    initialRemoteId,
    invalidateThreadQueries,
    isCreatingSessionRef,
    lastSyncedAssistantMessageIdRef,
    sessionRef: chatEntry.sessionRef,
    setMessagesRef,
    status,
    statusRef,
    stopRef,
    switchRequestIdRef,
  });

  useCopilotRuntimeActions({
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
    sessionRef: chatEntry.sessionRef,
    statusRef,
    stopRef,
    switchToSession,
  });

  return {
    archivedQueryState,
    archivedThreads,
    error,
    historyQueryState,
    historyThreads,
    messages,
    status,
  };
}
