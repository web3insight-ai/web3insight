import { BadRequestException, Injectable } from '@nestjs/common';
import { TokenPoolService } from '@/app/db/pool.services';
import { Request } from 'express';
import type { RestEndpointMethodTypes } from '@octokit/rest';

export type GithubUserProfile =
  RestEndpointMethodTypes['users']['getByUsername']['response']['data'];

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

  extractUsername(input: string): string | null {
    const s = input.trim();
    if (!s) return null;

    if (!s.includes('/') && !s.startsWith('@')) return s;

    if (s.startsWith('@')) return s.slice(1) || null;

    try {
      const url = new URL(s.includes('://') ? s : `https://${s}`);
      const host = url.hostname.replace(/^www\./i, '');
      if (host === 'github.com') {
        const p = url.pathname.split('/')[1];
        return p || null;
      }
    } catch {
      /* ignore */
    }

    return s;
  }

  async getUserProfileByUsername(username: string): Promise<GithubUserProfile> {
    const trimmed = username.trim();
    if (!trimmed) {
      throw new BadRequestException('GitHub username is required');
    }

    const client = await this.tokenPool.getClient();
    const response = await client.rest.users.getByUsername({
      username: trimmed,
    });
    return response.data;
  }

  normalizeRepoFullName(repo: string): string | null {
    const trimmed = repo.trim();
    if (!trimmed) {
      return null;
    }

    const noGitSuffix = trimmed.replace(/\.git$/i, '');
    if (noGitSuffix.includes('://')) {
      try {
        const url = new URL(noGitSuffix);
        const host = url.hostname.replace(/^www\./i, '');
        if (host !== 'github.com') {
          return null;
        }
        const segments = url.pathname.split('/').filter(Boolean);
        if (segments.length < 2) {
          return null;
        }
        return `${segments[0]}/${segments[1]}`;
      } catch {
        return null;
      }
    }

    const cleaned = noGitSuffix.replace(/^(?:www\.)?github\.com\//i, '');
    const segments = cleaned.split('/').filter(Boolean);
    if (segments.length < 2) {
      return null;
    }
    return `${segments[0]}/${segments[1]}`;
  }

  parseRepoFullName(repoFullName: string) {
    const normalized = this.normalizeRepoFullName(repoFullName);
    if (!normalized) {
      throw new BadRequestException('Invalid repository name');
    }

    const [owner, repo] = normalized.split('/');
    if (!owner || !repo) {
      throw new BadRequestException('Invalid repository name');
    }

    return { owner, repo };
  }

  isRepoNotFound(error: any): boolean {
    return error?.status === 404;
  }

  isRetryableNetworkError(error: any): boolean {
    const status = error?.status;
    const code = error?.code;
    if (status === 0) {
      return true;
    }
    if ([502, 503, 504].includes(status)) {
      return true;
    }
    return [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'EAI_AGAIN',
      'ECONNREFUSED',
      'UND_ERR_CONNECT_TIMEOUT',
      'UND_ERR_SOCKET',
    ].includes(code);
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
