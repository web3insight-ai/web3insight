"use client";

import type { ReactNode } from "react";

import { DeveloperHoverCard } from "./entity-hover-cards/developer-hover-card";
import { EcosystemHoverCard } from "./entity-hover-cards/ecosystem-hover-card";
import { RepositoryHoverCard } from "./entity-hover-cards/repository-hover-card";

// Reason: The AI system prompt instructs the model to emit internal entity
// links as /developer/{username}, /ecosystem/{name}, /repository/{owner/repo}.
export type CopilotEntityType = "developer" | "ecosystem" | "repository";

export interface CopilotEntityImplementation {
  type: CopilotEntityType;
  pattern: RegExp;
  renderHoverContent: (identifier: string) => ReactNode;
}

// Reason: rehype/Streamdown may prefix sanitized values with `user-content-`;
// strip it (and trim) before the identifier reaches a fetch URL or hover card.
export function normalizeEntityId(raw: string): string {
  return raw.trim().replace(/^user-content-/, "");
}

// Single source of truth: both href parsing and hover rendering derive from
// this list, so adding an entity type is one entry rather than coordinated
// edits across a regex set, a switch, and an import block.
export const COPILOT_ENTITY_REGISTRY: CopilotEntityImplementation[] = [
  {
    type: "developer",
    pattern: /^\/developer\/([^/]+)$/,
    renderHoverContent: (id) => <DeveloperHoverCard username={id} />,
  },
  {
    type: "ecosystem",
    pattern: /^\/ecosystem\/([^/]+)$/,
    renderHoverContent: (id) => <EcosystemHoverCard name={id} />,
  },
  {
    type: "repository",
    pattern: /^\/repository\/([^/]+\/[^/]+)$/,
    renderHoverContent: (id) => <RepositoryHoverCard name={id} />,
  },
];

export interface ParsedCopilotEntity {
  type: CopilotEntityType;
  identifier: string;
  renderHoverContent: () => ReactNode;
}

export function parseEntityHref(href: string): ParsedCopilotEntity | null {
  for (const impl of COPILOT_ENTITY_REGISTRY) {
    const match = impl.pattern.exec(href);
    if (match) {
      const identifier = normalizeEntityId(match[1]);
      return {
        type: impl.type,
        identifier,
        renderHoverContent: () => impl.renderHoverContent(identifier),
      };
    }
  }

  return null;
}
