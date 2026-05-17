import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import type { ResponseHeaders } from '@octokit/types';

/**
 * Per-token rate-limit info kept in memory. Reset window matches GitHub's
 * 5000 req/h limit; the actual remaining value is updated from x-ratelimit-*
 * response headers via `updateToken`.
 */
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

/**
 * Pure-class port of TokenPoolService. The NestJS version pulled tokens from
 * `api.configs` via OnModuleInit; here tokens are passed in via the constructor
 * (from env `GITHUB_TOKENS`). The container is responsible for splitting the
 * comma-separated env var and calling `init()` if needed.
 */
export class TokenPoolService {
  private tokens: GitHubTokenInfo[] = [];

  constructor(initialTokens: string[] = []) {
    this.init(initialTokens);
  }

  /**
   * Explicit initializer replacing NestJS @OnModuleInit. Safe to call multiple
   * times; the last call wins. # Reason: callers can re-seed the pool without
   * reconstructing the container in test scenarios.
   */
  init(tokens: string[]): void {
    this.tokens = tokens
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => new GitHubTokenInfo(t));
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
}
