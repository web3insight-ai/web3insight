import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActorsScopeType, EcoType, StatsPeriod } from '@/data/dto/data.dto';
import { Expose, Type } from 'class-transformer';
import {
  ActorDateItemDto,
  QueryTopActor,
  QueryTopStarRepo,
} from '@/data/dto/query.dto';
import { ApiAnalysisUsers } from '@/app/db/dto/db.dto';

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
  actors_new_total: number = 0;
  actors_core_total: number = 0;
  repos_total: number = 0;
}

export class GetActorDateReqDto extends GetTotalReqDto {
  @IsEnum(StatsPeriod)
  @IsOptional()
  period: StatsPeriod = StatsPeriod.MONTH;
}

export class EcoRankListDto {
  list: EcoRankDto[] = [];
}

export class ActorDateListDto {
  list: ActorDateItemDto[] = [];
}

export class RepoRankListDto {
  list: QueryTopStarRepo[] = [];
}

export class ActorScoreRankListDto {
  list: QueryTopActor[] = [];
}

export enum ReposOrderEnum {
  ID = 'id',
  ORG = 'org',
}

export enum DirectionEnum {
  ASC = 'asc',
  DESC = 'desc',
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
  @IsEnum(DirectionEnum)
  @IsOptional()
  direction: DirectionEnum = DirectionEnum.ASC;
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

export class LoginReqDto {
  @IsString()
  type: string = 'github';
  @IsString()
  code: string = '';
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

export class EcoList {
  provider_ecosystem: string[] = [];
  available_ecosystem: string[] = [];
}

export enum Intent {
  Hackathon = 'hackathon',
  Profile = 'profile',
}

export class CustomQueryUsersReqDto {
  @IsEnum(Intent)
  intent: Intent = Intent.Hackathon;
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    example: ['https://github.com/zhang-wenchao'],
  })
  request_data: string[] = [];
  @IsString()
  description: string;
}

export class CustomQueryUsersOrderReqDto {
  @IsNumber()
  skip: number = 0;
  @IsNumber()
  @Min(1)
  @Max(100)
  take: number = 10;
  @IsEnum(DirectionEnum)
  @IsOptional()
  direction: DirectionEnum = DirectionEnum.ASC;
}

export class CustomQueryUsersResDto {
  list: ApiAnalysisUsers[] = [];
  total: number = 0;
}

export class CustomUploadResDto {
  id: number = 0;
  users: GithubUsersDto[] = [];
}

export class GithubUsersDto {
  login: string;
  id: number;
  created_at: string;
  updated_at: string;
}
