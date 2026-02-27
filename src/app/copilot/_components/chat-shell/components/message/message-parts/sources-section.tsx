import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";

import { createStablePartKey } from "./create-stable-part-key";

interface SourceUrlPart {
  url: string;
}

interface SourcesSectionProps {
  messageId: string;
  sourceParts: SourceUrlPart[];
}

export function SourcesSection({
  messageId,
  sourceParts,
}: SourcesSectionProps) {
  if (sourceParts.length === 0) {
    return null;
  }

  const seenSourceKeys = new Map<string, number>();

  return (
    <Sources>
      <SourcesTrigger count={sourceParts.length} />
      <SourcesContent>
        {sourceParts.map((part) => (
          <Source
            key={createStablePartKey(
              `${messageId}-source-${part.url}`,
              seenSourceKeys,
            )}
            href={part.url}
            title={part.url}
          />
        ))}
      </SourcesContent>
    </Sources>
  );
}
