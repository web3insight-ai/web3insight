"use client";

import { ComposerPrimitive } from "@assistant-ui/react";
import { Send } from "lucide-react";
import type { FC } from "react";

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="flex gap-2">
      <ComposerPrimitive.Input
        placeholder="Ask a question..."
        className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-surface-elevated border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        autoFocus
      />
      <ComposerPrimitive.Send className="w-9 h-9 flex-shrink-0 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        <Send size={16} />
      </ComposerPrimitive.Send>
    </ComposerPrimitive.Root>
  );
};

export { Composer };
