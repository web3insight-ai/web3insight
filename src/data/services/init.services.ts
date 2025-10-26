import { Inject, Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import { Command, Console } from 'nestjs-console';
import { KYSELY } from '@/app/db/db.provider';
import { CompiledQuery, Kysely } from 'kysely';
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

interface QueryEcosystem {
  ecosystem_name: string;
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

        const url = repo_url.toLowerCase();

        const repo = this.repoMap.get(url) || {
          upstream_repo_name: url,
          upstream_marks: {
            ALL: { branch: [], tags: [] },
          },
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
        this.repoMap.set(url, repo);
      }
    }
  }

  @Command({
    command: 'sync:db:eco:upstream_repos',
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
                abnormal: false,
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
              repo_id: repoData.data.id,
              api: JSON.stringify(repoData.data),
              api_updated_at: new Date().toISOString(),
            })
            .where('upstream_repo_name', '=', repo.upstream_repo_name)
            .execute();
          console.log(`Updated ${repo.upstream_repo_name} with API data`);
        } catch (error) {
          if (error.status && (error.status == 503 || error.status == 500)) {
            await Promise.resolve(
              new Promise((resolve) => setTimeout(resolve, 5000)),
            );
            continue;
          }
          const x = error as Error;
          if (
            x.message.includes('duplicate key value violates unique constraint')
          ) {
            error.status = 1000;
          }
          if (
            error.status == 404 ||
            error.status < 500 ||
            error.status >= 1000
          ) {
            const status = error.status as number;
            await this.db
              .updateTable('api.upstream_repos')
              .set({
                abnormal: true,
                api: { status: status },
                api_updated_at: new Date().toISOString(),
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

  @Command({
    command: 'sync:db:eco:repos',
    description: 'Sync api.upstream_repos to data.repos',
  })
  async syncUpstreamToDataRepos() {
    const upstreamRepos = await this.db
      .selectFrom('api.upstream_repos')
      .selectAll()
      .where('abnormal', '=', false)
      .execute();

    const existingDataRepos = await this.db
      .selectFrom('data.repos')
      .select(['repo_id', 'upstream_marks'])
      .execute();

    const existingRepoMap = new Map(
      existingDataRepos.map((repo) => [repo.repo_id, repo]),
    );

    const reposToUpsert = upstreamRepos
      .filter((repo) => {
        const existing = existingRepoMap.get(repo.repo_id);
        return (
          !existing ||
          !isDeepStrictEqual(repo.upstream_marks, existing.upstream_marks)
        );
      })
      .map((repo) => {
        console.log(`Processing repo: ${repo.repo_id}`);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (!repo.api?.owner?.login) {
          console.error(
            `有问题的 repo_id: ${repo.repo_id}, upstream_repo_name: ${repo.upstream_repo_name}, api:`,
            repo.api,
          );
        }
        return {
          repo_id: repo.repo_id,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          repo_name: repo.api.owner.login + '/' + repo.api.name,
          upstream_marks: repo.upstream_marks,
          api: repo.api,
          api_updated_at: repo.api_updated_at,
        };
      });

    console.log(`Found ${reposToUpsert.length} repos to insert/update`);

    if (reposToUpsert.length > 0) {
      const shouldUpsert = await askForConfirmation(
        'Do you want to insert/update these repos?',
      );

      if (shouldUpsert) {
        for (const batch of chunkArray(reposToUpsert, 5000)) {
          await this.db
            .insertInto('data.repos')
            .values(batch)
            .onConflict((oc) =>
              oc.column('repo_id').doUpdateSet((eb) => ({
                upstream_marks: eb.ref('excluded.upstream_marks'),
              })),
            )
            .execute();
          console.log('Upserted batch:', batch.length);
        }
      } else {
        console.log('Insert/update operation cancelled');
      }
    }

    const upstreamRepoNames = new Set(upstreamRepos.map((r) => r.repo_id));
    const reposToDelete = existingDataRepos
      .filter((repo) => !upstreamRepoNames.has(repo.repo_id))
      .map((repo) => repo.repo_id);

    console.log(`Found ${reposToDelete.length} repos to delete`);

    if (reposToDelete.length > 0) {
      const shouldDelete = await askForConfirmation(
        'Do you want to delete these repos?',
      );

      if (shouldDelete) {
        for (const batch of chunkArray(reposToDelete, 1000)) {
          await this.db
            .deleteFrom('data.repos')
            .where('repo_id', 'in', batch)
            .execute();
          console.log('Deleted batch:', batch.length);
        }
      } else {
        console.log('Delete operation cancelled');
      }
    }
    console.log('Upstream to data sync completed');
  }

  @Command({
    command: 'sync:db:eco:ecosystems',
    description: 'Sync api.upstream_repos to data.repos',
  })
  async syncEcosystems() {
    const sqlRawQuery = `
SELECT DISTINCT jsonb_object_keys(upstream_marks) AS ecosystem_name
FROM data.repos
ORDER BY ecosystem_name;`;
    const query = CompiledQuery.raw(sqlRawQuery);
    const results = await this.db.executeQuery(query);
    const upstream_ecosystems = results.rows.map(
      (row: QueryEcosystem) => row.ecosystem_name,
    );
    const existingQuery = await this.db
      .selectFrom('data.ecosystems')
      .select(['name'])
      .execute();

    const existingEcosystems = existingQuery.map((eco) => eco.name);

    const ecosystemsToInsert = upstream_ecosystems.filter(
      (eco) => !existingEcosystems.includes(eco),
    );

    if (ecosystemsToInsert.length > 0) {
      const shouldInsert = await askForConfirmation(
        `Found ${ecosystemsToInsert.length} new ecosystems. Do you want to insert them?`,
      );

      if (shouldInsert) {
        const ecoValues = ecosystemsToInsert.map((eco) => ({
          name: eco,
          active: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          description: '',
          icon: '',
        }));

        for (const batch of chunkArray(ecoValues, 1000)) {
          await this.db.insertInto('data.ecosystems').values(batch).execute();
          console.log(`Inserted batch of ecosystems: ${batch.length}`);
        }
      } else {
        console.log('Ecosystem insert operation cancelled');
      }
    } else {
      console.log('No new ecosystems to insert');
    }

    const ecosystemsToDelete = existingEcosystems.filter(
      (eco) => !upstream_ecosystems.includes(eco),
    );

    if (ecosystemsToDelete.length > 0) {
      const shouldDelete = await askForConfirmation(
        `Found ${ecosystemsToDelete.length} ecosystems to delete. Do you want to proceed?`,
      );

      if (shouldDelete) {
        for (const batch of chunkArray(ecosystemsToDelete, 1000)) {
          await this.db
            .deleteFrom('data.ecosystems')
            .where('name', 'in', batch)
            .execute();
          console.log(`Deleted batch of ecosystems: ${batch.length}`);
        }
      } else {
        console.log('Ecosystem delete operation cancelled');
      }
    } else {
      console.log('No ecosystems to delete');
    }
    return '';
  }
}
