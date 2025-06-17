import type { DataValue } from "@/types";

type User = {
  id: number;
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  email: string;
  location: string;
  company: string;
  blog: string;
  twitter_username: string;
  public_repos: number;
  html_url: string;
  created_at: string;
};

type Repo = {
  id: number;
  name: string;
  full_name: string;
  owner: Pick<User, "id" | "login" | "avatar_url" | "html_url">;
  html_url: string;
  description: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
};

type Issue = {
  id: number;
  number: number;
  title: string;
  body: string;
  user: Pick<User, "id" | "login" | "avatar_url">;
};

type IssueComment = {
  id: number;
  body: string;
  user: Pick<User, "id" | "login" | "avatar_url">;
};

type PullRequest = {
  id: number;
  number: number;
  title: string;
  body: string | null;
  user: Pick<User, "id" | "login" | "avatar_url">;
  merged: boolean;
};

type PullRequestReviewComment = {
  id: number;
  body: string;
  user: Pick<User, "id" | "login" | "avatar_url">;
};

type PullRequestReview = {
  id: number;
  body: string | null;
  user: Pick<User, "id" | "login" | "avatar_url">;
  state: "changes_requested" | "approved";
};

type EventType = "CreateEvent" | "DeleteEvent" | "PushEvent" | "IssuesEvent" | "IssueCommentEvent" | "PullRequestEvent" | "PullRequestReviewCommentEvent" | "PullRequestReviewEvent";

type EventBasic<ET extends EventType = EventType, PT extends Record<string, DataValue> = Record<string, DataValue>> = {
  id: string;
  type: ET;
  actor: Pick<User, "id" | "login" | "avatar_url">;
  repo: Pick<Repo, "id" | "name">;
  public: boolean;
  created_at: string;
  payload: PT;
  org?: {
    id: number;
    login: string;
    avatar_url: string;
  };
};

type CreateEvent = EventBasic<"CreateEvent", {
  ref_type: "branch" | "tag";
  ref: string;
  master_branch: string;
  description: string;
  pusher_type: "user";
}>;

type DeleteEvent = EventBasic<"DeleteEvent", {
  ref_type: "branch" | "tag";
  ref: string;
  pusher_type: "user";
}>;

type PushEvent = EventBasic<"PushEvent", {
  repository_id: number;
  push_id: number;
  size: number;
  distinct_size: number;
  ref: string;
  head: string;
  before: string;
  commits: {
    sha: string;
    message: string;
    author: Pick<User, "name" | "email">;
  }[];
}>;

type IssuesEvent = EventBasic<"IssuesEvent", {
  action: "closed" | "opened";
  issue: Issue;
}>;

type IssueCommentEvent = EventBasic<"IssueCommentEvent", {
  action: "created";
  issue: Issue;
  comment: IssueComment;
}>;

type PullRequestEvent = EventBasic<"PullRequestEvent", {
  action: "closed";
  number: number;
  pull_request: PullRequest;
}>;

type PullRequestReviewCommentEvent = EventBasic<"PullRequestReviewCommentEvent", {
  action: "created";
  comment: PullRequestReviewComment;
  pull_request: PullRequest;
}>;

type PullRequestReviewEvent = EventBasic<"PullRequestReviewEvent", {
  action: "created";
  review: PullRequestReview;
  pull_request: PullRequest;
}>;

type Event = CreateEvent | DeleteEvent | PushEvent | IssuesEvent | IssueCommentEvent | PullRequestEvent | PullRequestReviewCommentEvent | PullRequestReviewEvent;

export type {
  User, Repo, Issue, PullRequest,
  EventType, CreateEvent, DeleteEvent, PushEvent, IssuesEvent, IssueCommentEvent, PullRequestEvent, PullRequestReviewCommentEvent, PullRequestReviewEvent, Event,
};
