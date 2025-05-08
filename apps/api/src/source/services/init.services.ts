import { Inject, Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import { Command, Console } from 'nestjs-console';
import { KYSELY } from '@/db/db.provider';
import { Kysely, sql } from 'kysely';
import { DB } from '@/db/dto/db.dto';
import { chunkArray } from '@/helper';

interface RawRepoData {
  eco_name: string;
  branch: string[];
  repo_url: string;
  tags: string[];
}
interface RepoData {
  repo_name: string;
  eco_names: string[];
  eco_details: Record<string, { branch: string[]; tags: string[] }>;
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
          repo_name: repo_url,
          eco_names: [],
          eco_details: {},
        };

        if (!repo.eco_names.includes(eco_name)) {
          repo.eco_names.push(eco_name);
        }

        if (!repo.eco_details[eco_name]) {
          repo.eco_details[eco_name] = { branch, tags };
        } else {
          const existingBranches = repo.eco_details[eco_name].branch;
          const existingTags = repo.eco_details[eco_name].tags;

          repo.eco_details[eco_name] = {
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
      repo_name: repo.repo_name?.replace(/^https:\/\/github\.com\//i, ''),
    }));

    const createTable = sql`
CREATE UNLOGGED TABLE IF NOT EXISTS "web3"."ecos"
(
    "repo_name"   TEXT,
    "eco_names"   TEXT[] DEFAULT ARRAY []::TEXT[],
    "eco_details" JSONB  DEFAULT '{}'::JSONB
);`;

    await createTable.execute(this.db);

    await this.db.deleteFrom('web3.ecos').execute();

    for (const batch of chunkArray(repos, 5000)) {
      await this.db.insertInto('web3.ecos').values(batch).execute();
      console.log('Inserted batch of eco data:', batch.length);
    }
    const updateTable = sql`
UPDATE "web3"."repos" r
SET "eco_names"   = e."eco_names",
    "eco_details" = e."eco_details"
FROM "web3"."ecos" e
WHERE LOWER(r."repo_name") = LOWER(e."repo_name");`;

    await updateTable.execute(this.db);

    await sql`DROP TABLE IF EXISTS "web3"."ecos";`.execute(this.db);
  }
}
