import { Injectable } from '@nestjs/common';
import { TokenPoolService } from '@/db/pool.services';
import { Request } from 'express';

@Injectable()
export class GithubService {
  private readonly githubApiBase = 'https://api.github.com';

  constructor(private readonly tokenPool: TokenPoolService) {}

  private createRequestHeaders() {
    const token = this.tokenPool.getToken();
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

    if (req.query) {
      Object.entries(req.query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, JSON.stringify(value));
        }
      });
    }

    const { token, headers } = this.createRequestHeaders();
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

  async post(req: Request): Promise<unknown> {
    const url = new URL(`${this.githubApiBase}${this.extractGitHubPath(req)}`);
    const { token, headers } = this.createRequestHeaders();
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });
    const data: unknown = await response.json();

    this.tokenPool.updateToken(
      token,
      Object.fromEntries(response.headers.entries()),
    );
    return data;
  }
}
