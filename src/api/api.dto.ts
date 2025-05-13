import { IsEnum, IsOptional } from 'class-validator';
import { ActorsScopeType, EcoType } from '@/source/dto/data.dto';

export class GetTotalReqDto {
  @IsEnum(EcoType)
  @IsOptional()
  eco_name: EcoType = EcoType.ALL;
}

export class GetActorsTotalReqDto extends GetTotalReqDto {
  @IsEnum(ActorsScopeType)
  @IsOptional()
  scope: ActorsScopeType = ActorsScopeType.ALL;
}

export class TotalDto {
  total: number = 0;
}

export class EcoRankListDto {
  list: EcoRankDto[] = [];
}

export class EcoRankDto {
  eco_name: string = '';
  actors_total: number = 0;
  actors_core_total: number = 0;
}

export class RepoRankListDto {
  list: RepoRankDto[] = [];
}

export class RepoRankDto {
  repo_id: number = 0;
  repo_name: string = '';
  star_count: number = 0;
  forks_count: number = 0;
  open_issues_count: number = 0;
}

export class ActorCommitRepoDto {
  repo_id: number = 0;
  repo_name: string = '';
  commit_count: number = 0;
}

export class ActorCommitRankDto {
  actor_id: number = 0;
  actor_login: string = '';
  total_commit_count: number = 0;
  top_repos: ActorCommitRepoDto[] = [];
}

export class ActorCommitRankListDto {
  list: ActorCommitRankDto[] = [];
}
