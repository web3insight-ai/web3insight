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
import { Textarea } from "@/components/ui/textarea";

interface CopilotFeedbackDialogProps {
  comment: string;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onCommentChange: (value: string) => void;
  onSubmit: () => void;
}

export function CopilotFeedbackDialog({
  comment,
  isOpen,
  isSubmitting,
  onClose,
  onCommentChange,
  onSubmit,
}: CopilotFeedbackDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          return;
        }

        onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tell us what went wrong</DialogTitle>
          <DialogDescription>
            Optional details help us improve AI quality.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={comment}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder="Share what was incorrect or missing..."
        />
        <DialogFooter>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            ) : null}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
