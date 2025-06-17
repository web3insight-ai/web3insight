import type { EventType, CreateEvent, DeleteEvent, PushEvent, IssuesEvent, IssueCommentEvent, PullRequestEvent, PullRequestReviewCommentEvent, Event as GithubEvent } from "../github/typing";
import type { ActivityDescriptionResolver, DeveloperActivity } from "./typing";

const descriptionResolverMap: Record<EventType, ActivityDescriptionResolver> = {
  CreateEvent: event => `created a ${(event as CreateEvent).payload.ref_type} ${(event as CreateEvent).payload.ref} in ${event.repo.name}`,
  DeleteEvent: event => `deleted ${(event as DeleteEvent).payload.ref_type} ${(event as DeleteEvent).payload.ref} at ${event.repo.name}`,
  PushEvent: event => `pushed to ${(event as PushEvent).payload.ref.replace("refs/heads/", "")} in ${event.repo.name}`,
  IssuesEvent: event => `${(event as IssuesEvent).payload.action} an issue in ${event.repo.name}`,
  IssueCommentEvent: event => `commented on issue ${event.repo.name}#${(event as IssueCommentEvent).payload.issue.number}`,
  PullRequestEvent: event => {
    const { payload, repo } = event as PullRequestEvent;

    return `${payload.action === "closed" && payload.pull_request.merged ? "merged" : payload.action} a pull request in ${repo.name}`;
  },
  PullRequestReviewCommentEvent: event => `commented on pull request ${event.repo.name}#${(event as PullRequestReviewCommentEvent).payload.pull_request.number}`,
  PullRequestReviewEvent: event => `reviewed a pull request in ${event.repo.name}`,
};

function resolveActivityFromGithubEvent(event: GithubEvent): DeveloperActivity {
  const resolver: ActivityDescriptionResolver | undefined = descriptionResolverMap[event.type];

  return {
    id: event.id,
    description: resolver?.(event) ?? `Description of \`${event.type}\` isn't defined`,
    date: event.created_at,
  };
}

export { resolveActivityFromGithubEvent };
