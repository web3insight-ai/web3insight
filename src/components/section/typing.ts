import type { PropsWithChildren } from "react";

type SectionProps = PropsWithChildren<{
  className?: string;
  title: string;
  summary?: string;
  contentHeightFixed?: boolean;
}>

export type { SectionProps };
