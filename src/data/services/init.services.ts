import { Inject, Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import { Command, Console } from 'nestjs-console';
import { KYSELY } from '@/app/db/db.provider';
import { Kysely } from 'kysely';
import { DB } from '@/app/db/dto/db.dto';
import {
  askForConfirmation,
  chunkArray,
  convertGithubUrlToRepoName,
} from '@/helper';
import { isDeepStrictEqual } from 'util';
import { TokenPoolService } from '@/app/db/pool.services';

interface RawRepoData {
  eco_name: string;
  branch: string[];
  repo_url: string;
  tags: string[];
}
interface RepoData {
  upstream_repo_name: string;
  upstream_marks: Record<string, { branch: string[]; tags: string[] }>;
}

@Injectable()
@Console()
export class InitDataService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  constructor(private tokenPoolService: TokenPoolService) {}

  private repoMap: Map<string, RepoData> = new Map();
  private dataPath = join(process.cwd(), 'eco.jsonl');

  async loadData(filePath: string): Promise<void> {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (line.trim()) {
        const item = JSON.parse(line) as RawRepoData;
        const { repo_url, eco_name, branch, tags } = item;

        const repo = this.repoMap.get(repo_url) || {
          upstream_repo_name: repo_url,
          upstream_marks: {},
        };

        if (!repo.upstream_marks[eco_name]) {
          repo.upstream_marks[eco_name] = { branch, tags };
        } else {
          const existingBranches = repo.upstream_marks[eco_name].branch;
          const existingTags = repo.upstream_marks[eco_name].tags;

          repo.upstream_marks[eco_name] = {
            branch: [...new Set([...existingBranches, ...branch])],
            tags: [...new Set([...existingTags, ...tags])],
          };
        }
        this.repoMap.set(repo_url, repo);
      }
    }
  }

  @Command({
    command: 'sync:db:eco::repos',
    description: 'Update eco repos',
  })
  async testLoadEcoData() {
    this.repoMap.clear();

    await this.loadData(this.dataPath);

    console.log('Load eco data len:', this.repoMap.size);

    const localRepos = Array.from(this.repoMap.values()).map((repo) => ({
      ...repo,
      upstream_repo_name: convertGithubUrlToRepoName(
        repo.upstream_repo_name || '',
      ),
    }));
    const localRepoNames = new Set(
      localRepos.map((repo) => repo.upstream_repo_name),
    );

    const existingRepos = await this.db
      .selectFrom('api.upstream_repos')
      .select(['upstream_repo_name', 'upstream_marks'])
      .execute();

    const existingRepoMap = new Map(
      existingRepos.map((repo) => [
        repo.upstream_repo_name,
        repo.upstream_marks,
      ]),
    );

    const reposToUpsert = localRepos.filter(
      (repo) =>
        !existingRepoMap.has(repo.upstream_repo_name) ||
        !isDeepStrictEqual(
          repo.upstream_marks,
          existingRepoMap.get(repo.upstream_repo_name),
        ),
    );

    console.log(`Found ${reposToUpsert.length} repos to insert or update`);

    if (reposToUpsert.length > 0) {
      const shouldInsert = await askForConfirmation(
        'Do you want to insert/update these repos?',
      );

      if (shouldInsert) {
        for (const batch of chunkArray(reposToUpsert, 5000)) {
          await this.db
            .insertInto('api.upstream_repos')
            .values(batch)
            .onConflict((oc) =>
              oc.column('upstream_repo_name').doUpdateSet((eb) => ({
                updated_at: new Date().toISOString(),
                upstream_marks: eb.ref('excluded.upstream_marks'),
              })),
            )
            .execute();
          console.log('Inserted/updated batch of eco data:', batch.length);
        }
      } else {
        console.log('Insert/update operation cancelled');
      }
    } else {
      console.log('No repos need to be inserted or updated');
    }

    const updatedExistingRepos = await this.db
      .selectFrom('api.upstream_repos')
      .select(['upstream_repo_name'])
      .execute();

    const updatedExistingRepoSet = new Set(
      updatedExistingRepos.map((repo) => repo.upstream_repo_name),
    );
    const reposToDelete: string[] = [];

    updatedExistingRepoSet.forEach((repoName) => {
      if (!localRepoNames.has(repoName)) {
        reposToDelete.push(repoName);
      }
    });

    if (reposToDelete.length > 0) {
      console.log(`Found ${reposToDelete.length} repos to delete`);
      const shouldDelete = await askForConfirmation(
        'Do you want to delete these repos?',
      );

      if (shouldDelete) {
        for (const batch of chunkArray(reposToDelete, 1000)) {
          await this.db
            .deleteFrom('api.upstream_repos')
            .where('upstream_repo_name', 'in', batch)
            .execute();
          console.log(`Deleted batch of ${batch.length} repos`);
        }
      } else {
        console.log('Delete operation cancelled');
      }
    } else {
      console.log('No repos to delete');
    }

    while (true) {
      const neeData = await this.db
        .selectFrom('api.upstream_repos')
        .selectAll()
        .where('api', '=', '{}')
        .where('abnormal', '=', false)
        .orderBy('upstream_repo_name')
        .limit(100)
        .execute();

      if (neeData.length === 0) {
        break;
      }

      for (const repo of neeData) {
        const client = await this.tokenPoolService.getClient(true);
        const [owner, name] = repo.upstream_repo_name.split('/');
        try {
          const repoData = await client.repos.get({
            owner,
            repo: name,
          });
          await this.db
            .updateTable('api.upstream_repos')
            .set({
              id: repoData.data.id,
              api: JSON.stringify(repoData.data),
            })
            .where('upstream_repo_name', '=', repo.upstream_repo_name)
            .execute();
          console.log(`Updated ${repo.upstream_repo_name} with API data`);
        } catch (error) {
          if (error.status == 404 || error.status < 500) {
            const status = error.status as number;
            await this.db
              .updateTable('api.upstream_repos')
              .set({
                abnormal: true,
                api: { status: status },
              })
              .where('upstream_repo_name', '=', repo.upstream_repo_name)
              .execute();
          } else {
            console.error(`Error updating ${repo.upstream_repo_name}:`, error);
            throw new Error('Unexpected error');
          }
          console.error(`Error updating ${repo.upstream_repo_name}:`, error);
        }
      }
    }
    console.log('Sync completed');
  }
}
