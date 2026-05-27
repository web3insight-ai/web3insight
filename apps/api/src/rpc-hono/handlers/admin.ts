import { ORPCError } from '@orpc/server';
import { os } from '../orpc';
import { mapServiceError } from '../error-mapping';

/**
 * Admin handlers — port of api/controller/admin.controller.ts.
 * All procedures are auth-protected per the legacy @UseGuards(AppAuthGuard).
 */

function requireUser(user: { id: number } | undefined): void {
  if (!user) {
    throw new ORPCError('UNAUTHORIZED', { message: 'Authentication required' });
  }
}

export const listEcosystemsHandler = os.admin.listEcosystems.handler(
  async ({ context }) => {
    requireUser(context.user);
    const ecoFilters = await context.container.services.eco.getEcoNameFilters();
    // Contract output: { list: string[] }. Legacy returned { available_ecosystem, provider_ecosystem }
    // — we collapse to a single list since contract was simplified during migration.
    return { list: ecoFilters };
  },
);

export const listEcosystemReposHandler = os.admin.listEcosystemRepos.handler(
  async ({ input, context }) => {
    requireUser(context.user);
    const result = await context.container.services.repos.getReposByEcoName(
      input as never,
    );
    return result as never;
  },
);

export const markEcosystemRepoHandler = os.admin.markEcosystemRepo.handler(
  async ({ input, context }) => {
    requireUser(context.user);
    await mapServiceError(() =>
      context.container.services.repos.markRepo({ id: input.id }, input.data),
    );
    return { success: true as const };
  },
);

export const testVersionHandler = os.admin.testVersion.handler(
  ({ context }) => {
    requireUser(context.user);
    // Legacy returned { version: '0.0.20' } unconditionally; contract output is SuccessResponseSchema.
    return Promise.resolve({ success: true as const });
  },
);

export const adminRouter = os.admin.router({
  listEcosystems: listEcosystemsHandler,
  listEcosystemRepos: listEcosystemReposHandler,
  markEcosystemRepo: markEcosystemRepoHandler,
  testVersion: testVersionHandler,
});
