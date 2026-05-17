import { ORPCError } from '@orpc/server';
import { os } from '../orpc';

/**
 * Auth handlers — STUB until Phase D ports auth/services/auth.services.ts (1967 LOC).
 *
 * Every procedure throws NOT_IMPLEMENTED. Clients should continue using the
 * NestJS path at /v1/auth/* + /v1/user/* for login + user management until
 * cutover. The Hono auth middleware still verifies JWTs issued by the NestJS
 * AuthService, so authenticated requests to other Hono procedures work today.
 */

function notImpl<T>(): T {
  throw new ORPCError('NOT_IMPLEMENTED', {
    message:
      'Auth procedures pending Phase D — use legacy /v1/auth/* and /v1/user/* endpoints',
  });
}

export const authRouter = os.auth.router({
  oauthLogin: os.auth.oauthLogin.handler(() => notImpl()),
  me: os.auth.me.handler(() => notImpl()),
  getUserExtra: os.auth.getUserExtra.handler(() => notImpl()),
  updateUserExtra: os.auth.updateUserExtra.handler(() => notImpl()),
  publicById: os.auth.publicById.handler(() => notImpl()),
  updateUserByTag: os.auth.updateUserByTag.handler(() => notImpl()),
  getUserByTagAndId: os.auth.getUserByTagAndId.handler(() => notImpl()),
  updateMe: os.auth.updateMe.handler(() => notImpl()),
  getMagic: os.auth.getMagic.handler(() => notImpl()),
  bindWallet: os.auth.bindWallet.handler(() => notImpl()),
  privyTokenAuth: os.auth.privyTokenAuth.handler(() => notImpl()),
  bindOpenBuild: os.auth.bindOpenBuild.handler(() => notImpl()),
  getOpenBuildRecord: os.auth.getOpenBuildRecord.handler(() => notImpl()),
});
