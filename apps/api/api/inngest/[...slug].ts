import { serve } from 'inngest/next';
import { inngest } from '../../src/inngest/client';
import * as functions from '../../src/inngest/functions';

/**
 * Vercel function entry for Inngest. Inngest cloud calls this URL to fire each
 * function; the SDK handles signing-key verification.
 *
 * Local dev: `npx inngest-cli dev` then visit http://localhost:8288.
 */
const fnList = Object.values(functions);

// INNGEST_SIGNING_KEY is picked up automatically from process.env by the SDK.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: fnList as never,
});
