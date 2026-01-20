"use client";

import { MessagePrimitive } from "@assistant-ui/react";
import type { FC } from "react";

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="flex justify-end mb-4">
      <div className="max-w-[85%] bg-primary text-white rounded-2xl rounded-br-md px-4 py-2">
        <MessagePrimitive.Content
          components={{
            Text: ({ text }) => (
              <p className="text-sm leading-relaxed">{text}</p>
            ),
          }}
        />
      </div>
    </MessagePrimitive.Root>
  );
};

export { UserMessage };
