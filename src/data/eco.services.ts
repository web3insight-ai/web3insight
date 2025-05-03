import { Injectable, OnModuleInit } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

interface RepoData {
  eco_name: string;
  branch: string[];
  repo_url: string;
  tags: string[];
}

@Injectable()
export class EcoDataService implements OnModuleInit {
  private repoDataMap: Map<string, RepoData[]> = new Map();
  private dataPath = join(process.cwd(), 'eco.jsonl');

  async onModuleInit() {
    await this.loadData(this.dataPath);
  }

  async loadData(filePath: string): Promise<void> {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (line.trim()) {
        const item = JSON.parse(line) as RepoData;
        if (!this.repoDataMap.has(item.eco_name)) {
          this.repoDataMap.set(item.eco_name, []);
        }
        this.repoDataMap.get(item.eco_name)!.push(item);
      }
    }
  }

  getRepoNamesForEco(ecoName: string): string[] {
    const repos = this.repoDataMap.get(ecoName) || [];

    return repos.map((repo) => {
      const url = new URL(repo.repo_url);
      const path = url.pathname.substring(1);
      return path;
    });
  }
}
