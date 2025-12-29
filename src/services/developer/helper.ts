import type {
  EventType,
  CreateEvent,
  DeleteEvent,
  PushEvent,
  IssuesEvent,
  IssueCommentEvent,
  PullRequestEvent,
  PullRequestReviewCommentEvent,
  Event as GithubEvent,
  User as GithubUser,
} from "../github/typing";
import type {
  ActivityDescriptionResolver,
  DeveloperActivity,
  Developer,
} from "./typing";

const descriptionResolverMap: Record<EventType, ActivityDescriptionResolver> = {
  CreateEvent: (event) =>
    `created a ${(event as CreateEvent).payload.ref_type} ${(event as CreateEvent).payload.ref} in ${event.repo.name}`,
  DeleteEvent: (event) =>
    `deleted ${(event as DeleteEvent).payload.ref_type} ${(event as DeleteEvent).payload.ref} at ${event.repo.name}`,
  PushEvent: (event) =>
    `pushed to ${(event as PushEvent).payload.ref.replace("refs/heads/", "")} in ${event.repo.name}`,
  IssuesEvent: (event) =>
    `${(event as IssuesEvent).payload.action} an issue in ${event.repo.name}`,
  IssueCommentEvent: (event) =>
    `commented on issue ${event.repo.name}#${(event as IssueCommentEvent).payload.issue.number}`,
  PullRequestEvent: (event) => {
    const { payload, repo } = event as PullRequestEvent;

    return `${payload.action === "closed" && payload.pull_request.merged ? "merged" : payload.action} a pull request in ${repo.name}`;
  },
  PullRequestReviewCommentEvent: (event) =>
    `commented on pull request ${event.repo.name}#${(event as PullRequestReviewCommentEvent).payload.pull_request.number}`,
  PullRequestReviewEvent: (event) =>
    `reviewed a pull request in ${event.repo.name}`,
};

function resolveActivityFromGithubEvent(event: GithubEvent): DeveloperActivity {
  const resolver: ActivityDescriptionResolver | undefined =
    descriptionResolverMap[event.type];

  return {
    id: event.id,
    description:
      resolver?.(event) ?? `Description of \`${event.type}\` isn't defined`,
    date: event.created_at,
  };
}

function resolveDeveloperFromGithubUser(
  user: GithubUser | undefined,
): Developer {
  // Handle case when user data is not available
  if (!user) {
    return {
      id: 0,
      username: "unknown",
      nickname: "Unknown User",
      description: "",
      avatar: "",
      location: "",
      social: {
        github: "",
        twitter: "",
        website: "",
      },
      statistics: {
        repository: 0,
        pullRequest: 0,
        codeReview: 0,
      },
      joinedAt: "",
    };
  }

  return {
    id: user.id,
    username: user.login,
    nickname: user.name,
    description: user.bio,
    avatar: user.avatar_url,
    location: user.location,
    social: {
      github: user.html_url,
      twitter: user.twitter_username,
      website: user.blog,
    },
    statistics: {
      repository: user.public_repos,
      pullRequest: 0,
      codeReview: 0,
    },
    joinedAt: user.created_at,
  };
}

export { resolveActivityFromGithubEvent, resolveDeveloperFromGithubUser };
