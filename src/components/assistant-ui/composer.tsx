"use client";

import { ComposerPrimitive } from "@assistant-ui/react";
import { Send } from "lucide-react";
import type { FC } from "react";

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="flex gap-2">
      <ComposerPrimitive.Input
        placeholder="Ask a question..."
        className="flex-1 px-3 py-2 text-sm bg-bg-sunken border border-rule rounded-[2px] focus:outline-none focus:border-accent transition-colors"
        autoFocus
      />
      <ComposerPrimitive.Send className="w-9 h-9 flex-shrink-0 bg-accent hover:brightness-105 text-accent-fg rounded-[2px] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        <Send size={16} />
      </ComposerPrimitive.Send>
    </ComposerPrimitive.Root>
  );
};

export { Composer };
