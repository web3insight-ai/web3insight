import { z } from "zod";
import type { CopilotUIMessage } from "~/ai/copilot-types";

import type { ThreadHistoryEntry, ThreadItem } from "../types";

interface RawThreadItem {
  createdAt?: string;
  lastActiveAt?: string;
  remoteId: string;
  title?: string | null;
}

interface RawHistoryRow {
  message: unknown;
  parentId: string | null;
}

const copilotUIMessagePartSchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

const copilotUIMessageSchema = z
  .object({
    id: z.string(),
    role: z.enum(["assistant", "system", "user"]),
    metadata: z.unknown().optional(),
    parts: z.array(copilotUIMessagePartSchema),
  })
  .passthrough();

function parseCopilotUIMessage(value: unknown): CopilotUIMessage | null {
  const parsed = copilotUIMessageSchema.safeParse(value);
  return parsed.success ? (parsed.data as CopilotUIMessage) : null;
}

export function mapHistoryRowsToEntries(
  rows: readonly RawHistoryRow[],
): ThreadHistoryEntry[] {
  return rows.flatMap((row) => {
    const parsed = parseCopilotUIMessage(row.message);
    if (!parsed) {
      return [];
    }

    return [
      {
        message: parsed,
        parentId: row.parentId ?? null,
      },
    ];
  });
}

export function mapThreads(
  rawThreads: readonly RawThreadItem[],
  isArchived: boolean,
): ThreadItem[] {
  return rawThreads.map((thread) => ({
    createdAt: thread.createdAt,
    isArchived,
    lastActiveAt: thread.lastActiveAt,
    remoteId: thread.remoteId,
    title: thread.title,
  }));
}

export function getThreadById(
  historyThreads: readonly ThreadItem[],
  archivedThreads: readonly ThreadItem[],
  targetSessionId: string,
): ThreadItem | null {
  return (
    historyThreads.find((thread) => thread.remoteId === targetSessionId) ??
    archivedThreads.find((thread) => thread.remoteId === targetSessionId) ??
    null
  );
}
