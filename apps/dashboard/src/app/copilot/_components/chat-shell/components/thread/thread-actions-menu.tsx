import { useAtomValue } from "jotai";
import {
  ArchiveIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PlusIcon,
  Share2Icon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";

import { ShadcnButton as Button } from "@/components/ui/shadcn-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn-dropdown-menu";

import { useCopilotActions } from "../../state/actions";
import {
  copilotIsThreadActionPendingAtom,
  copilotSessionIdAtom,
} from "../../state/atoms";
import type { CopilotThreadQueryState, ThreadItem } from "../../types";
import { CopilotShareDialog } from "./share-dialog";
import { CopilotThreadSettings } from "./thread-settings";

interface CopilotThreadActionsMenuProps {
  archivedQueryState: CopilotThreadQueryState;
  archivedThreads: ThreadItem[];
}

export function CopilotThreadActionsMenu({
  archivedQueryState,
  archivedThreads,
}: CopilotThreadActionsMenuProps) {
  const actions = useCopilotActions();
  const sessionId = useAtomValue(copilotSessionIdAtom);
  const isPending = useAtomValue(copilotIsThreadActionPendingAtom);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const isCurrentThreadArchived = Boolean(
    sessionId &&
    archivedThreads.some((thread) => thread.remoteId === sessionId),
  );
  const hasActiveSession = Boolean(sessionId);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5"
        onClick={actions.createNewChat}
      >
        <PlusIcon className="size-3.5" />
        New chat
      </Button>

      <CopilotThreadSettings
        archivedQueryState={archivedQueryState}
        archivedThreads={archivedThreads}
      />

      {hasActiveSession ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="More thread actions"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <MoreHorizontalIcon className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={isPending}
              onSelect={() => {
                setIsShareDialogOpen(true);
              }}
            >
              <Share2Icon className="mr-2 size-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isCurrentThreadArchived ? (
              <DropdownMenuItem
                disabled={isPending}
                onSelect={() => {
                  void actions.executeThreadAction("unarchive");
                }}
              >
                <ArchiveIcon className="mr-2 size-4" />
                Unarchive
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={isPending}
                onSelect={() => {
                  void actions.executeThreadAction("archive");
                }}
              >
                <ArchiveIcon className="mr-2 size-4" />
                Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={isPending}
              onSelect={() => {
                void actions.executeThreadAction("delete");
              }}
            >
              <TrashIcon className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      {sessionId ? (
        <CopilotShareDialog
          isOpen={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          sessionId={sessionId}
        />
      ) : null}
    </div>
  );
}
