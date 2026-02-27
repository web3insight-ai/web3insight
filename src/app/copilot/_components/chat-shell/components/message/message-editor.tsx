import type { ChatStatus } from "ai";
import type { KeyboardEvent } from "react";
import { ShadcnButton as Button } from "@/components/ui/shadcn-button";
import { Textarea } from "@/components/ui/textarea";

interface CopilotMessageEditorProps {
  draft: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  status: ChatStatus;
}

export function CopilotMessageEditor({
  draft,
  isSubmitting,
  onCancel,
  onDraftChange,
  onSubmit,
  status,
}: CopilotMessageEditorProps) {
  const isSubmitDisabled =
    status !== "ready" || isSubmitting || draft.trim().length === 0;
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.nativeEvent.isComposing ||
      isSubmitDisabled
    ) {
      return;
    }

    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="ml-auto w-full max-w-xl overflow-hidden rounded-xl border border-border p-3 transition-colors focus-within:border-primary dark:border-border-dark dark:focus-within:border-primary [&_textarea]:!bg-transparent [&_textarea]:!ring-0 [&_textarea]:!shadow-none [&_textarea]:!outline-none [&_textarea]:!resize-none [&_textarea:focus]:!ring-0 [&_textarea:focus]:!shadow-none [&_textarea:focus]:!outline-none">
      <Textarea
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[96px] border-0 bg-transparent px-0 py-0 focus-visible:ring-0"
        placeholder="Edit your message..."
      />
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitDisabled}>
          {isSubmitting ? "Updating..." : "Update"}
        </Button>
      </div>
    </div>
  );
}
