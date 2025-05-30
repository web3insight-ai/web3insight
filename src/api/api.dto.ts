import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActorsScopeType, EcoType } from '@/source/dto/data.dto';
import { Expose, Type } from 'class-transformer';

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

export class EcoRankDto {
  eco_name: string = '';
  actors_total: number = 0;
  actors_core_total: number = 0;
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

export enum StatsPeriod {
  WEEK = 'week',
  MONTH = 'month',
}

export class GetActorDateReqDto extends GetTotalReqDto {
  @IsEnum(StatsPeriod)
  @IsOptional()
  period: StatsPeriod = StatsPeriod.MONTH;
}

export class ActorDateItemDto {
  date: Date = new Date();
  total: number = 0;
}
export class EcoRankListDto {
  list: EcoRankDto[] = [];
}

export class ActorDateListDto {
  list: ActorDateItemDto[] = [];
}

export class RepoRankListDto {
  list: RepoRankDto[] = [];
}

export class ActorCommitRankListDto {
  list: ActorCommitRankDto[] = [];
}

export enum ReposOrderEnum {
  ID = 'id',
  ORG = 'org',
}

export class ReposOrderReqDto {
  @IsEnum(ReposOrderEnum)
  @IsOptional()
  order: ReposOrderEnum = ReposOrderEnum.ID;
  @IsEnum(EcoType)
  @IsOptional()
  eco_name: EcoType = EcoType.ALL;
  @IsNumber()
  skip: number = 0;
  @IsNumber()
  @Min(1)
  @Max(100)
  take: number = 100;
  @ApiProperty({ required: false })
  @MaxLength(50)
  @IsOptional()
  search: string | undefined;
}

export class RepoMarkDto {
  repo_id: number = 0;
  repo_name: string = '';
  upstream_marks: object = {};
  custom_marks: object = {};
}

export class GetReposMarkResDto {
  list: RepoMarkDto[] = [];
  total: number = 0;
}

export class ReposCustomMarkReqDto {
  @IsEnum(EcoType)
  @IsOptional()
  @ValidateIf((o: ReposCustomMarkReqDto) => o.eco_name !== EcoType.ALL)
  eco_name: EcoType = EcoType.Bitcoin;
  @IsNumber()
  @Min(0)
  @Max(10)
  mark: number = 1;
}

export class BaseIdReqAndResDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Expose()
  id: number = 0;
}

export class SucessResDto {
  sucess: boolean = true;
}
