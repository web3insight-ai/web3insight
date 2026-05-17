import type { CopilotUIMessage } from "~/ai/copilot-types";

export interface CopilotThreadQueryState {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
}

export type SessionNavigationMode = "none" | "push" | "replace";
export type ThreadAction = "archive" | "delete" | "unarchive";
export type FeedbackType = "thumbs_up" | "thumbs_down";

export interface ThreadItem {
  createdAt?: string;
  lastActiveAt?: string;
  remoteId: string;
  title?: string | null;
  isArchived: boolean;
}

export interface SwitchSessionOptions {
  fallbackToNewOnError?: boolean;
  navigation?: SessionNavigationMode;
}

export interface ThreadHistoryEntry {
  message: CopilotUIMessage;
  parentId: string | null;
}

export interface ThreadHistoryNode extends ThreadHistoryEntry {
  order: number;
}

export interface MessageBranchMeta {
  currentIndex: number;
  parentKey: string;
  siblings: ThreadHistoryNode[];
}

export interface CopilotRuntimeActions {
  createNewChat: () => void;
  deleteThreadById: (sessionId: string) => Promise<boolean>;
  executeThreadAction: (action: ThreadAction) => Promise<void>;
  loadMoreArchived: () => void;
  loadMoreHistory: () => void;
  regenerateMessage: (messageId: string) => Promise<void>;
  selectBranch: (branchMeta: MessageBranchMeta, nextIndex: number) => void;
  selectHistoryThread: (thread: ThreadItem) => void;
  sendMessage: (text: string) => Promise<void>;
  submitEditedMessage: (
    messageId: string,
    nextText: string,
  ) => Promise<boolean>;
  submitFeedback: (
    messageId: string,
    type: FeedbackType,
    comment?: string,
  ) => Promise<boolean>;
  stopGeneration: () => void;
  unarchiveThreadById: (sessionId: string) => Promise<boolean>;
}

export interface CopilotActions {
  createNewChat: () => void;
  deleteThreadById: (sessionId: string) => Promise<boolean>;
  executeThreadAction: (action: ThreadAction) => Promise<void>;
  loadMoreArchived: () => void;
  loadMoreHistory: () => void;
  regenerateMessage: (messageId: string) => Promise<void>;
  selectBranch: (branchMeta: MessageBranchMeta, nextIndex: number) => void;
  selectHistoryThread: (thread: ThreadItem) => void;
  sendMessage: (text: string) => Promise<void>;
  sendStarterPrompt: (prompt: string) => void;
  setSessionMenuOpen: (open: boolean) => void;
  submitEditedMessage: (
    messageId: string,
    nextText: string,
  ) => Promise<boolean>;
  submitFeedback: (
    messageId: string,
    type: FeedbackType,
    comment?: string,
  ) => Promise<boolean>;
  stopGeneration: () => void;
  unarchiveThreadById: (sessionId: string) => Promise<boolean>;
}
