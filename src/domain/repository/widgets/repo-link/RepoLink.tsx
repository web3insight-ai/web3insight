import clsx from "clsx";

import type { RepoLinkWidgetProps } from "./typing";

function RepoLink({ className, repo }: RepoLinkWidgetProps) {
  return (
    <a
      className={clsx("hover:text-primary hover:underline", className)}
      href={`https://github.com/${repo}`}
      target="_blank"
      rel="noreferrer"
    >
      {repo}
    </a>
  );
}

export default RepoLink;
