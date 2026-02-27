import type { CopilotUIMessage } from "~/ai/copilot-types";

import { FALLBACK_THREAD_TITLE, MAX_TITLE_LENGTH } from "../constants";
import type { ThreadItem } from "../types";

export function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

export function extractTextFromMessage(message: CopilotUIMessage) {
  return message.parts
    .map((part) => {
      if (part.type !== "text") {
        return "";
      }

      return part.text;
    })
    .join("\n")
    .trim();
}

export function deriveThreadTitleFromMessages(
  messages: readonly CopilotUIMessage[],
) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  if (!firstUserMessage) {
    return null;
  }

  const messageText = extractTextFromMessage(firstUserMessage);
  if (!messageText) {
    return null;
  }

  return truncateText(messageText, MAX_TITLE_LENGTH);
}

export function renderSessionItemTitle(thread: ThreadItem) {
  return thread.title?.trim() || FALLBACK_THREAD_TITLE;
}
