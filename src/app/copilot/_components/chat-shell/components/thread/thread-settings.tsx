"use client";

import { useAtomValue } from "jotai";
import { SettingsIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { useCallback, useState } from "react";

import { ShadcnButton as Button } from "@/components/ui/shadcn-button";

import { useCopilotActions } from "../../state/actions";
import { copilotIsThreadActionPendingAtom } from "../../state/atoms";
import type { CopilotThreadQueryState, ThreadItem } from "../../types";
import { CopilotArchivedChatsDialog } from "../settings/panels/data-control/archived-chats/archived-chats-dialog";
import { CopilotDeleteArchivedChatDialog } from "../settings/panels/data-control/archived-chats/delete-archived-chat-dialog";
import {
  COPILOT_ARCHIVED_CHATS_DIALOG_QUERY_KEY,
  COPILOT_SETTINGS_DIALOG_QUERY_KEY,
  copilotDialogOpenParser,
} from "../settings/query-state";
import { CopilotSettingsDialog } from "../settings/settings-dialog";

interface CopilotThreadSettingsProps {
  archivedQueryState: CopilotThreadQueryState;
  archivedThreads: ThreadItem[];
}

export function CopilotThreadSettings({
  archivedQueryState,
  archivedThreads,
}: CopilotThreadSettingsProps) {
  const actions = useCopilotActions();
  const isPending = useAtomValue(copilotIsThreadActionPendingAtom);

  const [archivedChatsDialogState, setArchivedChatsDialogState] = useQueryState(
    COPILOT_ARCHIVED_CHATS_DIALOG_QUERY_KEY,
    copilotDialogOpenParser,
  );
  const [settingsDialogState, setSettingsDialogState] = useQueryState(
    COPILOT_SETTINGS_DIALOG_QUERY_KEY,
    copilotDialogOpenParser,
  );

  const [deleteCandidate, setDeleteCandidate] = useState<ThreadItem | null>(
    null,
  );
  const [dialogError, setDialogError] = useState<string | null>(null);

  const isArchivedDialogOpen = archivedChatsDialogState === "open";
  const isSettingsDialogOpen = settingsDialogState === "open";

  const handleSettingsDialogOpenChange = useCallback(
    (open: boolean) => {
      void setSettingsDialogState(open ? "open" : null);
    },
    [setSettingsDialogState],
  );

  const handleArchivedDialogOpenChange = useCallback(
    (open: boolean) => {
      void setArchivedChatsDialogState(open ? "open" : null);

      if (!open) {
        setDeleteCandidate(null);
        setDialogError(null);
      }
    },
    [setArchivedChatsDialogState],
  );

  const handleDeleteThread = useCallback(
    async (sessionId: string) => {
      setDialogError(null);
      const didDelete = await actions.deleteThreadById(sessionId);
      if (!didDelete) {
        setDialogError("Could not delete this chat. Please try again.");
        return false;
      }

      return true;
    },
    [actions],
  );

  const handleUnarchiveThread = useCallback(
    async (sessionId: string) => {
      setDialogError(null);
      const didUnarchive = await actions.unarchiveThreadById(sessionId);
      if (!didUnarchive) {
        setDialogError("Could not unarchive this chat. Please try again.");
      }
    },
    [actions],
  );

  const handleConfirmDelete = useCallback(
    async (thread: ThreadItem) => {
      const didDelete = await handleDeleteThread(thread.remoteId);
      if (didDelete) {
        setDeleteCandidate(null);
      }
    },
    [handleDeleteThread],
  );

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        aria-label="Open Copilot settings"
        onClick={() => {
          handleSettingsDialogOpenChange(true);
        }}
      >
        <SettingsIcon className="size-4" />
      </Button>

      <CopilotSettingsDialog
        open={isSettingsDialogOpen}
        onOpenChange={handleSettingsDialogOpenChange}
        onManageArchivedChats={() => {
          handleArchivedDialogOpenChange(true);
        }}
      />

      <CopilotArchivedChatsDialog
        open={isArchivedDialogOpen}
        onOpenChange={handleArchivedDialogOpenChange}
        archivedThreads={archivedThreads}
        archivedQueryState={archivedQueryState}
        dialogError={dialogError}
        isPending={isPending}
        onDeleteRequest={setDeleteCandidate}
        onLoadMore={actions.loadMoreArchived}
        onUnarchive={(sessionId) => {
          void handleUnarchiveThread(sessionId);
        }}
      />

      <CopilotDeleteArchivedChatDialog
        targetThread={deleteCandidate}
        isPending={isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteCandidate(null);
          }
        }}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}
