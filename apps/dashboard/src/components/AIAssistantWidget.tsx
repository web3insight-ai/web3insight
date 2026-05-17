"use client";

import { useAtom } from "jotai";
import { aiWidgetOpenAtom } from "#/atoms";
import { AssistantModal } from "./assistant-ui";

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useAtom(aiWidgetOpenAtom);

  return <AssistantModal open={isOpen} onOpenChange={setIsOpen} />;
}
