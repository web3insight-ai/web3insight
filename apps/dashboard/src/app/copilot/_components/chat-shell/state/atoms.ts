import { atom } from "jotai";

import type { CopilotRuntimeActions, ThreadHistoryEntry } from "../types";

export const copilotRuntimeActionsAtom = atom<CopilotRuntimeActions | null>(
  null,
);

export const copilotSessionIdAtom = atom<string | null>(null);
export const copilotIsBootstrappingAtom = atom(false);
export const copilotIsSessionMenuOpenAtom = atom(false);
export const copilotIsThreadActionPendingAtom = atom(false);
export const copilotThreadHistoryAtom = atom<ThreadHistoryEntry[]>([]);
export const copilotBranchSelectionAtom = atom<Record<string, string>>({});
