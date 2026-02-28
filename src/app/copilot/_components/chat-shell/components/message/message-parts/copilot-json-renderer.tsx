"use client";

import type { Spec } from "@json-render/core";
import type { ComponentRenderer } from "@json-render/react";
import {
  ActionProvider,
  Renderer,
  StateProvider,
  VisibilityProvider,
} from "@json-render/react";
import {
  web3InsightRegistry,
  Web3JsonRenderFallback,
} from "@/lib/json-render/registry";

const fallback: ComponentRenderer = ({ element }) => {
  return <Web3JsonRenderFallback element={element} />;
};

interface CopilotJsonRendererProps {
  spec: Spec | null;
  isStreaming: boolean;
}

export function CopilotJsonRenderer({
  spec,
  isStreaming,
}: CopilotJsonRendererProps) {
  if (!spec) {
    return null;
  }

  return (
    <div className="mb-3 w-full max-w-[600px]">
      <StateProvider initialState={spec.state ?? {}}>
        <VisibilityProvider>
          <ActionProvider>
            <Renderer
              fallback={fallback}
              loading={isStreaming}
              registry={web3InsightRegistry}
              spec={spec}
            />
          </ActionProvider>
        </VisibilityProvider>
      </StateProvider>
    </div>
  );
}
