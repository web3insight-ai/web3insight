import { ChevronRightIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn-dialog";

interface CopilotSettingsDialogProps {
  onManageArchivedChats: () => void;
  onManageMcpTokens: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function CopilotSettingsDialog({
  onManageArchivedChats,
  onManageMcpTokens,
  onOpenChange,
  open,
}: CopilotSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] p-0 sm:max-w-3xl">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-balance">Copilot settings</DialogTitle>
          <DialogDescription className="text-pretty">
            Manage your chat history, archived conversations, and MCP access
            tokens.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 p-4 sm:p-6">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-[2px] border border-rule px-4 py-3 text-left transition-colors hover:bg-muted/40"
            onClick={() => {
              onOpenChange(false);
              onManageArchivedChats();
            }}
          >
            <span>
              <span className="block text-sm font-medium">Archived chats</span>
              <span className="text-muted-foreground block text-sm text-pretty">
                View archived chats and unarchive or delete them.
              </span>
            </span>
            <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-between rounded-[2px] border border-rule px-4 py-3 text-left transition-colors hover:bg-muted/40"
            onClick={() => {
              onOpenChange(false);
              onManageMcpTokens();
            }}
          >
            <span>
              <span className="block text-sm font-medium">
                MCP access tokens
              </span>
              <span className="text-muted-foreground block text-sm text-pretty">
                Issue and revoke personal tokens for MCP clients (Claude
                Desktop, Cursor, VS Code).
              </span>
            </span>
            <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
