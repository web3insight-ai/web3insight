import { KYSELY } from '@/app/db/db.provider';
import { DB } from '@/app/db/dto/db.dto';
import { TokenPoolService } from '@/app/db/pool.services';
import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';

@Injectable()
@Console()
export class UsersService {
  constructor(
    @Inject(KYSELY) private readonly db: Kysely<DB>,
    private readonly tokenPoolService: TokenPoolService,
  ) {}

  async analyzeUsers(urls: string[]): Promise<number> {
    const usernames = urls
      .map((url) => this.extractUsername(url))
      .filter((username): username is string => username !== null);

    const githubData = [] as any[];

    for (let i = 0; i < usernames.length; i += 10) {
      const batch = usernames.slice(i, i + 10);

      const octokit = this.tokenPoolService.getClient();

      const batchResults = await Promise.all(
        batch.map(async (username) => {
          try {
            const response = await octokit.users.getByUsername({ username });
            return { username, data: response.data };
          } catch (error) {
            console.error(`Failed to process user ${username}:`, error);
            return null;
          }
        }),
      );

      batchResults.forEach((result) => {
        if (result) {
          githubData.push(result.data);
        }
      });
    }

    const id = await this.db
      .insertInto('api.analysis_users')
      .values({
        request_data: { urls },
        github: { data: githubData },
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    return Number(id.id);
  }

  private extractUsername(url: string): string | null {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'github.com') {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 1) {
          return pathParts[0];
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  @Command({
    command: 'test:users:fn',
    description: '',
  })
  async test() {
    const urls = ['https://github.com/zhang-wenchao'];
    const res = await this.analyzeUsers(urls);
    console.log(res);
  }
}
