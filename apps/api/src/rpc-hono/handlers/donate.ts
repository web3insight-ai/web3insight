import { ORPCError } from '@orpc/server';
import { os } from '../orpc';

/**
 * Donate handlers — port of api/controller/donate.controller.ts.
 * createDonation + updateDonation require an authenticated user (context.user).
 */

function requireUser(user: { id: number } | undefined): { id: number } {
  if (!user) {
    throw new ORPCError('UNAUTHORIZED', { message: 'Authentication required' });
  }
  return user;
}

export const createDonationHandler = os.donate.createDonation.handler(
  async ({ input, context }) => {
    const user = requireUser(context.user);
    // Contract input uses `repo_name` (owner/repo) — the service expects that exact shape.
    return (await context.container.services.donate.create(
      input.repo_name,
      String(user.id),
    )) as never;
  },
);

export const listDonationsHandler = os.donate.listDonations.handler(
  async ({ context }) => {
    return (await context.container.services.donate.list()) as never;
  },
);

export const getDonationByIdHandler = os.donate.getDonationById.handler(
  async ({ input, context }) => {
    try {
      return (await context.container.services.donate.detail(
        input.id,
      )) as never;
    } catch (err) {
      throw new ORPCError('NOT_FOUND', {
        message: err instanceof Error ? err.message : 'Repository not found',
      });
    }
  },
);

export const getDonationByNameHandler = os.donate.getDonationByName.handler(
  async ({ input, context }) => {
    try {
      return (await context.container.services.donate.detailByName(
        input.name,
      )) as never;
    } catch (err) {
      throw new ORPCError('NOT_FOUND', {
        message: err instanceof Error ? err.message : 'Repository not found',
      });
    }
  },
);

export const updateDonationHandler = os.donate.updateDonation.handler(
  async ({ input, context }) => {
    requireUser(context.user);
    await context.container.services.donate.update(
      input.id,
      input.data as never,
    );
    return { success: true as const };
  },
);

export const donateRouter = os.donate.router({
  createDonation: createDonationHandler,
  listDonations: listDonationsHandler,
  getDonationById: getDonationByIdHandler,
  getDonationByName: getDonationByNameHandler,
  updateDonation: updateDonationHandler,
});
