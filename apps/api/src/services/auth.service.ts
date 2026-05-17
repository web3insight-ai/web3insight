import { SignJWT } from 'jose';
import type { Updateable } from 'kysely';
import { PrivyClient, type LinkedAccount } from '@privy-io/node';

import type { DbClient } from '@/db/client';
import type { ApiAuthUsers, ApiAuthUsersInfo, Json } from '@/app/db/dto/db.dto';
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
    const user = await this.db
      .selectFrom('api.auth_users')
      .selectAll()
      .where('user_id', '=', data.uid)
      .executeTakeFirst();

    const binds = await this.db
      .selectFrom('api.auth_users_binds')
      .select(['bind_key', 'bind_type'])
      .where('bind_uid', '=', data.uid)
      .execute();

    if (!user) {
      throw new Error('User not found');
    }

    const role = await this.db
      .selectFrom('api.auth_users_roles')
      .select(['user_role_name'])
      .where('user_role_uid', '=', data.uid)
      .execute();

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

    const userInfo = await this.db
      .selectFrom('api.auth_users_info')
      .select(['user_info_type', 'user_extra', 'updated_at'])
      .where('user_id', '=', user.uid)
      .where('user_info_type', '=', normalizedTag)
      .executeTakeFirst();

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

    const userExtraPayload = JSON.stringify(body.user_extra ?? {}) as Json;

    const existingRecord = await this.db
      .selectFrom('api.auth_users_info')
      .select(['user_id'])
      .where('user_id', '=', user.uid)
      .where('user_info_type', '=', normalizedTag)
      .executeTakeFirst();

    if (existingRecord) {
      await this.db
        .updateTable('api.auth_users_info')
        .set({
          user_extra: userExtraPayload,
          updated_at: new Date().toISOString(),
        })
        .where('user_id', '=', user.uid)
        .where('user_info_type', '=', normalizedTag)
        .execute();
    } else {
      await this.db
        .insertInto('api.auth_users_info')
        .values({
          user_id: user.uid,
          user_info_type: normalizedTag,
          user_extra: userExtraPayload,
        })
        .execute();
    }

    return this.getUserExtra(user, normalizedTag);
  }

  async getUserInfoFormId(uid: string) {
    const user = await this.db
      .selectFrom('api.auth_users')
      .selectAll()
      .where('user_id', '=', uid)
      .executeTakeFirst();

    if (!user) {
      throw new Error('User not found');
    }

    const github = this.usersService
      ? await this.usersService.getPrivyGithubUsername(uid)
      : null;

    return { profile: user, github };
  }

  async getUserInfoFormIdV2(uid: string, tag: string) {
    const user = await this.db
      .selectFrom('api.auth_users_info')
      .selectAll()
      .where('user_id', '=', uid)
      .where('user_info_type', '=', tag)
      .executeTakeFirst();

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
    const invite = await this.db
      .selectFrom('api.users_invite')
      .selectAll()
      .where('invite_uid', '=', uid)
      .where('invite_source_type', '=', tag)
      .executeTakeFirst();

    return invite ?? null;
  }

  async updateUserInfo(user: JwtPayload, body: UpdateUserInput) {
    const updatePayload = Object.fromEntries(
      Object.entries(body).filter(([, value]) => value !== undefined),
    ) as Partial<Updateable<ApiAuthUsers>>;

    if (Array.isArray(updatePayload.user_custom_labels)) {
      updatePayload.user_custom_labels = JSON.stringify(
        updatePayload.user_custom_labels,
      );
    }

    if (Object.keys(updatePayload).length === 0) {
      return this.getUserInfo(user);
    }

    await this.db
      .updateTable('api.auth_users')
      .set({
        ...updatePayload,
        updated_at: new Date().toISOString(),
      })
      .where('user_id', '=', user.uid)
      .execute();

    return this.getUserInfo(user);
  }

  async updateUserInfoV2(user: JwtPayload, body: UpdateUserInput, tag: string) {
    const { invite_code, ...userInfoFields } = body;

    if (invite_code) {
      const existingInvite = await this.db
        .selectFrom('api.users_invite')
        .select(['id'])
        .where('invite_uid', '=', user.uid)
        .where('invite_source_type', '=', tag)
        .executeTakeFirst();

      if (!existingInvite) {
        const inviterExists = await this.db
          .selectFrom('api.auth_users')
          .select(['user_id'])
          .where('user_id', '=', invite_code)
          .executeTakeFirst();

        if (inviterExists && invite_code !== user.uid) {
          await this.db
            .insertInto('api.users_invite')
            .values({
              invite_source_id: invite_code,
              invite_source_type: tag,
              invite_source_uid: invite_code,
              invite_uid: user.uid,
            })
            .execute();
        }
      }
    }

    const updatePayload = Object.fromEntries(
      Object.entries(userInfoFields).filter(([, value]) => value !== undefined),
    ) as Partial<Updateable<ApiAuthUsersInfo>>;

    if (Array.isArray(updatePayload.user_custom_labels)) {
      updatePayload.user_custom_labels = JSON.stringify(
        updatePayload.user_custom_labels,
      );
    }

    updatePayload.user_info_type = tag;

    if (Object.keys(updatePayload).length === 0) {
      return this.getUserInfo(user);
    }

    const existingRecord = await this.db
      .selectFrom('api.auth_users_info')
      .select(['user_id'])
      .where('user_id', '=', user.uid)
      .where('user_info_type', '=', tag)
      .executeTakeFirst();

    if (existingRecord) {
      await this.db
        .updateTable('api.auth_users_info')
        .set({
          ...updatePayload,
          updated_at: new Date().toISOString(),
        })
        .where('user_id', '=', user.uid)
        .where('user_info_type', '=', tag)
        .execute();
    } else {
      await this.db
        .insertInto('api.auth_users_info')
        .values({
          user_id: user.uid,
          ...updatePayload,
        })
        .execute();
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
      .selectFrom('api.auth_users_roles')
      .select(['user_role_name'])
      .where('user_role_uid', '=', uid)
      .execute();

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

    const existingOpenBuildBind = await this.db
      .selectFrom('api.auth_users_binds')
      .select(['bind_id', 'bind_uid', 'bind_openid'])
      .where('bind_type', '=', 'openbuild')
      .where('bind_openid', '=', openBuildId)
      .executeTakeFirst();

    if (
      existingOpenBuildBind &&
      String(existingOpenBuildBind.bind_uid) !== String(uid)
    ) {
      throw new Error('OpenBuild account already bound to another user');
    }

    const userOpenBuildBind = await this.db
      .selectFrom('api.auth_users_binds')
      .select(['bind_id', 'bind_openid'])
      .where('bind_type', '=', 'openbuild')
      .where('bind_uid', '=', uid)
      .executeTakeFirst();

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
        .updateTable('api.auth_users_binds')
        .set({
          bind_key: openBuildKey,
          bind_openid: openBuildId,
          bind_secret: res.token.access_token,
          updated_at: new Date().toISOString(),
        })
        .where('bind_id', '=', targetBind.bind_id)
        .execute();
    } else {
      await this.db
        .insertInto('api.auth_users_binds')
        .values({
          bind_key: openBuildKey,
          bind_openid: openBuildId,
          bind_secret: res.token.access_token,
          bind_type: 'openbuild',
          bind_uid: uid,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute();
    }

    return { success: true };
  }

  async getOpenBuildUserRecord(uid: string): Promise<unknown> {
    const bind = await this.db
      .selectFrom('api.auth_users_binds')
      .select(['bind_secret'])
      .where('bind_uid', '=', uid)
      .where('bind_type', '=', 'openbuild')
      .executeTakeFirst();

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

    const findUser = await this.db
      .selectFrom('api.auth_users_binds')
      .selectAll()
      .where('bind_openid', '=', String(user.id))
      .where('bind_type', '=', 'privy')
      .executeTakeFirst();

    let uid = findUser?.bind_uid || '0';

    if (!findUser) {
      const [newUser] = await this.db
        .insertInto('api.auth_users')
        .values({
          user_nick_name: '',
          user_avatar: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returningAll()
        .execute();

      await this.db
        .insertInto('api.auth_users_binds')
        .values([
          {
            bind_key: '',
            bind_openid: user.id,
            bind_secret: privyToken,
            bind_type: 'privy',
            bind_uid: newUser.user_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .execute();

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
