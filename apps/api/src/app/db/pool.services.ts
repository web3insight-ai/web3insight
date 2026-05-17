import { KYSELY } from './db.provider';
import { DB } from '@/app/db/dto/db.dto';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
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

export type RepoInfo =
  RestEndpointMethodTypes['repos']['get']['response']['data'];
export type RepoContributor =
  RestEndpointMethodTypes['repos']['listContributors']['response']['data'][number];

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

  public async getClient(sleep: boolean = false): Promise<Octokit> {
    const currentToken = await this.getToken(sleep);
    const client = new Octokit({
      auth: currentToken,
    });
    client.hook.after('request', (response) => {
      this.updateToken(currentToken, response.headers);
    });
    return client;
  }

  async getToken(sleep = false): Promise<string> {
    while (true) {
      const now = Math.floor(Date.now() / 1000);

      this.tokens.forEach((info) => {
        if (now > info.resetTime) {
          info.reset();
        }
      });
      const sorted = this.tokens
        .filter((info) => info.remaining > 0)
        .sort((a, b) => b.remaining - a.remaining);

      if (sorted.length > 0) {
        if (sleep && sorted[0].remaining < 100) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        return sorted[0].token;
      }

      if (!sleep) {
        return this.tokens[0]?.token;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
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
      const octokit = await this.getClient();
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
