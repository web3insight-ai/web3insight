import { asc, desc, eq } from 'drizzle-orm';
import type { DbClient } from '@/db/client';
import { data_ecosystems } from '@/db/schema';
import { ECO_ALL } from '@/data/dto/data.dto';
import { logger } from '@/app/logger';

const log = logger.child({ service: 'eco' });

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
    return this.db
      .select()
      .from(data_ecosystems)
      .where(eq(data_ecosystems.active, true))
      .orderBy(desc(data_ecosystems.score), asc(data_ecosystems.name))
      .limit(300);
  }

  async getEcoTopAll() {
    return this.db
      .select()
      .from(data_ecosystems)
      .where(eq(data_ecosystems.active, true))
      .orderBy(desc(data_ecosystems.score), asc(data_ecosystems.name));
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
    log.info('printEcoTop300 enum dump', { text });
    return text;
  }
}
