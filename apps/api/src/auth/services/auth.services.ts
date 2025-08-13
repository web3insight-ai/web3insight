import { AuthBindWalletReqDto, LoginReqDto } from '@/api/dto/api.dto';
import { KYSELY } from '@/app/db/db.provider';
import { DB } from '@/app/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import { Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { ExtraClaims, JwtPayload } from '../auth.jwt.dto';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

@Injectable()
@Console()
export class AuthService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {}

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
          user_nick_name: res.data.login,
          user_avatar: res.data.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returningAll()
        .execute();

      await this.db
        .insertInto('api.auth_users_binds')
        .values([
          {
            bind_key: res.data.login,
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

    const tokenData = (await response.json()) as GitHubTokenResponse;

    const client = new Octokit({
      auth: tokenData.access_token,
    });

    const userResponse = await client.users.getAuthenticated();

    if (!userResponse.data.email) {
      const email = await client.users.listEmailsForAuthenticatedUser();
      userResponse.data.email = email.data.find((e: any) => e.primary)?.email;
    }

    const token = tokenData;

    return { token, data: userResponse.data };
  }

  @Command({
    command: 'test:oauth:fn',
    description: '',
  })
  async test() {
    const code = 'd3a9d0da9fd38c5df414';
    const res = await this.getInfoFormGithubOAuth(code);
    console.log('Token:', res.token);
    console.log('User:', res.data);
  }
}
