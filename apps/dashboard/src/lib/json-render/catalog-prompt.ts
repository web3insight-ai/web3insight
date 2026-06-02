import "server-only";

import { web3InsightCatalog } from "./catalog";

// Reason: This prompt is injected into the LLM system message so the model
// knows which UI components it can emit via JSONL patches.
export const WEB3_JSON_RENDER_PROMPT = web3InsightCatalog.prompt({
  mode: "chat",
  customRules: [
    "Use UI rendering when data visualization improves clarity; otherwise answer with concise text.",
    'For charts, bind data with { "$state": "/path" } instead of embedding large arrays inline.',
    "Keep chart measure fields numeric.",
    "For time-series charts, emit x-axis labels in machine-sortable ISO form (YYYY-MM or YYYY-MM-DD) so points order chronologically.",
    "Use Stack to compose multiple MetricCards horizontally.",
    "Limit DataTable to 20 rows.",
  ],
});
