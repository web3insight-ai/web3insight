import { KYSELY } from '@/app/db/db.provider';
import { DB } from '@/app/db/dto/db.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Console } from 'nestjs-console';
import { CacheDataService } from './cache.services';

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
      .limit(300)
      .execute();
    return data;
  }

  async printEcoTop300() {
    const data = await this.getEcoTop300();
    const text = data
      .map((eco) => {
        return `
  ${eco.name} = '${eco.name}',`;
      })
      .join('\n');
    console.log(`export enum EcoType {${text}}`);
    return text;
  }
}
