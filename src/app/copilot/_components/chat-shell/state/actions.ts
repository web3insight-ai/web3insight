import { atom, useSetAtom } from "jotai";
import { useCallback, useMemo } from "react";

import type {
  CopilotActions,
  FeedbackType,
  MessageBranchMeta,
  ThreadAction,
  ThreadItem,
} from "../types";
import {
  copilotIsSessionMenuOpenAtom,
  copilotRuntimeActionsAtom,
} from "./atoms";

const copilotCreateNewChatActionAtom = atom(null, (get) => {
  const runtime = get(copilotRuntimeActionsAtom);
  if (!runtime) {
    return;
  }

  runtime.createNewChat();
});

const copilotDeleteThreadByIdActionAtom = atom(
  null,
  async (get, _set, sessionId: string) => {
    const runtime = get(copilotRuntimeActionsAtom);
    if (!runtime) {
      return false;
    }

    return runtime.deleteThreadById(sessionId);
  },
);

const copilotExecuteThreadActionAtom = atom(
  null,
  async (get, _set, action: ThreadAction) => {
    const runtime = get(copilotRuntimeActionsAtom);
    if (!runtime) {
      return;
    }

    await runtime.executeThreadAction(action);
  },
);

const copilotLoadMoreHistoryActionAtom = atom(null, (get) => {
  const runtime = get(copilotRuntimeActionsAtom);
  if (!runtime) {
    return;
  }

  runtime.loadMoreHistory();
});

const copilotLoadMoreArchivedActionAtom = atom(null, (get) => {
  const runtime = get(copilotRuntimeActionsAtom);
  if (!runtime) {
    return;
  }

  runtime.loadMoreArchived();
});

const copilotRegenerateMessageActionAtom = atom(
  null,
  async (get, _set, messageId: string) => {
    const runtime = get(copilotRuntimeActionsAtom);
    if (!runtime) {
      return;
    }

    await runtime.regenerateMessage(messageId);
  },
);

const copilotSelectBranchActionAtom = atom(
  null,
  (
    get,
    _set,
    payload: { branchMeta: MessageBranchMeta; nextIndex: number },
  ) => {
    const runtime = get(copilotRuntimeActionsAtom);
    if (!runtime) {
      return;
    }

    runtime.selectBranch(payload.branchMeta, payload.nextIndex);
  },
);

const copilotSelectHistoryThreadActionAtom = atom(
  null,
  (get, _set, thread: ThreadItem) => {
    const runtime = get(copilotRuntimeActionsAtom);
    if (!runtime) {
      return;
    }

    runtime.selectHistoryThread(thread);
  },
);

const copilotSendMessageActionAtom = atom(
  null,
  async (get, _set, text: string) => {
    const runtime = get(copilotRuntimeActionsAtom);
    if (!runtime) {
      return;
    }

    await runtime.sendMessage(text);
  },
);

const copilotSubmitEditedMessageActionAtom = atom(
  null,
  async (get, _set, payload: { messageId: string; nextText: string }) => {
    const runtime = get(copilotRuntimeActionsAtom);
    if (!runtime) {
      return false;
    }

    return runtime.submitEditedMessage(payload.messageId, payload.nextText);
  },
);

const copilotSubmitFeedbackActionAtom = atom(
  null,
  async (
    get,
    _set,
    payload: { comment?: string; messageId: string; type: FeedbackType },
  ) => {
    const runtime = get(copilotRuntimeActionsAtom);
    if (!runtime) {
      return false;
    }

    return runtime.submitFeedback(
      payload.messageId,
      payload.type,
      payload.comment,
    );
  },
);

const copilotStopGenerationActionAtom = atom(null, (get) => {
  const runtime = get(copilotRuntimeActionsAtom);
  if (!runtime) {
    return;
  }

  runtime.stopGeneration();
});

const copilotSetSessionMenuOpenActionAtom = atom(
  null,
  (_get, set, open: boolean) => {
    set(copilotIsSessionMenuOpenAtom, open);
  },
);

const copilotUnarchiveThreadByIdActionAtom = atom(
  null,
  async (get, _set, sessionId: string) => {
    const runtime = get(copilotRuntimeActionsAtom);
    if (!runtime) {
      return false;
    }

    return runtime.unarchiveThreadById(sessionId);
  },
);

export function useCopilotActions(): CopilotActions {
  const createNewChat = useSetAtom(copilotCreateNewChatActionAtom);
  const deleteThreadById = useSetAtom(copilotDeleteThreadByIdActionAtom);
  const executeThreadAction = useSetAtom(copilotExecuteThreadActionAtom);
  const loadMoreHistory = useSetAtom(copilotLoadMoreHistoryActionAtom);
  const loadMoreArchived = useSetAtom(copilotLoadMoreArchivedActionAtom);
  const regenerateMessage = useSetAtom(copilotRegenerateMessageActionAtom);
  const selectBranchAction = useSetAtom(copilotSelectBranchActionAtom);
  const selectHistoryThread = useSetAtom(copilotSelectHistoryThreadActionAtom);
  const sendMessage = useSetAtom(copilotSendMessageActionAtom);
  const submitEditedMessageAction = useSetAtom(
    copilotSubmitEditedMessageActionAtom,
  );
  const submitFeedbackAction = useSetAtom(copilotSubmitFeedbackActionAtom);
  const stopGeneration = useSetAtom(copilotStopGenerationActionAtom);
  const setSessionMenuOpen = useSetAtom(copilotSetSessionMenuOpenActionAtom);
  const unarchiveThreadById = useSetAtom(copilotUnarchiveThreadByIdActionAtom);

  const selectBranch = useCallback(
    (branchMeta: MessageBranchMeta, nextIndex: number) => {
      selectBranchAction({ branchMeta, nextIndex });
    },
    [selectBranchAction],
  );

  const submitEditedMessage = useCallback(
    async (messageId: string, nextText: string) => {
      return submitEditedMessageAction({ messageId, nextText });
    },
    [submitEditedMessageAction],
  );

  const submitFeedback = useCallback(
    async (messageId: string, type: FeedbackType, comment?: string) => {
      return submitFeedbackAction({ comment, messageId, type });
    },
    [submitFeedbackAction],
  );

  const sendStarterPrompt = useCallback(
    (prompt: string) => {
      void sendMessage(prompt);
    },
    [sendMessage],
  );

  return useMemo(
    () => ({
      createNewChat,
      deleteThreadById,
      executeThreadAction,
      loadMoreArchived,
      loadMoreHistory,
      regenerateMessage,
      selectBranch,
      selectHistoryThread,
      sendMessage,
      sendStarterPrompt,
      setSessionMenuOpen,
      submitEditedMessage,
      submitFeedback,
      stopGeneration,
      unarchiveThreadById,
    }),
    [
      createNewChat,
      deleteThreadById,
      executeThreadAction,
      loadMoreArchived,
      loadMoreHistory,
      regenerateMessage,
      selectBranch,
      selectHistoryThread,
      sendMessage,
      sendStarterPrompt,
      setSessionMenuOpen,
      submitEditedMessage,
      submitFeedback,
      stopGeneration,
      unarchiveThreadById,
    ],
  );
}
