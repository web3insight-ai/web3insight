import dayjs from "dayjs";
import { Loader2Icon, TrashIcon, Undo2Icon } from "lucide-react";

import { ShadcnButton as Button } from "@/components/ui/shadcn-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn-dialog";
import { Tooltip } from "@/components/ui/tooltip";

import { renderSessionItemTitle } from "../../../../../lib/message-utils";
import type { CopilotThreadQueryState, ThreadItem } from "../../../../../types";

interface CopilotArchivedChatsDialogProps {
  archivedQueryState: CopilotThreadQueryState;
  archivedThreads: readonly ThreadItem[];
  dialogError: string | null;
  isPending: boolean;
  onDeleteRequest: (thread: ThreadItem) => void;
  onLoadMore: () => void;
  onOpenChange: (open: boolean) => void;
  onUnarchive: (sessionId: string) => void;
  open: boolean;
}

function formatCreatedDate(value: string | undefined) {
  if (!value || !dayjs(value).isValid()) {
    return "-";
  }

  return dayjs(value).format("MMMM D, YYYY");
}

export function CopilotArchivedChatsDialog({
  archivedQueryState,
  archivedThreads,
  dialogError,
  isPending,
  onDeleteRequest,
  onLoadMore,
  onOpenChange,
  onUnarchive,
  open,
}: CopilotArchivedChatsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-[calc(100%-2rem)] sm:max-w-4xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          const dialogElement = event.currentTarget as HTMLElement;
          const titleElement = dialogElement.querySelector<HTMLElement>(
            '[data-slot="dialog-title"]',
          );
          titleElement?.focus({ preventScroll: true });
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-balance" tabIndex={-1}>
            Archived chats
          </DialogTitle>
          <DialogDescription className="text-pretty">
            Unarchive chats to bring them back into your session menu, or delete
            them permanently.
          </DialogDescription>
        </DialogHeader>

        {dialogError ? (
          <p className="text-destructive text-sm">{dialogError}</p>
        ) : null}

        <div className="max-h-[420px] overflow-y-auto rounded-md border">
          <div className="bg-muted/30 text-muted-foreground grid grid-cols-[minmax(0,1fr)_180px_120px] gap-4 border-b px-4 py-2 text-xs font-medium">
            <span>Name</span>
            <span>Date created</span>
            <span>Actions</span>
          </div>

          {archivedQueryState.isLoading && archivedThreads.length === 0 ? (
            <div className="flex items-center justify-center px-4 py-8 text-sm">
              <Loader2Icon className="mr-2 size-4 animate-spin" />
              Loading archived chats...
            </div>
          ) : null}

          {!archivedQueryState.isLoading && archivedThreads.length === 0 ? (
            <div className="space-y-3 px-4 py-8 text-center">
              <p className="text-muted-foreground text-sm text-pretty">
                You do not have any archived chats.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Close
              </Button>
            </div>
          ) : null}

          {archivedThreads.map((thread) => (
            <div
              key={thread.remoteId}
              className="grid grid-cols-[minmax(0,1fr)_180px_120px] items-center gap-4 border-b px-4 py-3 last:border-b-0"
            >
              <span className="truncate text-sm">
                {renderSessionItemTitle(thread)}
              </span>
              <span className="text-muted-foreground text-sm tabular-nums">
                {formatCreatedDate(thread.createdAt)}
              </span>
              <div className="flex items-center gap-2">
                <Tooltip content="Unarchive chat">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    aria-label="Unarchive chat"
                    disabled={isPending}
                    onClick={() => {
                      onUnarchive(thread.remoteId);
                    }}
                  >
                    {isPending ? (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                      <Undo2Icon className="size-3.5" />
                    )}
                  </Button>
                </Tooltip>

                <Tooltip content="Delete chat">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="size-8"
                    aria-label="Delete archived chat"
                    disabled={isPending}
                    onClick={() => {
                      onDeleteRequest(thread);
                    }}
                  >
                    <TrashIcon className="size-3.5" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>

        {archivedQueryState.hasNextPage ? (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              disabled={archivedQueryState.isFetchingNextPage}
              onClick={onLoadMore}
            >
              {archivedQueryState.isFetchingNextPage ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : null}
              Load more
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
