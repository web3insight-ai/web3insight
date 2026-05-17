import type { DbClient } from '@/db/client';
import { ECO_ALL } from '@/data/dto/data.dto';

/**
 * Pure-class port of data/services/eco.services.ts (NestJS @Injectable removed).
 * Console @Command decorators stripped — see Phase F for Cron/Inngest migration.
 *
 * The original took `CacheDataService` as a constructor dep but never invoked it,
 * so we drop it here. If a future eco-cache method needs cache, take it via ctor.
 */
export class EcoService {
  constructor(private readonly db: DbClient) {}

  async getEcoTop300() {
    const data = await this.db
      .selectFrom('data.ecosystems')
      .selectAll()
      .where('active', '=', true)
      .orderBy('score', 'desc')
      .orderBy('name', 'asc')
      .limit(300)
      .execute();
    return data;
  }

  async getEcoTopAll() {
    const data = await this.db
      .selectFrom('data.ecosystems')
      .selectAll()
      .where('active', '=', true)
      .orderBy('score', 'desc')
      .orderBy('name', 'asc')
      .execute();
    return data;
  }

  async getActiveEcoNames(): Promise<string[]> {
    const data = await this.getEcoTop300();
    return data.map((eco) => eco.name);
  }

  async getEcoNameFilters(): Promise<string[]> {
    const ecoNames = await this.getActiveEcoNames();
    return [ECO_ALL, ...ecoNames];
  }

  async printEcoTop300() {
    const data = await this.getEcoTop300();
    const text = data
      .map((eco) => {
        return `
  ${eco.name.replaceAll(' ', '_').replaceAll('.', '_').replaceAll('(', '').replaceAll(')', '').replaceAll('-', '')} = '${eco.name}'`;
      })
      .join();
    console.log(`export enum EcoType {${text}}`);
    return text;
  }
}
