import type { CopilotUIMessage } from "~/ai/copilot-types";

import type { ThreadHistoryEntry, ThreadHistoryNode } from "../types";

const ROOT_BRANCH_PARENT_KEY = "__root__";

function getBranchParentKey(parentId: string | null) {
  return parentId ?? ROOT_BRANCH_PARENT_KEY;
}

export function createThreadHistoryGraph(
  history: readonly ThreadHistoryEntry[],
) {
  const nodesById = new Map<string, ThreadHistoryNode>();
  const childrenByParent = new Map<string, ThreadHistoryNode[]>();

  for (const [order, entry] of history.entries()) {
    const node: ThreadHistoryNode = {
      message: entry.message,
      parentId: entry.parentId,
      order,
    };
    nodesById.set(node.message.id, node);

    const parentKey = getBranchParentKey(node.parentId);
    const siblings = childrenByParent.get(parentKey);
    if (siblings) {
      siblings.push(node);
      continue;
    }

    childrenByParent.set(parentKey, [node]);
  }

  for (const siblings of childrenByParent.values()) {
    siblings.sort((left, right) => left.order - right.order);
  }

  return { childrenByParent, nodesById };
}

export function buildLatestBranchSelection(
  history: readonly ThreadHistoryEntry[],
) {
  const selections: Record<string, string> = {};
  if (history.length === 0) {
    return selections;
  }

  const { nodesById } = createThreadHistoryGraph(history);
  let currentId: string | null =
    history[history.length - 1]?.message.id ?? null;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = nodesById.get(currentId);
    if (!node) {
      break;
    }

    selections[getBranchParentKey(node.parentId)] = node.message.id;
    currentId = node.parentId;
  }

  return selections;
}

export function applyPreferredLeafSelection(
  history: readonly ThreadHistoryEntry[],
  currentSelections: Record<string, string>,
  preferredLeafId: string,
) {
  const nextSelections = { ...currentSelections };
  const { nodesById } = createThreadHistoryGraph(history);
  let currentId: string | null = preferredLeafId;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = nodesById.get(currentId);
    if (!node) {
      break;
    }

    nextSelections[getBranchParentKey(node.parentId)] = node.message.id;
    currentId = node.parentId;
  }

  return nextSelections;
}

export function resolveActivePathFromHistory(
  history: readonly ThreadHistoryEntry[],
  preferredSelections: Record<string, string>,
) {
  const { childrenByParent } = createThreadHistoryGraph(history);
  const messages: CopilotUIMessage[] = [];
  const selections: Record<string, string> = {};
  const visited = new Set<string>();

  let currentParentId: string | null = null;

  while (true) {
    const parentKey = getBranchParentKey(currentParentId);
    const siblings = childrenByParent.get(parentKey);
    if (!siblings || siblings.length === 0) {
      break;
    }

    const preferredMessageId = preferredSelections[parentKey];
    const selectedNode =
      siblings.find((node) => node.message.id === preferredMessageId) ??
      siblings[siblings.length - 1];
    if (!selectedNode) {
      break;
    }

    if (visited.has(selectedNode.message.id)) {
      break;
    }

    visited.add(selectedNode.message.id);
    selections[parentKey] = selectedNode.message.id;
    messages.push(selectedNode.message);
    currentParentId = selectedNode.message.id;
  }

  return { messages, selections };
}
