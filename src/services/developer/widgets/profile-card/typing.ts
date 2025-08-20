import type { PropsWithChildren } from "react";

import type { Developer } from "../../typing";

type SocialLinkProps = PropsWithChildren<{
  url: string;
}>;

type ProfileCardWidgetProps = {
  className?: string;
  developer: Developer;
}

export type { SocialLinkProps, ProfileCardWidgetProps };
