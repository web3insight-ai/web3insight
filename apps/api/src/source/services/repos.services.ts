import { KYSELY } from '@/db/db.provider';
import { DB } from '@/db/dto/db.dto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Command, Console } from 'nestjs-console';
import { EcoType } from '../dto/data.dto';
import {
  BaseIdReqAndResDto,
  DirectionEnum,
  GetReposMarkResDto,
  RepoMarkDto,
  ReposCustomMarkReqDto,
  ReposOrderEnum,
  ReposOrderReqDto,
  SucessResDto,
} from '@/api/api.dto';

@Injectable()
@Console()
export class ReposService {
  @Inject(KYSELY) private readonly db!: Kysely<DB>;

  async getReposByEcoName(params: ReposOrderReqDto) {
    let query = this.db.selectFrom('web3.repos');
    if (params.eco_name !== EcoType.ALL) {
      query = query.where('upstream_marks', '?', params.eco_name);
    }

    if (params.search && params.search !== '') {
      query = query.where('repo_name', 'ilike', `%${params.search}%`);
    }

    const total = await query
      .select(this.db.fn.count('repo_id').as('total'))
      .execute();

    if (params.order === ReposOrderEnum.ID) {
      query = query.orderBy('repo_id', params.direction);
    }

    if (params.order === ReposOrderEnum.ORG) {
      query = query.orderBy('repo_name', params.direction);
    }

    query = query.offset(params.skip);
    query = query.limit(params.take);

    const find = await query.selectAll().execute();

    const list: RepoMarkDto[] = find.map((item) => ({
      repo_id: item.repo_id as unknown as number,
      repo_name: item.repo_name ?? '',
      upstream_marks: item.upstream_marks as object,
      custom_marks: item.custom_marks as object,
    }));

    const res = new GetReposMarkResDto();
    res.list = list;
    res.total = total[0].total as number;

    return res;
  }

  async markRepo(param: BaseIdReqAndResDto, body: ReposCustomMarkReqDto) {
    const repo = await this.db
      .selectFrom('web3.repos')
      .selectAll()
      .where('repo_id', '=', String(param.id))
      .executeTakeFirst();
    if (!repo) {
      throw new NotFoundException(`Repo with id ${param.id} not found`);
    }
    const custom_marks = repo.custom_marks ?? {};
    custom_marks[body.eco_name] = body.mark;
    await this.db
      .updateTable('web3.repos')
      .set({
        custom_marks: custom_marks,
      })
      .where('repo_id', '=', String(param.id))
      .execute();
    return (new SucessResDto().sucess = true);
  }

  @Command({
    command: 'test:repos:fn',
    description: '',
  })
  async test() {
    const params = new ReposOrderReqDto();
    params.order = ReposOrderEnum.ID;
    params.skip = 0;
    params.take = 10;
    params.eco_name = EcoType.ALL;
    await this.getReposByEcoName(params);
    return Promise.resolve();
  }
}
