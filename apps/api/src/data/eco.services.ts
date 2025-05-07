import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import { Command, Console } from 'nestjs-console';

interface RawRepoData {
  eco_name: string;
  branch: string[];
  repo_url: string;
  tags: string[];
}
interface RepoData {
  repo_url: string;
  eco_names: string[];
  eco_details: Record<string, { branch: string[]; tags: string[] }>;
}

@Injectable()
@Console()
export class EcoDataService {
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
          repo_url,
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

  getRepoNamesForEco(ecoName: string): string[] {
    return Array.from(this.repoMap.values())
      .filter((repo) => repo.eco_names.includes(ecoName))
      .map((repo) => {
        const url = new URL(repo.repo_url);
        return url.pathname.substring(1);
      });
  }

  getReposWithBranchesForEco(
    ecoName: string,
  ): Array<{ repo: string; branches: string[] }> {
    return Array.from(this.repoMap.values())
      .filter((repo) => repo.eco_names.includes(ecoName))
      .map((repo) => {
        const url = new URL(repo.repo_url);
        return {
          repo: url.pathname.substring(1),
          branches: repo.eco_details[ecoName].branch,
        };
      });
  }

  getAllEcoNames(): string[] {
    const ecoNamesSet = new Set<string>();
    for (const repo of this.repoMap.values()) {
      for (const ecoName of repo.eco_names) {
        ecoNamesSet.add(ecoName);
      }
    }
    return Array.from(ecoNamesSet);
  }

  getRepoDetails(repoUrl: string): RepoData | undefined {
    return this.repoMap.get(repoUrl);
  }

  @Command({
    command: 'test:load_eco',
    description: 'Test load eco data',
  })
  async testLoadEcoData() {
    await this.loadData(this.dataPath);
    console.log('Load eco data len:', this.repoMap.size);
  }
}
