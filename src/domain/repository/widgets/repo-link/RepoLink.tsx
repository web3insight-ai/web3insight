import clsx from "clsx";
import { Link } from "@remix-run/react";

import type { RepoLinkWidgetProps } from "./typing";

function RepoLink({ className, repo, repoId }: RepoLinkWidgetProps) {
  // If repoId is provided, use internal link, otherwise fallback to GitHub
  if (repoId) {
    // Encode the repo name in the URL for the detail page to use
    const searchParams = new URLSearchParams({ name: repo }).toString();
    return (
      <Link
        className={clsx("hover:text-primary hover:underline", className)}
        to={`/repositories/${repoId}?${searchParams}`}
        target="_blank"
        rel="noreferrer"
      >
        {repo}
      </Link>
    );
  }

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
