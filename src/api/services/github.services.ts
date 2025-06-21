import { Injectable } from '@nestjs/common';
import { TokenPoolService } from '@/app/db/pool.services';
import { Request } from 'express';

@Injectable()
export class GithubService {
  private readonly githubApiBase = 'https://api.github.com';

  constructor(private readonly tokenPool: TokenPoolService) {}

  private async createRequestHeaders() {
    const token = await this.tokenPool.getToken();
    return {
      token,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
    };
  }

  private extractGitHubPath(req: Request) {
    const proxyPrefix = '/v1/github/proxy';
    return req.path.startsWith(proxyPrefix)
      ? req.path.slice(proxyPrefix.length)
      : req.path;
  }

  async get(req: Request): Promise<unknown> {
    const url = new URL(`${this.githubApiBase}${this.extractGitHubPath(req)}`);

    if (req.query)
      url.search = new URLSearchParams(
        req.query as Record<string, string>,
      ).toString();

    const { token, headers } = await this.createRequestHeaders();
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });
    const data: unknown = await response.json();

    this.tokenPool.updateToken(
      token,
      Object.fromEntries(response.headers.entries()),
    );
    return data;
  }
}
