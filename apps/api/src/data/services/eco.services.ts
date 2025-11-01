import { KYSELY } from '@/app/db/db.provider';
import { DB } from '@/app/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { CacheDataService } from './cache.services';
import { ECO_ALL } from '../dto/data.dto';

@Injectable()
@Console()
export class EcoService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  constructor(private cacheDataService: CacheDataService) {}

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

  @Command({
    command: 'eco:print',
    description: 'Synchronize ecosystem repository ranking data',
  })
  async printEco() {
    await this.printEcoTop300();
  }
}
