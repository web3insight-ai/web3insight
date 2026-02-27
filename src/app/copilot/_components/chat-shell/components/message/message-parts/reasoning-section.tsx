import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";

interface ReasoningSectionProps {
  isStreaming: boolean;
  reasoningText: string;
}

export function ReasoningSection({
  isStreaming,
  reasoningText,
}: ReasoningSectionProps) {
  if (!reasoningText) {
    return null;
  }

  return (
    <Reasoning isStreaming={isStreaming}>
      <ReasoningTrigger />
      <ReasoningContent>{reasoningText}</ReasoningContent>
    </Reasoning>
  );
}
