import { ORPCError } from '@orpc/server';
import { os } from '../orpc';
import { mapServiceError as mapNotFound } from '../error-mapping';

/**
 * Custom analysis handlers — port of api/controller/custom.controller.ts.
 * UsersService backs all of these; user-scoped writes require context.user.
 */

function requireUid(user: { id: number } | undefined): string {
  if (!user) {
    throw new ORPCError('UNAUTHORIZED', { message: 'Authentication required' });
  }
  return String(user.id);
}

export const createAnalysisHandler = os.custom.createAnalysis.handler(
  async ({ input, context }) => {
    const uid = requireUid(context.user);
    return (await context.container.services.users.uploadAndGetUsers(
      input as never,
      uid,
    )) as never;
  },
);

export const updateAnalysisHandler = os.custom.updateAnalysis.handler(
  async ({ input, context }) => {
    const uid = requireUid(context.user);
    return await mapNotFound(
      async () =>
        (await context.container.services.users.uploadAndGetUsers(
          input.data as never,
          uid,
          String(input.id),
        )) as never,
    );
  },
);

export const deleteAnalysisHandler = os.custom.deleteAnalysis.handler(
  async ({ input, context }) => {
    const uid = requireUid(context.user);
    await mapNotFound(async () => {
      await context.container.services.users.remove(uid, { id: input.id });
    });
    return { success: true as const };
  },
);

export const shareAnalysisHandler = os.custom.shareAnalysis.handler(
  async ({ input, context }) => {
    const uid = requireUid(context.user);
    await mapNotFound(async () => {
      await context.container.services.users.share(
        uid,
        { id: input.id },
        input.data,
      );
    });
    return { success: true as const };
  },
);

export const listMyAnalysesHandler = os.custom.listMyAnalyses.handler(
  async ({ input, context }) => {
    const uid = requireUid(context.user);
    return (await context.container.services.users.getList(
      input as never,
      uid,
    )) as never;
  },
);

export const listPublicAnalysesHandler = os.custom.listPublicAnalyses.handler(
  async ({ input, context }) => {
    return (await context.container.services.users.getPublicList(
      input as never,
    )) as never;
  },
);

export const getAnalysisHandler = os.custom.getAnalysis.handler(
  async ({ input, context }) => {
    return await mapNotFound(
      async () =>
        (await context.container.services.users.analysisUsers({
          id: input.id,
        })) as never,
    );
  },
);

export const externalUserHandler = os.custom.externalUser.handler(
  async ({ input, context }) => {
    return (await context.container.services.users.getTopFormUserName(
      input.username,
    )) as never;
  },
);

export const externalGithubByIdHandler = os.custom.externalGithubById.handler(
  async ({ input, context }) => {
    return (await context.container.services.users.getTopFormUserId(
      input.id,
    )) as never;
  },
);

export const externalGithubByUsernameHandler =
  os.custom.externalGithubByUsername.handler(async ({ input, context }) => {
    return (await context.container.services.users.getTopFormGithubUserName(
      input.username,
    )) as never;
  });

export const eventUsersHandler = os.custom.eventUsers.handler(
  async ({ input, context }) => {
    const result = await context.container.services.users.getEventUsers(
      input.x,
    );
    return result ?? {};
  },
);

export const customRouter = os.custom.router({
  createAnalysis: createAnalysisHandler,
  updateAnalysis: updateAnalysisHandler,
  deleteAnalysis: deleteAnalysisHandler,
  shareAnalysis: shareAnalysisHandler,
  listMyAnalyses: listMyAnalysesHandler,
  listPublicAnalyses: listPublicAnalysesHandler,
  getAnalysis: getAnalysisHandler,
  externalUser: externalUserHandler,
  externalGithubById: externalGithubByIdHandler,
  externalGithubByUsername: externalGithubByUsernameHandler,
  eventUsers: eventUsersHandler,
});
