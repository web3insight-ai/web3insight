import { Loader2Icon } from "lucide-react";

import { ShadcnButton as Button } from "@/components/ui/shadcn-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn-dialog";

import { FALLBACK_THREAD_TITLE } from "../../../../../constants";
import { renderSessionItemTitle } from "../../../../../lib/message-utils";
import type { ThreadItem } from "../../../../../types";

interface CopilotDeleteArchivedChatDialogProps {
  isPending: boolean;
  onConfirmDelete: (thread: ThreadItem) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  targetThread: ThreadItem | null;
}

export function CopilotDeleteArchivedChatDialog({
  isPending,
  onConfirmDelete,
  onOpenChange,
  targetThread,
}: CopilotDeleteArchivedChatDialogProps) {
  const deleteCandidateTitle = targetThread
    ? renderSessionItemTitle(targetThread)
    : FALLBACK_THREAD_TITLE;

  return (
    <Dialog open={Boolean(targetThread)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-balance">
            Delete archived chat?
          </DialogTitle>
          <DialogDescription className="text-pretty">
            This will permanently delete &quot;
            {deleteCandidateTitle}
            &quot; and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            disabled={isPending}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isPending || !targetThread}
            onClick={(event) => {
              event.preventDefault();
              if (!targetThread) {
                return;
              }

              void onConfirmDelete(targetThread);
            }}
          >
            {isPending ? (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            ) : null}
            Delete chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
