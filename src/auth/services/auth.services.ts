import {
  AuthBindWalletReqDto,
  LoginReqDto,
  UpdateUserExtraReqDto,
  UpdateUserReqDto,
} from '@/api/dto/api.dto';
import { KYSELY } from '@/app/db/db.provider';
import { ApiAuthUsers, ApiAuthUsersInfo, DB, Json } from '@/app/db/dto/db.dto';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { Workbook } from 'exceljs';
import { Kysely, Updateable, sql } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { ExtraClaims, JwtPayload } from '../auth.jwt.dto';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { PrivyClient } from '@privy-io/node';
import { LinkedAccount } from '@privy-io/node/resources/users';
import { UsersService } from '@/data/services/users.services';
import { GithubService } from '@/api/services/github.services';
import { join } from 'path';
import { randomInt } from 'crypto';

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

@Injectable()
@Console()
export class AuthService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly githubService: GithubService,
  ) {}

  private createPrivyClient() {
    return new PrivyClient({
      appId: this.configService.get<string>('PRIVY_APP_ID'),
      appSecret: this.configService.get<string>('PRIVY_APP_SECRET'),
    });
  }

  async login(body: LoginReqDto) {
    const res = await this.getInfoFormGithubOAuth(body.code);

    const findUser = await this.db
      .selectFrom('api.auth_users_binds')
      .selectAll()
      .where('bind_openid', '=', String(res.data.id))
      .executeTakeFirst();

    let uid = findUser?.bind_uid || '0';

    if (!findUser) {
      const [newUser] = await this.db
        .insertInto('api.auth_users')
        .values({
          user_nick_name: res.data.username,
          user_avatar: res.data.avatar,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returningAll()
        .execute();

      await this.db
        .insertInto('api.auth_users_binds')
        .values([
          {
            bind_key: res.data.username,
            bind_openid: String(res.data.id),
            bind_secret: res.token.access_token,
            bind_type: 'github',
            bind_uid: newUser.user_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            bind_key: res.data.email,
            bind_openid: String(res.data.id),
            bind_secret: '',
            bind_type: 'email',
            bind_uid: newUser.user_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .execute();

      uid = newUser.user_id;
    }

    return { token: await this.generateOAuthServerToken(uid, 'github') };
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

    const extraClaims: ExtraClaims = {
      allowed_roles: ['user', ...role.map((r) => r.user_role_name)],
      default_role: 'user',
      user_id: data.uid,
    };

    return {
      profile: user,
      binds: binds,
      role: extraClaims,
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
    body: UpdateUserExtraReqDto,
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

    const github = await this.userService.getPrivyGithubUsername(uid);

    return {
      profile: user,
      github: github,
    };
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

    const github = await this.userService.getPrivyGithubUsername(uid);
    const inviter = await this.getInviterByUid(uid, tag);

    return {
      profile: user,
      github: github,
      inviter: inviter,
    };
  }

  async getInviterByUid(uid: string, tag: string) {
    const invite = await this.db
      .selectFrom('api.users_invite')
      .selectAll()
      .where('invite_uid', '=', uid)
      .where('invite_source_type', '=', tag)
      .executeTakeFirst();

    if (!invite) {
      return null;
    }

    return invite;
  }

  async updateUserInfo(user: JwtPayload, body: UpdateUserReqDto) {
    const updatePayload = Object.fromEntries(
      Object.entries(body).filter(([, value]) => value !== undefined),
    ) as Partial<Updateable<ApiAuthUsers>>;

    if (Array.isArray(updatePayload.user_custom_labels)) {
      updatePayload.user_custom_labels = JSON.stringify(
        updatePayload.user_custom_labels,
      ) as Json;
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

  async updateUserInfoV2(
    user: JwtPayload,
    body: UpdateUserReqDto,
    tag: string,
  ) {
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
      ) as Json;
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

  async generateOAuthServerToken(uid: string, type: string) {
    const roles = await this.db
      .selectFrom('api.auth_users_roles')
      .select(['user_role_name'])
      .where('user_role_uid', '=', uid)
      .execute();

    const allowedRoles: string[] = [
      'user',
      ...roles.map((role) => role.user_role_name),
    ];

    const claims = new JwtPayload();
    claims.uid = uid;
    claims.iss = 'web3insights.app';
    claims.exp = Math.floor(Date.now() / 1000) + 2592000;
    claims.type = type;
    claims.extra = {
      claims: {
        allowed_roles: allowedRoles,
        default_role: 'user',
        user_id: uid,
      },
    };

    const jwt = await this.jwtService.signAsync(JSON.stringify(claims), {
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    return jwt;
  }

  async bindWallet(uid: string, body: AuthBindWalletReqDto) {
    const checkUser = await this.db
      .selectFrom('api.auth_users_binds')
      .select(['bind_id'])
      .where('bind_uid', '=', uid)
      .where('bind_type', '=', 'wallet')
      .executeTakeFirst();

    if (checkUser) {
      throw new Error('Wallet already bound');
    }

    const maigcCheck = await this.db
      .selectFrom('api.auth_magic')
      .select(['id', 'magic'])
      .where('uid', '=', uid)
      .where('magic', '=', body.magic)
      .where('created_at', '>', new Date(Date.now() - 120 * 1000))
      .where('status', '=', 0)
      .limit(1)
      .orderBy('created_at', 'desc')
      .executeTakeFirst();

    if (maigcCheck) {
      await this.db
        .updateTable('api.auth_magic')
        .set({ status: 1 })
        .where('id', '=', maigcCheck.id)
        .execute();
    } else {
      throw new Error('Magic number not found or expired');
    }

    const decodedAddress = ethers.verifyMessage(
      body.magic,
      body.signature.toString(),
    );

    if (decodedAddress.toLowerCase() !== body.address.toLowerCase()) {
      throw new Error('Signature verification failed');
    }

    const bindCheck = await this.db
      .selectFrom('api.auth_users_binds')
      .select(['api.auth_users_binds.bind_key'])
      .where('bind_openid', '=', body.address.toLowerCase())
      .where('bind_type', '=', 'wallet')
      .executeTakeFirst();

    if (bindCheck) {
      throw new Error('Wallet already bound');
    }
    await this.db
      .insertInto('api.auth_users_binds')
      .values({
        bind_key: body.address.toLowerCase(),
        bind_type: 'wallet',
        bind_uid: uid,
      })
      .execute();
    return { success: true };
  }

  private extractNonceFromMessage(message: string): string {
    const nonceMatch = message.match(/Nonce: ([^\n]+)/);
    if (!nonceMatch) {
      throw new Error('Unable to extract nonce from message');
    }
    return nonceMatch[1];
  }

  async genMagicNumber(uid: string) {
    const number =
      'Web3Insight: ' +
      String(Math.floor(10000000 + Math.random() * 90000000).toString());
    const set = await this.db
      .insertInto('api.auth_magic')
      .values({
        uid: uid,
        magic: number,
        created_at: new Date().toISOString(),
      })
      .returning('magic')
      .executeTakeFirst();
    return set;
  }

  async getInfoFormGithubOAuth(code: string) {
    const response = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.configService.get<string>('GITHUB_OAUTH_CLIENT'),
          client_secret: this.configService.get<string>('GITHUB_OAUTH_SECRET'),
          code,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `GitHub OAuth token error: ${error.error_description || error.error}`,
      );
    }

    const tokenData = (await response.json()) as OAuth2TokenResponse;

    if (!tokenData.access_token) {
      throw new Error('GitHub OAuth: No access token received');
    }

    const client = new Octokit({
      auth: tokenData.access_token,
    });

    const userResponse = await client.users.getAuthenticated();

    if (!userResponse.data.email) {
      const email = await client.users.listEmailsForAuthenticatedUser();
      userResponse.data.email = email.data.find((e: any) => e.primary)?.email;
    }

    const token = tokenData;

    const data: OAuthUserData = {
      id: String(userResponse.data.id),
      username: userResponse.data.login,
      avatar: userResponse.data.avatar_url,
      email: userResponse.data.email,
    };

    return { token, data };
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
    const clientId = this.configService.get<string>('OPENBUILD_OAUTH_CLIENT');
    const clientSecret = this.configService.get<string>(
      'OPENBUILD_OAUTH_SECRET',
    );

    if (!clientId || !clientSecret) {
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
            `${clientId}:${clientSecret}`,
          ).toString('base64')}`,
        },
        body: JSON.stringify({
          code,
        }),
      },
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json().catch(() => null);
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
      const error = await userResponse.json().catch(() => null);
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

  async getOpenBuildUserRecord(uid: string) {
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
      const error = await response.json().catch(() => null);
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
  }> {
    if (!userDid) {
      return null;
    }

    const client = this.createPrivyClient();
    const user = await client.users()._get(userDid);

    return {
      user_id: user.id,
      linked_accounts: user.linked_accounts || [],
    };
  }

  @Command({
    command: 'test:oauth:fn',
    description: '',
  })
  async test() {
    // test run
    const res = await this.getPrivyUserBindings(
      'did:privy:cmicpey8k05wpl10c4vz978fz',
    );
    console.log('Privy User Bindings:', res);
  }

  @Command({
    command: 'test:sign:fn',
    description: '',
  })
  async sign() {
    const claims = new JwtPayload();
    claims.uid = '181259';
    claims.iss = 'web3insights.app';
    claims.exp = Math.floor(Date.now() / 1000) + 31536000;
    claims.type = 'admin';
    claims.extra = {
      claims: {
        allowed_roles: ['user', 'admin'],
        default_role: 'user',
        user_id: '181259',
      },
    };

    const jwt = await this.jwtService.signAsync(JSON.stringify(claims), {
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    console.log('JWT:', jwt);
  }

  @Command({
    command: 'export:mantle:missing-github',
    description: 'Export mantle users without github handle from Privy',
  })
  async exportMantleMissingGithubHandles() {
    const array = [];

    const handleToUrls = new Map<string, string[]>();
    for (const url of array) {
      const handle = this.githubService.extractUsername(url);
      if (!handle) {
        continue;
      }
      const normalizedHandle = handle.trim();
      if (!normalizedHandle) {
        continue;
      }
      const existing = handleToUrls.get(normalizedHandle) ?? [];
      existing.push(url);
      handleToUrls.set(normalizedHandle, existing);
    }
    const githubHandles = Array.from(handleToUrls.keys());

    const mantleUsers = await this.db
      .selectFrom('api.auth_users_info')
      .select(['user_id'])
      .where('user_info_type', '=', 'mantle')
      .where('user_id', 'is not', null)
      .execute();

    const mantleUserIds = mantleUsers
      .map((user) => user.user_id)
      .filter((userId): userId is NonNullable<typeof userId> => !!userId);

    if (mantleUserIds.length === 0) {
      console.log('No mantle users found');
      return [];
    }

    const privyBinds = await this.db
      .selectFrom('api.auth_users_binds')
      .select(['bind_uid', 'bind_openid'])
      .where('bind_type', '=', 'privy')
      .where('bind_uid', 'in', mantleUserIds)
      .execute();

    const privyBindByUid = new Map(
      privyBinds.map((bind) => [String(bind.bind_uid), bind.bind_openid]),
    );

    const privyBindingsCache = new Map<
      string,
      Promise<{ user_id: string; linked_accounts: LinkedAccount[] } | null>
    >();
    const getCachedBindings = async (userDid?: string | null) => {
      if (!userDid) {
        return null;
      }
      if (privyBindingsCache.has(userDid)) {
        return privyBindingsCache.get(userDid) ?? null;
      }
      const fetchPromise = this.getPrivyUserBindings(userDid).catch((error) => {
        privyBindingsCache.delete(userDid);
        throw error;
      });
      privyBindingsCache.set(userDid, fetchPromise);
      return fetchPromise;
    };

    const mantleGithubHandles = new Set<string>();
    for (const userId of mantleUserIds) {
      const privyDid = privyBindByUid.get(String(userId));
      if (!privyDid) {
        continue;
      }
      const bindings = await getCachedBindings(privyDid);
      const githubAccount = bindings?.linked_accounts.find(
        (acc) => acc.type === 'github_oauth',
      );
      if (githubAccount?.username) {
        mantleGithubHandles.add(String(githubAccount.username).toLowerCase());
      }
    }

    const missingGithubHandles = githubHandles.filter(
      (handle) => !mantleGithubHandles.has(handle.toLowerCase()),
    );
    for (const handle of missingGithubHandles) {
      console.log(handle);
    }
    return missingGithubHandles;
  }

  @Command({
    command: 'sync:mantle:github',
    description:
      'Sync missing profile fields for imported mantle users from GitHub',
  })
  async syncMantleImportedUsersFromGithub() {
    const query = this.db
      .selectFrom('api.auth_users_info')
      .select([
        'user_id',
        'user_nick_name',
        'user_avatar',
        'user_bio',
        'user_custom_x',
        'user_title',
      ])
      .where(
        sql<boolean>`${sql.ref('api.auth_users_info.mark')}->>'type' = ${'mantle'}`,
      );

    const users = await query.execute();

    if (users.length === 0) {
      console.log('No mantle import users need sync');
      return { updated: 0, skipped: 0, failed: 0 };
    }

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const user of users) {
      if (user.user_id == null) {
        skipped += 1;
        continue;
      }
      const userId = String(user.user_id);
      const handle = this.githubService.extractUsername(
        user.user_nick_name ?? '',
      );
      if (!handle) {
        skipped += 1;
        continue;
      }

      try {
        const profile =
          await this.githubService.getUserProfileByUsername(handle);

        const updatePayload = {} as Partial<Updateable<ApiAuthUsersInfo>>;

        if (!user.user_avatar && profile.avatar_url) {
          updatePayload.user_avatar = profile.avatar_url;
        }
        if (!user.user_bio && profile.bio) {
          updatePayload.user_bio = profile.bio;
        }
        if (!user.user_custom_x && profile.twitter_username) {
          updatePayload.user_custom_x = profile.twitter_username;
        }
        if (!user.user_title && profile.name) {
          updatePayload.user_title = profile.name;
        }

        if (Object.keys(updatePayload).length === 0) {
          skipped += 1;
          continue;
        }

        await this.db
          .updateTable('api.auth_users_info')
          .set({
            ...updatePayload,
            updated_at: new Date().toISOString(),
          })
          .where('user_id', '=', userId)
          .where('user_info_type', '=', 'mantle')
          .execute();

        updated += 1;
      } catch (error) {
        failed += 1;
        console.error(
          `Failed to sync GitHub profile for ${user.user_nick_name}:`,
          error,
        );
      }
    }

    console.log(
      `Synced mantle import users: updated=${updated} skipped=${skipped} failed=${failed}`,
    );
    return { updated, skipped, failed };
  }

  @Command({
    command: 'export:mantle:users',
    description: 'Export mantle users with name from Privy or user_nick_name',
  })
  async exportMantleUsersWithGithub() {
    const users = await this.db
      .selectFrom('api.auth_users_info')
      .select([
        'user_id',
        'user_info_type',
        'user_nick_name',
        'user_avatar',
        'user_bio',
        'user_custom_x',
      ])
      .where('user_info_type', '=', 'mantle')
      .execute();

    if (users.length === 0) {
      console.log('No mantle users found');
      return { count: 0 };
    }

    const userIds = users
      .map((user) => user.user_id)
      .filter((userId): userId is NonNullable<typeof userId> => userId != null)
      .map((userId) => String(userId));

    const privyBindByUid = new Map<string, string>();
    if (userIds.length > 0) {
      const privyBinds = await this.db
        .selectFrom('api.auth_users_binds')
        .select(['bind_uid', 'bind_openid'])
        .where('bind_type', '=', 'privy')
        .where('bind_uid', 'in', userIds)
        .execute();

      privyBinds.forEach((bind) => {
        if (bind.bind_openid) {
          privyBindByUid.set(String(bind.bind_uid), bind.bind_openid);
        }
      });
    }

    const privyBindingsCache = new Map<
      string,
      Promise<{ user_id: string; linked_accounts: LinkedAccount[] } | null>
    >();
    const getCachedBindings = async (userDid?: string | null) => {
      if (!userDid) {
        return null;
      }
      if (privyBindingsCache.has(userDid)) {
        return privyBindingsCache.get(userDid) ?? null;
      }
      const fetchPromise = this.getPrivyUserBindings(userDid).catch((error) => {
        privyBindingsCache.delete(userDid);
        throw error;
      });
      privyBindingsCache.set(userDid, fetchPromise);
      return fetchPromise;
    };

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('mantle_users');
    sheet.addRow(['id', 'type', 'github', 'avatar', 'bio', 'x']);

    for (const user of users) {
      const userId = user.user_id == null ? '' : String(user.user_id);
      const privyDid = userId ? privyBindByUid.get(userId) : undefined;

      let github = '';
      if (privyDid) {
        const bindings = await getCachedBindings(privyDid);
        const githubAccount = bindings?.linked_accounts.find(
          (acc) => acc.type === 'github_oauth',
        );
        github = githubAccount?.username || '';
      } else {
        github = user.user_nick_name ?? '';
      }

      sheet.addRow([
        userId,
        user.user_info_type ?? '',
        github,
        user.user_avatar ?? '',
        user.user_bio ?? '',
        user.user_custom_x ?? '',
      ]);
    }

    const outputPath = join(process.cwd(), 'mantle_users.csv');
    await workbook.csv.writeFile(outputPath);
    console.log(`Exported ${users.length} rows to ${outputPath}`);

    return { count: users.length, outputPath };
  }

  @Command({
    command: 'export:mantle:lottery',
    description:
      'Export mantle users for lottery (exclude import users, random 30)',
  })
  async exportMantleLotteryUsers() {
    // Query users where mark->>'form' is not 'import'
    const users = await this.db
      .selectFrom('api.auth_users_info')
      .select([
        'user_id',
        'user_info_type',
        'user_nick_name',
        'user_avatar',
        'user_bio',
        'user_custom_x',
      ])
      .where('user_info_type', '=', 'mantle')
      .where(
        sql<boolean>`(${sql.ref('api.auth_users_info.mark')}->>'form') IS NULL OR (${sql.ref('api.auth_users_info.mark')}->>'form') != ${'import'}`,
      )
      .execute();

    if (users.length === 0) {
      console.log('No mantle users found');
      return { count: 0 };
    }

    const userIds = users
      .map((user) => user.user_id)
      .filter((userId): userId is NonNullable<typeof userId> => userId != null)
      .map((userId) => String(userId));

    const privyBindByUid = new Map<string, string>();
    if (userIds.length > 0) {
      const privyBinds = await this.db
        .selectFrom('api.auth_users_binds')
        .select(['bind_uid', 'bind_openid'])
        .where('bind_type', '=', 'privy')
        .where('bind_uid', 'in', userIds)
        .execute();

      privyBinds.forEach((bind) => {
        if (bind.bind_openid) {
          privyBindByUid.set(String(bind.bind_uid), bind.bind_openid);
        }
      });
    }

    const privyBindingsCache = new Map<
      string,
      Promise<{ user_id: string; linked_accounts: LinkedAccount[] } | null>
    >();
    const getCachedBindings = async (userDid?: string | null) => {
      if (!userDid) {
        return null;
      }
      if (privyBindingsCache.has(userDid)) {
        return privyBindingsCache.get(userDid) ?? null;
      }
      const fetchPromise = this.getPrivyUserBindings(userDid).catch((error) => {
        privyBindingsCache.delete(userDid);
        throw error;
      });
      privyBindingsCache.set(userDid, fetchPromise);
      return fetchPromise;
    };

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('mantle_lottery');
    sheet.addRow(['id', 'type', 'github', 'avatar', 'bio', 'x']);

    // Collect all rows first for shuffling
    const allRows: Array<{
      userId: string;
      userInfoType: string;
      github: string;
      avatar: string;
      bio: string;
      x: string;
    }> = [];

    for (const user of users) {
      const userId = user.user_id == null ? '' : String(user.user_id);
      const privyDid = userId ? privyBindByUid.get(userId) : undefined;

      let github = '';
      if (privyDid) {
        const bindings = await getCachedBindings(privyDid);
        const githubAccount = bindings?.linked_accounts.find(
          (acc) => acc.type === 'github_oauth',
        );
        github = githubAccount?.username || '';
      } else {
        github = user.user_nick_name ?? '';
      }

      allRows.push({
        userId,
        userInfoType: user.user_info_type ?? '',
        github,
        avatar: user.user_avatar ?? '',
        bio: user.user_bio ?? '',
        x: user.user_custom_x ?? '',
      });
    }

    // Shuffle array using Fisher-Yates algorithm with crypto random
    for (let i = allRows.length - 1; i > 0; i--) {
      const j = randomInt(0, i + 1);
      [allRows[i], allRows[j]] = [allRows[j], allRows[i]];
    }

    // Take first 30 or all if less than 30
    const selectedRows = allRows.slice(0, Math.min(30, allRows.length));

    // Write selected rows to sheet
    for (const row of selectedRows) {
      sheet.addRow([
        row.userId,
        row.userInfoType,
        row.github,
        row.avatar,
        row.bio,
        row.x,
      ]);
    }

    const outputPath = join(process.cwd(), 'mantle_lottery.csv');
    await workbook.csv.writeFile(outputPath);
    console.log(
      `Exported ${selectedRows.length} winners (from ${allRows.length} total) to ${outputPath}`,
    );

    return { count: selectedRows.length, total: allRows.length, outputPath };
  }

  private getMantleInviteGithubList(): string[] {
    return [];
  }

  private buildGithubHandleSet(rawGithubList: string[]): Set<string> {
    const targetGithubHandles = new Set<string>();
    for (const entry of rawGithubList) {
      const handle = this.githubService.extractUsername(String(entry));
      if (!handle) {
        continue;
      }
      const normalized = handle.trim().toLowerCase();
      if (!normalized) {
        continue;
      }
      targetGithubHandles.add(normalized);
    }
    return targetGithubHandles;
  }

  private normalizeUidValue(value: unknown): string | null {
    if (value == null) {
      return null;
    }
    if (typeof value === 'string') {
      const normalized = value.trim();
      return normalized ? normalized : null;
    }
    if (typeof value === 'number' || typeof value === 'bigint') {
      return String(value);
    }
    return null;
  }

  private getInviteTransferTargetUid(
    mark: Json | null | undefined,
  ): string | null {
    if (!mark || typeof mark !== 'object' || Array.isArray(mark)) {
      return null;
    }
    const transfer = (mark as Record<string, unknown>).transfer;
    if (!transfer || typeof transfer !== 'object' || Array.isArray(transfer)) {
      return null;
    }
    const toUid = (transfer as Record<string, unknown>).to_uid;
    return this.normalizeUidValue(toUid);
  }

  private resolveInviteEffectiveInviterUid(
    inviteSourceUid: unknown,
    mark: Json | null | undefined,
  ): string {
    const transferTargetUid = this.getInviteTransferTargetUid(mark);
    if (transferTargetUid) {
      return transferTargetUid;
    }
    return this.normalizeUidValue(inviteSourceUid) ?? '';
  }

  private async resolveGithubByUidList(
    uidList: string[],
    privyBindingsCache: Map<
      string,
      Promise<{ user_id: string; linked_accounts: LinkedAccount[] } | null>
    >,
  ): Promise<Map<string, string>> {
    const githubByUid = new Map<string, string>();
    if (uidList.length === 0) {
      return githubByUid;
    }

    const privyBinds = await this.db
      .selectFrom('api.auth_users_binds')
      .select(['bind_uid', 'bind_openid'])
      .where('bind_type', '=', 'privy')
      .where('bind_uid', 'in', uidList)
      .execute();

    const privyDidByUid = new Map<string, string>();
    for (const bind of privyBinds) {
      if (bind.bind_openid) {
        privyDidByUid.set(String(bind.bind_uid), bind.bind_openid);
      }
    }

    const users = await this.db
      .selectFrom('api.auth_users')
      .select(['user_id', 'user_nick_name'])
      .where('user_id', 'in', uidList)
      .execute();

    const nicknameByUid = new Map<string, string>();
    for (const user of users) {
      const userId = user.user_id == null ? '' : String(user.user_id);
      if (userId && user.user_nick_name) {
        nicknameByUid.set(userId, user.user_nick_name);
      }
    }

    const getCachedBindings = async (userDid?: string | null) => {
      if (!userDid) {
        return null;
      }
      if (privyBindingsCache.has(userDid)) {
        return privyBindingsCache.get(userDid) ?? null;
      }
      const fetchPromise = this.getPrivyUserBindings(userDid).catch((error) => {
        privyBindingsCache.delete(userDid);
        throw error;
      });
      privyBindingsCache.set(userDid, fetchPromise);
      return fetchPromise;
    };

    for (const uid of uidList) {
      let github = '';
      const privyDid = privyDidByUid.get(uid);
      if (privyDid) {
        const bindings = await getCachedBindings(privyDid);
        const githubAccount = bindings?.linked_accounts.find(
          (acc) => acc.type === 'github_oauth',
        );
        github = githubAccount?.username || '';
      }
      if (!github) {
        github = nicknameByUid.get(uid) ?? '';
      }
      if (github) {
        const normalizedGithub = this.githubService.extractUsername(github);
        if (normalizedGithub) {
          githubByUid.set(uid, normalizedGithub.toLowerCase());
        }
      }
    }

    return githubByUid;
  }

  @Command({
    command: 'export:mantle:invite-summary',
    description:
      'Export mantle invite summary with total invites and matched GitHub list counts',
  })
  async exportMantleInviteSummary() {
    const rawGithubList = this.getMantleInviteGithubList();
    const targetGithubHandles = this.buildGithubHandleSet(rawGithubList);

    if (targetGithubHandles.size === 0) {
      console.log('GitHub list is empty, matched count will be 0');
    }

    const invites = await this.db
      .selectFrom('api.users_invite')
      .select(['invite_source_uid', 'invite_uid', 'mark'])
      .where('invite_source_type', '=', 'mantle')
      .execute();

    if (invites.length === 0) {
      console.log('No mantle invites found');
      return { count: 0 };
    }

    const inviterStats = new Map<
      string,
      {
        inviterUid: string;
        inviteeUids: Set<string>;
        matchedInviteeUids: Set<string>;
      }
    >();

    const ensureStats = (inviterUid: string) => {
      const existing = inviterStats.get(inviterUid);
      if (existing) {
        return existing;
      }
      const created = {
        inviterUid,
        inviteeUids: new Set<string>(),
        matchedInviteeUids: new Set<string>(),
      };
      inviterStats.set(inviterUid, created);
      return created;
    };

    const inviteeUids = new Set<string>();
    for (const invite of invites) {
      const inviterUid = this.resolveInviteEffectiveInviterUid(
        invite.invite_source_uid,
        invite.mark,
      );
      const inviteeUid =
        invite.invite_uid == null ? '' : String(invite.invite_uid);
      if (!inviterUid || !inviteeUid) {
        continue;
      }
      ensureStats(inviterUid).inviteeUids.add(inviteeUid);
      inviteeUids.add(inviteeUid);
    }

    const privyBindingsCache = new Map<
      string,
      Promise<{ user_id: string; linked_accounts: LinkedAccount[] } | null>
    >();

    const inviteeUidList = Array.from(inviteeUids);
    const inviteeGithubByUid =
      targetGithubHandles.size > 0 && inviteeUidList.length > 0
        ? await this.resolveGithubByUidList(inviteeUidList, privyBindingsCache)
        : new Map<string, string>();

    const inviterUidList = Array.from(inviterStats.keys());
    const inviterGithubByUid = await this.resolveGithubByUidList(
      inviterUidList,
      privyBindingsCache,
    );

    if (targetGithubHandles.size > 0 && inviteeUidList.length > 0) {
      for (const invite of invites) {
        const inviterUid = this.resolveInviteEffectiveInviterUid(
          invite.invite_source_uid,
          invite.mark,
        );
        const inviteeUid =
          invite.invite_uid == null ? '' : String(invite.invite_uid);
        if (!inviterUid || !inviteeUid) {
          continue;
        }
        const inviteeGithub = inviteeGithubByUid.get(inviteeUid);
        if (inviteeGithub && targetGithubHandles.has(inviteeGithub)) {
          ensureStats(inviterUid).matchedInviteeUids.add(inviteeUid);
        }
      }
    }

    const rows = Array.from(inviterStats.values())
      .map((stats) => ({
        inviterUid: stats.inviterUid,
        inviteeCount: stats.inviteeUids.size,
        matchedCount: stats.matchedInviteeUids.size,
        inviterGithub: inviterGithubByUid.get(stats.inviterUid) ?? '',
      }))
      .sort((a, b) => {
        if (b.inviteeCount !== a.inviteeCount) {
          return b.inviteeCount - a.inviteeCount;
        }
        if (b.matchedCount !== a.matchedCount) {
          return b.matchedCount - a.matchedCount;
        }
        return a.inviterUid.localeCompare(b.inviterUid);
      });

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('mantle_invite_summary');
    sheet.addRow([
      'inviter_uid',
      'inviter_github',
      'invitee_count',
      'matched_github_count',
    ]);
    for (const row of rows) {
      sheet.addRow([
        row.inviterUid,
        row.inviterGithub,
        row.inviteeCount,
        row.matchedCount,
      ]);
    }

    const outputPath = join(process.cwd(), 'mantle_invite_summary.csv');
    await workbook.csv.writeFile(outputPath);
    console.log(`Exported ${rows.length} rows to ${outputPath}`);

    return { count: rows.length, outputPath };
  }

  @Command({
    command: 'transfer:mantle:invites [from_uid] [to_uid] [limit]',
    description:
      'Transfer mantle invites with GitHub list matches to a new inviter',
  })
  async transferMantleInvites(
    fromUid = '181361',
    toUid = '181428',
    limitValue = '6',
  ) {
    const normalizedFromUid = fromUid?.trim();
    const normalizedToUid = toUid?.trim();
    const limit = Number(limitValue);

    if (!normalizedFromUid || !normalizedToUid) {
      throw new Error('from_uid and to_uid are required');
    }
    if (!Number.isFinite(limit) || limit <= 0) {
      throw new Error('limit must be a positive number');
    }
    if (normalizedFromUid === normalizedToUid) {
      console.log('from_uid equals to_uid, nothing to transfer');
      return { count: 0 };
    }

    const rawGithubList = this.getMantleInviteGithubList();
    const targetGithubHandles = this.buildGithubHandleSet(rawGithubList);
    if (targetGithubHandles.size === 0) {
      console.log('GitHub list is empty, no transfer will be applied');
      return { count: 0 };
    }

    const invites = await this.db
      .selectFrom('api.users_invite')
      .select(['id', 'invite_uid', 'invite_source_uid', 'mark', 'created_at'])
      .where('invite_source_type', '=', 'mantle')
      .where('invite_source_uid', '=', normalizedFromUid)
      .execute();

    if (invites.length === 0) {
      console.log('No mantle invites found for inviter');
      return { count: 0 };
    }

    const inviteeUids = new Set<string>();
    for (const invite of invites) {
      const inviteeUid =
        invite.invite_uid == null ? '' : String(invite.invite_uid);
      if (!inviteeUid) {
        continue;
      }
      inviteeUids.add(inviteeUid);
    }

    const inviteeUidList = Array.from(inviteeUids);
    const privyBindingsCache = new Map<
      string,
      Promise<{ user_id: string; linked_accounts: LinkedAccount[] } | null>
    >();
    const inviteeGithubByUid = await this.resolveGithubByUidList(
      inviteeUidList,
      privyBindingsCache,
    );

    const matchedInvites = invites.filter((invite) => {
      const inviteeUid =
        invite.invite_uid == null ? '' : String(invite.invite_uid);
      if (!inviteeUid) {
        return false;
      }
      if (this.getInviteTransferTargetUid(invite.mark)) {
        return false;
      }
      const inviteeGithub = inviteeGithubByUid.get(inviteeUid);
      return (
        !!inviteeGithub && targetGithubHandles.has(inviteeGithub.toLowerCase())
      );
    });

    if (matchedInvites.length === 0) {
      console.log('No matched invites found for transfer');
      return { count: 0 };
    }

    const toNumber = (value: unknown, fallback: number) => {
      if (value == null) {
        return fallback;
      }
      const num = Number(value);
      return Number.isNaN(num) ? fallback : num;
    };

    matchedInvites.sort((a, b) => {
      const createdA = toNumber(a.created_at, Number.MAX_SAFE_INTEGER);
      const createdB = toNumber(b.created_at, Number.MAX_SAFE_INTEGER);
      if (createdA !== createdB) {
        return createdA - createdB;
      }
      const idA = toNumber(a.id, Number.MAX_SAFE_INTEGER);
      const idB = toNumber(b.id, Number.MAX_SAFE_INTEGER);
      return idA - idB;
    });

    const selectedInvites = matchedInvites.slice(0, limit);
    const selectedIds = selectedInvites
      .map((invite) => invite.id)
      .filter((id): id is NonNullable<typeof id> => id != null)
      .map((id) => String(id));

    if (selectedIds.length === 0) {
      console.log('No invite ids available for transfer');
      return { count: 0 };
    }

    const transferredAt = new Date().toISOString();
    await this.db
      .updateTable('api.users_invite')
      .set({
        mark: sql<Json>`COALESCE(${sql.ref('api.users_invite.mark')}, '{}'::jsonb) || jsonb_build_object(
          'transfer',
          jsonb_build_object(
            'from_uid',
            ${normalizedFromUid},
            'to_uid',
            ${normalizedToUid},
            'reason',
            ${'github_list_match'},
            'transferred_at',
            ${transferredAt}
          )
        )`,
      })
      .where('id', 'in', selectedIds)
      .where('invite_source_uid', '=', normalizedFromUid)
      .execute();

    console.log(
      `Transferred ${selectedIds.length} invites from ${normalizedFromUid} to ${normalizedToUid}`,
    );

    return { count: selectedIds.length, ids: selectedIds };
  }

  @Command({
    command: 'export:invites [invite_source_type]',
    description:
      'Export invite relationships with user bindings from Privy (optional invite_source_type filter)',
  })
  async exportInvites(inviteSourceType?: string) {
    let query = this.db.selectFrom('api.users_invite').selectAll();
    const filterValue = inviteSourceType?.trim();
    if (filterValue) {
      query = query.where('invite_source_type', '=', filterValue);
    }
    const invites = await query.execute();

    console.log(`Found ${invites.length} invite records`);

    const privyBindingsCache = new Map<
      string,
      Promise<{ user_id: string; linked_accounts: LinkedAccount[] } | null>
    >();
    const getCachedBindings = async (userDid?: string | null) => {
      if (!userDid) {
        return null;
      }
      if (privyBindingsCache.has(userDid)) {
        return privyBindingsCache.get(userDid) ?? null;
      }
      const fetchPromise = this.getPrivyUserBindings(userDid).catch((error) => {
        privyBindingsCache.delete(userDid);
        throw error;
      });
      privyBindingsCache.set(userDid, fetchPromise);
      return fetchPromise;
    };

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('invites');
    sheet.addRow([
      'invite_id',
      'invite_source_type',
      'inviter_uid',
      'inviter_emails',
      'inviter_github_username',
      'invitee_uid',
      'invitee_emails',
      'invitee_github_username',
      'created_at',
      'updated_at',
    ]);
    let rowCount = 0;

    for (const invite of invites) {
      // Get inviter's privy_did
      const inviterPrivyBind = await this.db
        .selectFrom('api.auth_users_binds')
        .select(['bind_openid'])
        .where('bind_uid', '=', String(invite.invite_source_uid))
        .where('bind_type', '=', 'privy')
        .executeTakeFirst();

      // Get invitee's privy_did
      const inviteePrivyBind = await this.db
        .selectFrom('api.auth_users_binds')
        .select(['bind_openid'])
        .where('bind_uid', '=', String(invite.invite_uid))
        .where('bind_type', '=', 'privy')
        .executeTakeFirst();

      // Get bindings from Privy
      const inviterBindings = inviterPrivyBind
        ? await getCachedBindings(inviterPrivyBind.bind_openid)
        : null;

      const inviteeBindings = inviteePrivyBind
        ? await getCachedBindings(inviteePrivyBind.bind_openid)
        : null;

      // Extract emails and github usernames
      const inviterEmails =
        inviterBindings?.linked_accounts
          .filter((acc) => acc.type === 'email')
          .map((acc) => (acc as any).address)
          .filter(Boolean) || [];

      const inviterGithub = inviterBindings?.linked_accounts.find(
        (acc) => acc.type === 'github_oauth',
      );

      const inviteeEmails =
        inviteeBindings?.linked_accounts
          .filter((acc) => acc.type === 'email')
          .map((acc) => (acc as any).address)
          .filter(Boolean) || [];

      const inviteeGithub = inviteeBindings?.linked_accounts.find(
        (acc) => acc.type === 'github_oauth',
      );

      sheet.addRow([
        invite.id ?? '',
        invite.invite_source_type ?? '',
        invite.invite_source_uid ?? '',
        inviterEmails.join(';'),
        inviterGithub?.username || '',
        invite.invite_uid ?? '',
        inviteeEmails.join(';'),
        inviteeGithub?.username || '',
        invite.created_at ?? '',
        invite.updated_at ?? '',
      ]);
      rowCount += 1;
    }

    const outputPath = join(process.cwd(), 'invites.csv');
    await workbook.csv.writeFile(outputPath);
    console.log(`Exported ${rowCount} rows to ${outputPath}`);
  }

  @Command({
    command: 'sync:privy:github',
    description: 'Sync GitHub bindings from Privy to database',
  })
  async syncPrivyGithubBindings() {
    console.log('Starting sync of GitHub bindings from Privy...');

    const privyBinds = await this.db
      .selectFrom('api.auth_users_binds')
      .select(['bind_uid', 'bind_openid'])
      .where('bind_type', '=', 'privy')
      .execute();

    console.log(`Found ${privyBinds.length} users with privy bindings`);

    if (privyBinds.length === 0) {
      return { processed: 0, added: 0, updated: 0, failed: 0 };
    }

    const uids = privyBinds.map((b) => String(b.bind_uid));
    const existingGithubBinds = await this.db
      .selectFrom('api.auth_users_binds')
      .select(['bind_id', 'bind_uid', 'bind_key', 'bind_openid'])
      .where('bind_type', '=', 'github')
      .where('bind_uid', 'in', uids)
      .execute();

    const githubBindByUid = new Map<
      string,
      { bind_id: string; bind_key: string; bind_openid: string }
    >();
    for (const bind of existingGithubBinds) {
      githubBindByUid.set(String(bind.bind_uid), {
        bind_id: String(bind.bind_id),
        bind_key: bind.bind_key ?? '',
        bind_openid: bind.bind_openid ?? '',
      });
    }

    const privyBindingsCache = new Map<
      string,
      Promise<{ user_id: string; linked_accounts: LinkedAccount[] } | null>
    >();
    const getCachedBindings = async (userDid?: string | null) => {
      if (!userDid) {
        return null;
      }
      if (privyBindingsCache.has(userDid)) {
        return privyBindingsCache.get(userDid) ?? null;
      }
      const fetchPromise = this.getPrivyUserBindings(userDid).catch((error) => {
        privyBindingsCache.delete(userDid);
        console.error(
          `Error fetching privy bindings for ${userDid}:`,
          (error as Error).message ?? error,
        );
        return null;
      });
      privyBindingsCache.set(userDid, fetchPromise);
      return fetchPromise;
    };

    let processed = 0;
    let added = 0;
    let updated = 0;
    let failed = 0;

    for (const privyBind of privyBinds) {
      const uid = String(privyBind.bind_uid);
      processed++;

      try {
        const bindings = await getCachedBindings(privyBind.bind_openid);
        if (!bindings) {
          console.log(`No bindings found for uid ${uid}`);
          continue;
        }

        const githubAccount = bindings.linked_accounts.find(
          (acc: LinkedAccount) => acc.type === 'github_oauth',
        );

        if (!githubAccount || !githubAccount.username) {
          console.log(`No GitHub account found for uid ${uid}`);
          continue;
        }

        const newHandle = String(githubAccount.username);
        const existingBind = githubBindByUid.get(uid);

        if (existingBind) {
          if (existingBind.bind_key !== newHandle) {
            await this.db
              .updateTable('api.auth_users_binds')
              .set({
                bind_key: newHandle,
                updated_at: new Date().toISOString(),
              })
              .where('bind_id', '=', existingBind.bind_id)
              .execute();
            console.log(
              `Updated GitHub handle for uid ${uid}: ${existingBind.bind_key} -> ${newHandle}`,
            );
            updated++;
          } else {
            console.log(`GitHub handle unchanged for uid ${uid}: ${newHandle}`);
          }
        } else {
          await this.db
            .insertInto('api.auth_users_binds')
            .values({
              bind_key: newHandle,
              bind_openid: String(githubAccount.id ?? ''),
              bind_secret: '',
              bind_type: 'github',
              bind_uid: Number(uid),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .execute();
          console.log(`Added GitHub binding for uid ${uid}: ${newHandle}`);
          added++;
        }
      } catch (error) {
        failed++;
        console.error(`Failed to sync uid ${uid}:`, error.message);
      }
    }

    console.log(
      `Sync completed: processed=${processed} added=${added} updated=${updated} failed=${failed}`,
    );

    return { processed, added, updated, failed };
  }
}
