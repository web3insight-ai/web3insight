import { BarChart3Icon, GlobeIcon, SearchIcon, UsersIcon } from "lucide-react";

export const STARTER_PROMPT_CARDS = [
  {
    title: "Top ecosystems",
    label: "by developer activity",
    action: "Show me the top Web3 ecosystems by developer activity",
    icon: GlobeIcon,
  },
  {
    title: "Trending repositories",
    label: "this week",
    action: "What are the trending Web3 repositories this week?",
    icon: BarChart3Icon,
  },
  {
    title: "Analyze developer",
    label: "Web3 contributions",
    action: "Analyze pseudoyu's Web3 contributions and ecosystem activity",
    icon: SearchIcon,
  },
  {
    title: "Developer distribution",
    label: "by country",
    action: "Show developer distribution by country across Web3 ecosystems",
    icon: UsersIcon,
  },
] as const;

export const STARTER_PROMPTS = STARTER_PROMPT_CARDS.map(
  (prompt) => prompt.action,
);

export const FALLBACK_THREAD_TITLE = "New chat";
export const MAX_TITLE_LENGTH = 120;
export const SESSION_LIST_LIMIT = 30;
