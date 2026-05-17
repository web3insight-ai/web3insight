export const STARTER_PROMPT_CARDS = [
  {
    label: "Ethereum developer growth trend",
    action:
      "Show me a line chart of monthly active developers for Ethereum over the past 12 months",
  },
  {
    label: "Ethereum vs Solana comparison",
    action:
      "Compare monthly commit activity between Ethereum and Solana in a bar chart",
  },
  {
    label: "Top repos by stars",
    action:
      "List the top 15 repositories by star count with their ecosystems in a table",
  },
  {
    label: "Developer geographic distribution",
    action:
      "Show a pie chart of the geographic distribution of Web3 developers by country",
  },
  {
    label: "Analyze pseudoyu's profile",
    action: "Show me pseudoyu's developer profile with contribution stats",
  },
  {
    label: "Hot repos this week",
    action:
      "What are the hottest repositories this week by developer activity?",
  },
] as const;

export const STARTER_PROMPTS = STARTER_PROMPT_CARDS.map(
  (prompt) => prompt.action,
);

export const FALLBACK_THREAD_TITLE = "New chat";
export const MAX_TITLE_LENGTH = 120;
export const SESSION_LIST_LIMIT = 30;
