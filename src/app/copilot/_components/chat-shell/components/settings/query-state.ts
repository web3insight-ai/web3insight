import { parseAsStringLiteral } from "nuqs";

export const COPILOT_SETTINGS_DIALOG_QUERY_KEY = "copilotSettings";
export const COPILOT_ARCHIVED_CHATS_DIALOG_QUERY_KEY = "copilotArchivedChats";

export const copilotDialogOpenParser = parseAsStringLiteral(["open"] as const);
