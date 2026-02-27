import { atom } from "jotai";

import { createThreadHistoryGraph } from "../lib/branch-graph";
import type { MessageBranchMeta } from "../types";
import { copilotThreadHistoryAtom } from "./atoms";

export const copilotBranchMetaByMessageIdAtom = atom((get) => {
  const threadGraph = createThreadHistoryGraph(get(copilotThreadHistoryAtom));
  const branchMap = new Map<string, MessageBranchMeta>();

  for (const [parentKey, siblings] of threadGraph.childrenByParent.entries()) {
    if (siblings.length <= 1) {
      continue;
    }

    siblings.forEach((node, currentIndex) => {
      branchMap.set(node.message.id, {
        currentIndex,
        parentKey,
        siblings,
      });
    });
  }

  return branchMap;
});
