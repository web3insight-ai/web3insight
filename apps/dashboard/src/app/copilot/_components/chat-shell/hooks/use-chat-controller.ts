"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import type { ChatStatus } from "ai";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { CopilotUIMessage } from "~/ai/copilot-types";
import type { CopilotChatFinishHandler } from "../lib/chat-instance-cache";
import { getOrCreateCopilotChatInstance } from "../lib/chat-instance-cache";
import { copilotSessionIdAtom } from "../state/atoms";
import type { CopilotThreadQueryState, ThreadItem } from "../types";
import { useCopilotRuntimeActions } from "./use-chat-runtime-actions";
import { useCopilotSessionLifecycle } from "./use-session-lifecycle";
import { useCopilotThreadQueries } from "./use-thread-queries";

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
 * Rewired to use the per-session chat instance pool (chat-instance-cache.ts)
 * so switching sessions or refreshing the page can resume an in-flight
 * stream via `useChat({ resume: true })` + the new GET /api/ai/chat/resume.
 *
 * The `initialRemoteId` prop has been dropped — `usePathname` inside
 * `useCopilotSessionLifecycle` handles bootstrap from the URL.
 */
export function useCopilotChatController(): CopilotChatControllerState {
  const queryClient = useQueryClient();
  const activeSessionId = useAtomValue(copilotSessionIdAtom);

  const switchRequestIdRef = useRef(0);
  const isCreatingSessionRef = useRef<Promise<string> | null>(null);
  const lastSyncedAssistantMessageIdRef = useRef<string | null>(null);
  const finishHandlerRef = useRef<CopilotChatFinishHandler>(() => {
    /* assigned after lifecycle exposes handleChatFinish */
  });
  const sessionRef = useRef<string | null>(activeSessionId);
  const statusRef = useRef<ChatStatus>("ready");
  const stopRef = useRef<() => void>(() => {
    /* assigned after useChat returns */
  });

  const invalidateThreadQueries = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["copilot", "threads"],
      exact: false,
    });
  }, [queryClient]);

  const getChatEntry = useCallback(
    (sessionId: string | null) =>
      getOrCreateCopilotChatInstance({
        getFinishHandler: () => finishHandlerRef.current,
        invalidateThreadQueries,
        sessionId,
      }),
    [invalidateThreadQueries],
  );

  const chatEntry = useMemo(
    () => getChatEntry(activeSessionId),
    [activeSessionId, getChatEntry],
  );

  const { error, messages, regenerate, sendMessage, status, stop } =
    useChat<CopilotUIMessage>({
      chat: chatEntry.chat,
      experimental_throttle: 50,
      resume: true,
    });

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    sessionRef.current = activeSessionId;
  }, [activeSessionId, sessionRef]);

  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  const getCurrentMessages = useCallback(() => [...messages], [messages]);

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
    handleChatFinish,
    selectPathToMessageId,
    selectBranchByMessageId,
    switchToSession,
  } = useCopilotSessionLifecycle({
    getChatEntry,
    invalidateThreadQueries,
    isCreatingSessionRef,
    lastSyncedAssistantMessageIdRef,
    sessionRef,
    statusRef,
    switchRequestIdRef,
  });

  // Reason: Keep the finish handler ref + cache entry pointing at the latest
  // lifecycle callback so the asynchronous onFinish event always resolves
  // against the current session's state.
  useEffect(() => {
    finishHandlerRef.current = handleChatFinish;
    chatEntry.onFinishRef.current = handleChatFinish;
  }, [chatEntry, handleChatFinish]);

  useCopilotRuntimeActions({
    archivedQuery,
    ensureSession,
    getChatEntry,
    getCurrentMessages,
    historyQuery,
    invalidateThreadQueries,
    regenerate,
    selectPathToMessageId,
    selectBranchByMessageId,
    sendMessage,
    sessionRef,
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
