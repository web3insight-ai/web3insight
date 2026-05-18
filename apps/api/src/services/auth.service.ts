import { SignJWT } from 'jose';
import { and, eq } from 'drizzle-orm';
import { PrivyClient, type LinkedAccount } from '@privy-io/node';

import type { DbClient } from '@/db/client';
import {
  api_auth_users,
  api_auth_users_binds,
  api_auth_users_info,
  api_auth_users_roles,
  api_users_invite,
} from '@/db/schema';
import { first } from '@/db/helpers';
import type { UsersService } from '@/services/users.service';

/**
 * Pure-class port of auth/services/auth.services.ts. Scope intentionally
 * limited to the post-cutover surface:
 *
 *   • Privy identity-token exchange for backend JWT (primary login)
 *   • User profile read/update (+ tagged variants for event microsites)
 *   • OpenBuild OAuth binding (dev-card feature)
 *
 * Explicitly removed vs the legacy NestJS AuthService:
 *   • login() / getInfoFormGithubOAuth() — GitHub direct OAuth, replaced
 *     by Privy's client-side GitHub provider.
 *   • bindWallet() / genMagicNumber() — wallet binding, replaced by Privy's
 *     wallet loginMethod (no separate magic flow needed).
 *   • All @Command-decorated console methods — Vercel runtime only.
 */

export interface AuthServiceConfig {
  jwtSecret: string;
  privyAppId?: string;
  privyAppSecret?: string;
  openBuildOAuthClient?: string;
  openBuildOAuthSecret?: string;
}

export interface JwtPayload {
  uid: string;
  iss: string;
  exp: number;
  type: string;
  extra: {
    claims: {
      allowed_roles: string[];
      default_role: string;
      user_id: string;
    };
  };
}

interface OAuth2TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface OAuthUserData {
  id: string;
  username: string;
  avatar: string;
  email?: string;
}

interface OpenBuildOAuthTokenData {
  access_token?: string;
  token_type?: string;
  scope?: string;
  [key: string]: unknown;
}

interface OpenBuildOAuthUserData {
  uid: number;
  avatar: string;
  user_name: string;
  email: string;
  github: string;
  [key: string]: unknown;
}

export interface UpdateUserInput {
  user_nick_name?: string;
  user_avatar?: string;
  user_bio?: string;
  user_custom_x?: string;
  user_custom_labels?: string[];
  user_title?: string;
  invite_code?: string;
}

export interface UpdateUserExtraInput {
  user_extra: Record<string, unknown>;
}

type AuthUserUpdate = Partial<typeof api_auth_users.$inferInsert>;
type AuthUserInfoUpdate = Partial<typeof api_auth_users_info.$inferInsert>;

export class AuthService {
  private usersService: UsersService | null = null;

  constructor(
    private readonly db: DbClient,
    private readonly config: AuthServiceConfig,
  ) {}

  setUsersService(usersService: UsersService): void {
    this.usersService = usersService;
  }

  private createPrivyClient(): PrivyClient {
    const { privyAppId, privyAppSecret } = this.config;
    if (!privyAppId || !privyAppSecret) {
      throw new Error('Privy credentials not configured');
    }
    return new PrivyClient({ appId: privyAppId, appSecret: privyAppSecret });
  }

  async getUserInfo(data: JwtPayload) {
    const user = await first(
      this.db
        .select()
        .from(api_auth_users)
        .where(eq(api_auth_users.user_id, data.uid))
        .limit(1),
    );

    const binds = await this.db
      .select({
        bind_key: api_auth_users_binds.bind_key,
        bind_type: api_auth_users_binds.bind_type,
      })
      .from(api_auth_users_binds)
      .where(eq(api_auth_users_binds.bind_uid, data.uid));

    if (!user) {
      throw new Error('User not found');
    }

    const role = await this.db
      .select({ user_role_name: api_auth_users_roles.user_role_name })
      .from(api_auth_users_roles)
      .where(eq(api_auth_users_roles.user_role_uid, data.uid));

    return {
      profile: user,
      binds,
      role: {
        allowed_roles: ['user', ...role.map((r) => r.user_role_name)],
        default_role: 'user',
        user_id: data.uid,
      },
    };
  }

  async getUserExtra(user: JwtPayload, tag: string) {
    const normalizedTag = tag?.trim();
    if (!normalizedTag) {
      throw new Error('user_info_type is required');
    }

    const userInfo = await first(
      this.db
        .select({
          user_info_type: api_auth_users_info.user_info_type,
          user_extra: api_auth_users_info.user_extra,
          updated_at: api_auth_users_info.updated_at,
        })
        .from(api_auth_users_info)
        .where(
          and(
            eq(api_auth_users_info.user_id, user.uid),
            eq(api_auth_users_info.user_info_type, normalizedTag),
          ),
        )
        .limit(1),
    );

    return {
      user_id: user.uid,
      user_info_type: normalizedTag,
      user_extra: userInfo?.user_extra ?? {},
      updated_at: userInfo?.updated_at ?? null,
    };
  }

  async updateUserExtra(
    user: JwtPayload,
    tag: string,
    body: UpdateUserExtraInput,
  ) {
    const normalizedTag = tag?.trim();
    if (!normalizedTag) {
      throw new Error('user_info_type is required');
    }

    const userExtraPayload = body.user_extra ?? {};

    const existingRecord = await first(
      this.db
        .select({ user_id: api_auth_users_info.user_id })
        .from(api_auth_users_info)
        .where(
          and(
            eq(api_auth_users_info.user_id, user.uid),
            eq(api_auth_users_info.user_info_type, normalizedTag),
          ),
        )
        .limit(1),
    );

    if (existingRecord) {
      await this.db
        .update(api_auth_users_info)
        .set({
          user_extra: userExtraPayload,
          updated_at: new Date().toISOString(),
        })
        .where(
          and(
            eq(api_auth_users_info.user_id, user.uid),
            eq(api_auth_users_info.user_info_type, normalizedTag),
          ),
        );
    } else {
      await this.db.insert(api_auth_users_info).values({
        user_id: user.uid,
        user_info_type: normalizedTag,
        user_extra: userExtraPayload,
      });
    }

    return this.getUserExtra(user, normalizedTag);
  }

  async getUserInfoFormId(uid: string) {
    const user = await first(
      this.db
        .select()
        .from(api_auth_users)
        .where(eq(api_auth_users.user_id, uid))
        .limit(1),
    );

    if (!user) {
      throw new Error('User not found');
    }

    const github = this.usersService
      ? await this.usersService.getPrivyGithubUsername(uid)
      : null;

    return { profile: user, github };
  }

  async getUserInfoFormIdV2(uid: string, tag: string) {
    const user = await first(
      this.db
        .select()
        .from(api_auth_users_info)
        .where(
          and(
            eq(api_auth_users_info.user_id, uid),
            eq(api_auth_users_info.user_info_type, tag),
          ),
        )
        .limit(1),
    );

    if (!user) {
      throw new Error('User not found');
    }

    const github = this.usersService
      ? await this.usersService.getPrivyGithubUsername(uid)
      : null;
    const inviter = await this.getInviterByUid(uid, tag);

    return { profile: user, github, inviter };
  }

  async getInviterByUid(uid: string, tag: string) {
    const invite = await first(
      this.db
        .select()
        .from(api_users_invite)
        .where(
          and(
            eq(api_users_invite.invite_uid, uid),
            eq(api_users_invite.invite_source_type, tag),
          ),
        )
        .limit(1),
    );

    return invite ?? null;
  }

  async updateUserInfo(user: JwtPayload, body: UpdateUserInput) {
    const updatePayload = Object.fromEntries(
      Object.entries(body).filter(([, value]) => value !== undefined),
    ) as AuthUserUpdate;

    if (Object.keys(updatePayload).length === 0) {
      return this.getUserInfo(user);
    }

    await this.db
      .update(api_auth_users)
      .set({
        ...updatePayload,
        updated_at: new Date().toISOString(),
      })
      .where(eq(api_auth_users.user_id, user.uid));

    return this.getUserInfo(user);
  }

  async updateUserInfoV2(user: JwtPayload, body: UpdateUserInput, tag: string) {
    const { invite_code, ...userInfoFields } = body;

    if (invite_code) {
      const existingInvite = await first(
        this.db
          .select({ id: api_users_invite.id })
          .from(api_users_invite)
          .where(
            and(
              eq(api_users_invite.invite_uid, user.uid),
              eq(api_users_invite.invite_source_type, tag),
            ),
          )
          .limit(1),
      );

      if (!existingInvite) {
        const inviterExists = await first(
          this.db
            .select({ user_id: api_auth_users.user_id })
            .from(api_auth_users)
            .where(eq(api_auth_users.user_id, invite_code))
            .limit(1),
        );

        if (inviterExists && invite_code !== user.uid) {
          await this.db.insert(api_users_invite).values({
            invite_source_id: invite_code,
            invite_source_type: tag,
            invite_source_uid: invite_code,
            invite_uid: user.uid,
          });
        }
      }
    }

    const updatePayload = Object.fromEntries(
      Object.entries(userInfoFields).filter(([, value]) => value !== undefined),
    ) as AuthUserInfoUpdate;

    updatePayload.user_info_type = tag;

    if (Object.keys(updatePayload).length === 0) {
      return this.getUserInfo(user);
    }

    const existingRecord = await first(
      this.db
        .select({ user_id: api_auth_users_info.user_id })
        .from(api_auth_users_info)
        .where(
          and(
            eq(api_auth_users_info.user_id, user.uid),
            eq(api_auth_users_info.user_info_type, tag),
          ),
        )
        .limit(1),
    );

    if (existingRecord) {
      await this.db
        .update(api_auth_users_info)
        .set({
          ...updatePayload,
          updated_at: new Date().toISOString(),
        })
        .where(
          and(
            eq(api_auth_users_info.user_id, user.uid),
            eq(api_auth_users_info.user_info_type, tag),
          ),
        );
    } else {
      await this.db.insert(api_auth_users_info).values({
        user_id: user.uid,
        ...updatePayload,
      });
    }

    return this.getUserInfo(user);
  }

  /**
   * Sign a JWT for the Hono auth middleware. `sub` = user id, `type` = login
   * provider so jose.jwtVerify can populate context.user.id from payload.sub.
   *
   * # Reason: original NestJS used `jwtService.signAsync(JSON.stringify(claims))`
   * which encodes the whole claims object as a string payload — incompatible
   * with standard JWT validators. Cutover invalidates existing client cookies
   * once; acceptable for a clean monorepo migration.
   */
  async generateOAuthServerToken(uid: string, type: string): Promise<string> {
    const roles = await this.db
      .select({ user_role_name: api_auth_users_roles.user_role_name })
      .from(api_auth_users_roles)
      .where(eq(api_auth_users_roles.user_role_uid, uid));

    const allowedRoles = ['user', ...roles.map((r) => r.user_role_name)];

    const secret = new TextEncoder().encode(this.config.jwtSecret);
    return await new SignJWT({
      type,
      extra: {
        claims: {
          allowed_roles: allowedRoles,
          default_role: 'user',
          user_id: uid,
        },
      },
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(uid)
      .setIssuer('web3insights.app')
      .setExpirationTime('30d')
      .sign(secret);
  }

  private unwrapOpenBuildPayload<T extends Record<string, unknown>>(
    payload: unknown,
  ): T {
    if (!payload || typeof payload !== 'object') {
      return {} as T;
    }
    if ('data' in payload) {
      const data = (payload as { data?: unknown }).data;
      if (data && typeof data === 'object') {
        return data as T;
      }
    }
    return payload as T;
  }

  async getInfoFormOpenBuildOAuth(code: string) {
    const { openBuildOAuthClient, openBuildOAuthSecret } = this.config;
    if (!openBuildOAuthClient || !openBuildOAuthSecret) {
      throw new Error('OpenBuild OAuth client is not configured');
    }

    const tokenResponse = await fetch(
      'https://api.openbuild.xyz/ts/v2/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${openBuildOAuthClient}:${openBuildOAuthSecret}`,
          ).toString('base64')}`,
        },
        body: JSON.stringify({ code }),
      },
    );

    if (!tokenResponse.ok) {
      const error = (await tokenResponse.json().catch(() => null)) as {
        message?: string;
      } | null;
      const message = error?.message || tokenResponse.statusText;
      throw new Error(`OpenBuild OAuth token error: ${message}`);
    }

    const rawToken = this.unwrapOpenBuildPayload<OpenBuildOAuthTokenData>(
      await tokenResponse.json(),
    );

    const accessToken = rawToken.access_token;
    const tokenType = rawToken.token_type?.trim();

    if (!accessToken) {
      throw new Error('OpenBuild OAuth: No access token received');
    }

    const authorization = tokenType
      ? `${tokenType} ${accessToken}`
      : accessToken;

    const userResponse = await fetch(
      'https://api.openbuild.xyz/ts/v1/oauth/user',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: authorization,
        },
      },
    );

    if (!userResponse.ok) {
      const error = (await userResponse.json().catch(() => null)) as {
        message?: string;
      } | null;
      const message = error?.message || userResponse.statusText;
      throw new Error(`OpenBuild OAuth user error: ${message}`);
    }

    const rawUser = this.unwrapOpenBuildPayload<OpenBuildOAuthUserData>(
      await userResponse.json(),
    );

    const openBuildId = rawUser.uid;
    if (openBuildId == null) {
      throw new Error('OpenBuild OAuth: Missing user id');
    }

    const username = rawUser.user_name || rawUser.github || String(openBuildId);

    const data: OAuthUserData = {
      id: String(openBuildId),
      username,
      avatar: rawUser.avatar || '',
      email: rawUser.email,
    };

    const token: OAuth2TokenResponse = {
      access_token: accessToken,
      token_type: tokenType || 'bearer',
      scope: rawToken.scope || '',
    };

    return { token, data };
  }

  async bindOpenBuildOAuth(uid: string, code: string) {
    const res = await this.getInfoFormOpenBuildOAuth(code);
    const openBuildId = String(res.data.id);
    const openBuildKey = res.data.username || openBuildId;

    const existingOpenBuildBind = await first(
      this.db
        .select({
          bind_id: api_auth_users_binds.bind_id,
          bind_uid: api_auth_users_binds.bind_uid,
          bind_openid: api_auth_users_binds.bind_openid,
        })
        .from(api_auth_users_binds)
        .where(
          and(
            eq(api_auth_users_binds.bind_type, 'openbuild'),
            eq(api_auth_users_binds.bind_openid, openBuildId),
          ),
        )
        .limit(1),
    );

    if (
      existingOpenBuildBind &&
      String(existingOpenBuildBind.bind_uid) !== String(uid)
    ) {
      throw new Error('OpenBuild account already bound to another user');
    }

    const userOpenBuildBind = await first(
      this.db
        .select({
          bind_id: api_auth_users_binds.bind_id,
          bind_openid: api_auth_users_binds.bind_openid,
        })
        .from(api_auth_users_binds)
        .where(
          and(
            eq(api_auth_users_binds.bind_type, 'openbuild'),
            eq(api_auth_users_binds.bind_uid, uid),
          ),
        )
        .limit(1),
    );

    if (
      userOpenBuildBind &&
      userOpenBuildBind.bind_openid &&
      String(userOpenBuildBind.bind_openid) !== openBuildId
    ) {
      throw new Error('User already bound to another OpenBuild account');
    }

    const targetBind = userOpenBuildBind ?? existingOpenBuildBind;

    if (targetBind) {
      await this.db
        .update(api_auth_users_binds)
        .set({
          bind_key: openBuildKey,
          bind_openid: openBuildId,
          bind_secret: res.token.access_token,
          updated_at: new Date().toISOString(),
        })
        .where(eq(api_auth_users_binds.bind_id, targetBind.bind_id));
    } else {
      await this.db.insert(api_auth_users_binds).values({
        bind_key: openBuildKey,
        bind_openid: openBuildId,
        bind_secret: res.token.access_token,
        bind_type: 'openbuild',
        bind_uid: uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return { success: true };
  }

  async getOpenBuildUserRecord(uid: string): Promise<unknown> {
    const bind = await first(
      this.db
        .select({ bind_secret: api_auth_users_binds.bind_secret })
        .from(api_auth_users_binds)
        .where(
          and(
            eq(api_auth_users_binds.bind_uid, uid),
            eq(api_auth_users_binds.bind_type, 'openbuild'),
          ),
        )
        .limit(1),
    );

    const accessToken = bind?.bind_secret?.trim();
    if (!accessToken) {
      throw new Error('OpenBuild account not bound');
    }

    const response = await fetch(
      'https://api.openbuild.xyz/ts/v1/oauth/user/record',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      const message = error?.message || response.statusText;
      throw new Error(`OpenBuild OAuth record error: ${message}`);
    }

    return response.json();
  }

  async privyTokenAuth(privyToken: string) {
    const client = this.createPrivyClient();
    const user = await client.users().get({ id_token: privyToken });

    const findUser = await first(
      this.db
        .select()
        .from(api_auth_users_binds)
        .where(
          and(
            eq(api_auth_users_binds.bind_openid, String(user.id)),
            eq(api_auth_users_binds.bind_type, 'privy'),
          ),
        )
        .limit(1),
    );

    let uid = findUser?.bind_uid || '0';

    if (!findUser) {
      const [newUser] = await this.db
        .insert(api_auth_users)
        .values({
          user_nick_name: '',
          user_avatar: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returning();

      await this.db.insert(api_auth_users_binds).values([
        {
          bind_key: '',
          bind_openid: user.id,
          bind_secret: privyToken,
          bind_type: 'privy',
          bind_uid: newUser.user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      uid = newUser.user_id;
    }

    return { token: await this.generateOAuthServerToken(uid, 'privy') };
  }

  async getPrivyUserBindings(userDid: string): Promise<{
    user_id: string;
    linked_accounts: LinkedAccount[];
  } | null> {
    if (!userDid) return null;
    const client = this.createPrivyClient();
    const user = await client.users()._get(userDid);
    return {
      user_id: user.id,
      linked_accounts: user.linked_accounts || [],
    };
  }
}
