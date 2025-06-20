import { Inject, Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import { Command, Console } from 'nestjs-console';
import { KYSELY } from '@/app/db/db.provider';
import { Kysely, sql } from 'kysely';
import { DB } from '@/app/db/dto/db.dto';
import { chunkArray } from '@/helper';

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
    await this.loadData(this.dataPath);
    console.log('Load eco data len:', this.repoMap.size);

    const repos = Array.from(this.repoMap.values()).map((repo) => ({
      ...repo,
      repo_name: repo.upstream_repo_name?.replace(
        /^https:\/\/github\.com\//i,
        '',
      ),
    }));

    for (const batch of chunkArray(repos, 5000)) {
      await this.db.insertInto('api.upstream_repos').values(batch).execute();
      console.log('Inserted batch of eco data:', batch.length);
    }
  }

  @Command({
    command: 'sync:db:repos:abnormal-direct',
    description: '',
  })
  async updateAllReposAbnormalStatusDirectSQL() {
    const updateQuery = sql`
WITH "RepoStats" AS (
    SELECT
        "repo_id",
        COUNT(CASE WHEN "event_type" = 'PushEvent' THEN 1 END) AS commit_count,
        COUNT(DISTINCT "actor_id") FILTER (WHERE ("actor_login" NOT LIKE '%[bot]' AND "actor_login" NOT LIKE '%-ci')) AS developer_count
    FROM
        "web3"."event"
    GROUP BY
        "repo_id"
)
UPDATE
    "web3"."repos" r
SET
    "is_abnormal" = CASE
        WHEN rs.developer_count <= 2 AND rs.commit_count > 3000 THEN TRUE
        ELSE FALSE
    END
FROM
    "RepoStats" rs
WHERE
    r."repo_id" = rs."repo_id";`;

    await updateQuery.execute(this.db);
  }
}
