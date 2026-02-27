"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { AnchorHTMLAttributes } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { DeveloperHoverCard } from "./entity-hover-cards/developer-hover-card";
import { EcosystemHoverCard } from "./entity-hover-cards/ecosystem-hover-card";
import { RepositoryHoverCard } from "./entity-hover-cards/repository-hover-card";

// Reason: These patterns match the entity link format that the AI system prompt
// instructs the model to use: /developer/{username}, /ecosystem/{name},
// /repository/{owner/repo}.
type EntityType = "developer" | "ecosystem" | "repository";

interface ParsedEntity {
  type: EntityType;
  identifier: string;
}

function parseEntityHref(href: string): ParsedEntity | null {
  const developerMatch = href.match(/^\/developer\/([^/]+)$/);
  if (developerMatch) {
    return { type: "developer", identifier: developerMatch[1] };
  }

  const ecosystemMatch = href.match(/^\/ecosystem\/([^/]+)$/);
  if (ecosystemMatch) {
    return { type: "ecosystem", identifier: ecosystemMatch[1] };
  }

  const repoMatch = href.match(/^\/repository\/([^/]+\/[^/]+)$/);
  if (repoMatch) {
    return { type: "repository", identifier: repoMatch[1] };
  }

  return null;
}

function EntityHoverContent({ entity }: { entity: ParsedEntity }) {
  switch (entity.type) {
  case "developer":
    return <DeveloperHoverCard username={entity.identifier} />;
  case "ecosystem":
    return <EcosystemHoverCard name={entity.identifier} />;
  case "repository":
    return <RepositoryHoverCard name={entity.identifier} />;
  }
}

/**
 * Custom link component for Streamdown that detects entity links
 * and renders them as interactive elements with hover preview cards.
 */
export function EntityLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { href, children, ...rest } = props;
  const [isHoverOpen, setIsHoverOpen] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    hoverTimerRef.current = setTimeout(() => {
      setIsHoverOpen(true);
    }, 300);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsHoverOpen(false);
  }, []);

  if (!href) {
    return <span {...rest}>{children}</span>;
  }

  const entity = parseEntityHref(href);

  // External link: standard anchor with icon
  if (!entity) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 text-primary underline underline-offset-2 hover:text-primary/80"
        {...rest}
      >
        {children}
        <ExternalLink className="inline size-3 shrink-0" />
      </a>
    );
  }

  // Internal entity link with hover preview
  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline"
    >
      <Popover isOpen={isHoverOpen} onOpenChange={setIsHoverOpen}>
        <PopoverTrigger>
          <Link
            href={href}
            className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium"
            {...rest}
          >
            {children}
          </Link>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" sideOffset={8}>
          <EntityHoverContent entity={entity} />
        </PopoverContent>
      </Popover>
    </span>
  );
}
