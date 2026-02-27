import { BarChart3Icon, GlobeIcon, SearchIcon, UsersIcon } from "lucide-react";

export const STARTER_PROMPT_CARDS = [
  {
    title: "Compare ecosystems",
    label: "Ethereum vs Solana",
    action: "Compare Ethereum and Solana developer ecosystems",
    icon: GlobeIcon,
  },
  {
    title: "Platform overview",
    label: "Web3 at a glance",
    action: "Show me the Web3 platform overview with ecosystem rankings",
    icon: BarChart3Icon,
  },
  {
    title: "Developer profile",
    label: "contributions & activity",
    action: "Analyze pseudoyu's developer profile and top contributions",
    icon: SearchIcon,
  },
  {
    title: "Hot this week",
    label: "repos & contributors",
    action: "What are the hottest repositories and top contributors this week?",
    icon: UsersIcon,
  },
] as const;

export const STARTER_PROMPTS = STARTER_PROMPT_CARDS.map(
  (prompt) => prompt.action,
);

export const FALLBACK_THREAD_TITLE = "New chat";
export const MAX_TITLE_LENGTH = 120;
export const SESSION_LIST_LIMIT = 30;
