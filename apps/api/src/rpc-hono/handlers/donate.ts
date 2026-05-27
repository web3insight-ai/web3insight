import { ORPCError } from '@orpc/server';
import { os } from '../orpc';
import { mapServiceError as mapNotFound } from '../error-mapping';

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
    return await mapNotFound(() =>
      context.container.services.donate.create(
        input.repo_full_name,
        String(user.id),
      ),
    );
  },
);

export const listDonationsHandler = os.donate.listDonations.handler(
  async ({ context }) => {
    return await context.container.services.donate.list();
  },
);

export const getDonationByIdHandler = os.donate.getDonationById.handler(
  async ({ input, context }) => {
    return await mapNotFound(() =>
      context.container.services.donate.detail(input.id),
    );
  },
);

export const getDonationByNameHandler = os.donate.getDonationByName.handler(
  async ({ input, context }) => {
    return await mapNotFound(() =>
      context.container.services.donate.detailByName(input.name),
    );
  },
);

export const updateDonationHandler = os.donate.updateDonation.handler(
  async ({ input, context }) => {
    requireUser(context.user);
    await mapNotFound(() =>
      context.container.services.donate.update(input.id, input.data as never),
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
