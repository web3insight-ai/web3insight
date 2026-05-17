import { ORPCError } from '@orpc/server';
import { os } from '../orpc';
import type { HonoRpcContext } from '../context';
import type { JwtPayload } from '@/services/auth.service';

/**
 * Auth handlers — Phase D port. Scope is intentionally Privy-only + OpenBuild
 * binding; legacy GitHub direct OAuth + wallet bind + magic number were
 * dropped from the contract.
 *
 * The Hono middleware in src/app/middleware/auth.ts validates JWTs and
 * populates context.user from payload.sub (numeric string id).
 */

function requireUser(user: HonoRpcContext['user']): {
  id: number;
  tag?: string;
} {
  if (!user) {
    throw new ORPCError('UNAUTHORIZED', { message: 'Authentication required' });
  }
  return user;
}

/**
 * Synthesize a JwtPayload for AuthService methods that still take the legacy
 * payload shape. Only `.uid` is read by the slimmed service.
 */
function toJwtPayload(user: { id: number; tag?: string }): JwtPayload {
  const uid = String(user.id);
  return {
    uid,
    iss: 'web3insights.app',
    exp: 0,
    type: user.tag ?? 'privy',
    extra: {
      claims: {
        allowed_roles: ['user'],
        default_role: 'user',
        user_id: uid,
      },
    },
  };
}

function safeParseStringArray(raw: string): string[] | undefined {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : undefined;
  } catch {
    return undefined;
  }
}

function profileToPublic(profile: Record<string, unknown>) {
  return {
    id: Number(profile.user_id),
    user_nick_name: (profile.user_nick_name as string | null) ?? null,
    user_avatar: (profile.user_avatar as string | null) ?? null,
    user_bio: (profile.user_bio as string | null) ?? null,
    user_title: (profile.user_title as string | null) ?? null,
    user_custom_labels: Array.isArray(profile.user_custom_labels)
      ? (profile.user_custom_labels as string[])
      : typeof profile.user_custom_labels === 'string'
        ? safeParseStringArray(profile.user_custom_labels)
        : undefined,
  };
}

export const authRouter = os.auth.router({
  me: os.auth.me.handler(async ({ context }) => {
    const user = requireUser(context.user);
    try {
      const result = await context.container.services.auth.getUserInfo(
        toJwtPayload(user),
      );
      return profileToPublic(
        result.profile as unknown as Record<string, unknown>,
      );
    } catch (err) {
      // Reason: service tokens (uid=1 DATA_API_TOKEN) and deleted users have
      // no row in api.auth_users — the service throws plain Error('User not
      // found'). Surface as NOT_FOUND so dashboard's fetchCurrentUser can
      // gracefully render a logged-out state instead of crashing with 500.
      const message = err instanceof Error ? err.message : 'auth lookup failed';
      if (message === 'User not found') {
        throw new ORPCError('NOT_FOUND', { message });
      }
      throw err;
    }
  }),

  getUserExtra: os.auth.getUserExtra.handler(async ({ input, context }) => {
    const user = requireUser(context.user);
    const result = await context.container.services.auth.getUserExtra(
      toJwtPayload(user),
      input.tag,
    );
    return result.user_extra as Record<string, unknown>;
  }),

  updateUserExtra: os.auth.updateUserExtra.handler(
    async ({ input, context }) => {
      const user = requireUser(context.user);
      await context.container.services.auth.updateUserExtra(
        toJwtPayload(user),
        input.tag,
        { user_extra: input.data.user_extra },
      );
      return { success: true };
    },
  ),

  publicById: os.auth.publicById.handler(async ({ input, context }) => {
    const result = await context.container.services.auth.getUserInfoFormId(
      String(input.id),
    );
    return profileToPublic(
      result.profile as unknown as Record<string, unknown>,
    );
  }),

  updateUserByTag: os.auth.updateUserByTag.handler(
    async ({ input, context }) => {
      const user = requireUser(context.user);
      await context.container.services.auth.updateUserInfoV2(
        toJwtPayload(user),
        input.data,
        input.tag,
      );
      return { success: true };
    },
  ),

  getUserByTagAndId: os.auth.getUserByTagAndId.handler(
    async ({ input, context }) => {
      const result = await context.container.services.auth.getUserInfoFormIdV2(
        input.id,
        input.tag,
      );
      return profileToPublic(
        result.profile as unknown as Record<string, unknown>,
      );
    },
  ),

  updateMe: os.auth.updateMe.handler(async ({ input, context }) => {
    const user = requireUser(context.user);
    await context.container.services.auth.updateUserInfo(
      toJwtPayload(user),
      input,
    );
    return { success: true };
  }),

  privyTokenAuth: os.auth.privyTokenAuth.handler(async ({ input, context }) => {
    const result = await context.container.services.auth.privyTokenAuth(
      input.id_token,
    );
    return { token: result.token };
  }),

  bindOpenBuild: os.auth.bindOpenBuild.handler(async ({ input, context }) => {
    const user = requireUser(context.user);
    await context.container.services.auth.bindOpenBuildOAuth(
      String(user.id),
      input.code,
    );
    return { success: true };
  }),

  getOpenBuildRecord: os.auth.getOpenBuildRecord.handler(
    async ({ context }) => {
      const user = requireUser(context.user);
      const result =
        await context.container.services.auth.getOpenBuildUserRecord(
          String(user.id),
        );
      return (result ?? null) as Record<string, unknown> | null;
    },
  ),
});
