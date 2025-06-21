import { KYSELY } from './db.provider';
import { DB } from '@/app/db/dto/db.dto';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { ResponseHeaders, RequestError } from '@octokit/types';

class GitHubTokenInfo {
  token: string;
  remaining: number;
  resetTime: number;

  constructor(token: string) {
    this.token = token;
    this.reset();
  }

  reset() {
    this.remaining = 5000;
    this.resetTime = Math.floor(Date.now() / 1000 + 3600);
  }
}

@Injectable()
@Console()
export class TokenPoolService implements OnModuleInit {
  constructor(@Inject(KYSELY) private readonly db: Kysely<DB>) {}

  private tokens: GitHubTokenInfo[] = [];

  async onModuleInit() {
    this.tokens = (
      await this.db
        .selectFrom('api.configs')
        .selectAll()
        .where('name', '=', 'github_tokens')
        .execute()
    ).map((config) => new GitHubTokenInfo(config.body));
  }

  public getClient(): Octokit {
    const currentToken = this.getToken();
    const client = new Octokit({
      auth: currentToken,
    });
    client.hook.after('request', (response) => {
      this.updateToken(currentToken, response.headers);
    });
    return client;
  }

  getToken(): string {
    const now = Math.floor(Date.now() / 1000);

    this.tokens.forEach((info) => {
      if (now > info.resetTime) {
        info.reset();
      }
    });
    const sorted = this.tokens
      .filter((info) => info.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining);

    return sorted[0]?.token || this.tokens[0]?.token;
  }

  updateToken(token: string, headers: ResponseHeaders) {
    const info = this.tokens.find((t) => t.token === token);
    if (info) {
      const newRemaining = parseInt(headers['x-ratelimit-remaining'] || '0');
      const newResetTime = parseInt(headers['x-ratelimit-reset'] || '0');

      if (newResetTime == info.resetTime && newRemaining > info.remaining) {
        return;
      }

      info.remaining = newRemaining;
      info.resetTime = newResetTime;
    }
  }

  updateTokenNum(token: string, num: number = 1) {
    const info = this.tokens.find((t) => t.token === token);
    if (info) {
      info.remaining -= num;
    }
  }

  @Command({
    command: 'test:pool:github',
    description: '',
  })
  async testGithubApi() {
    while (true) {
      const octokit = this.getClient();
      const [owner, repo] = 'bitcoin/bitxx'.split('/');
      try {
        const repoDetails = await octokit.rest.repos.get({
          owner,
          repo,
        });
        console.log(repoDetails);
      } catch (error) {
        const e = error as RequestError;
        console.error(e.status);
      }
    }
  }
}
