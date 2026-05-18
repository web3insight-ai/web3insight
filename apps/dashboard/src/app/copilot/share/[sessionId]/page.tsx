import { notFound } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { getCopilotDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";
import { copilot_messages, copilot_sessions } from "@/lib/db/schema/copilot";
import { getCopilotUserId } from "@/lib/auth/copilot-auth";
import { CopilotReadOnlyShell } from "../../_components/read-only-shell";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function CopilotSharePage({ params }: PageProps) {
  const { sessionId } = await params;

  const dbReady = await isCopilotDbReady();
  if (!dbReady) {
    notFound();
  }

  const db = getCopilotDb();
  const sessionRows = await db
    .select({
      title: copilot_sessions.title,
      access_level: copilot_sessions.access_level,
      user_id: copilot_sessions.user_id,
    })
    .from(copilot_sessions)
    .where(
      and(
        eq(copilot_sessions.session_id, sessionId),
        isNull(copilot_sessions.deleted_at),
      ),
    )
    .limit(1);

  const session = sessionRows[0];
  if (!session) {
    notFound();
  }

  if (session.access_level !== "public") {
    // Reason: Owners viewing their own private session should keep using the
    // primary /copilot/[sessionId] route. The share URL is only meaningful
    // for public threads — surface 404 otherwise so the URL cannot be used
    // to probe other users' private chats.
    notFound();
  }

  const messageRows = await db
    .select({
      ui_message: copilot_messages.ui_message,
      parent_id: copilot_messages.parent_id,
    })
    .from(copilot_messages)
    .where(eq(copilot_messages.session_id, sessionId))
    .orderBy(asc(copilot_messages.created_at));

  const history = messageRows.map((row) => ({
    message: row.ui_message,
    parentId: row.parent_id,
  }));

  const viewerUserId = await getCopilotUserId();
  const isGuest = viewerUserId === null;

  return (
    <CopilotReadOnlyShell
      history={history}
      isGuest={isGuest}
      title={session.title}
    />
  );
}
