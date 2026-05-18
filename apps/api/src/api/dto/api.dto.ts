import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
// Reason: @nestjs/swagger removed after Hono migration. Stub ApiProperty as a
// no-op decorator factory so legacy DTO classes keep their decorator metadata
// (used by class-validator) without pulling in the NestJS swagger runtime.
const ApiProperty =
  (_options?: unknown): PropertyDecorator =>
  () =>
    undefined;
import {
  ActorsScopeType,
  ECO_ALL,
  EcoNameFilter,
  StatsPeriod,
} from '@/data/dto/data.dto';
import { Expose, Type } from 'class-transformer';
import {
  ActorDateItemDto,
  QueryTopActor,
  QueryTopStarRepo,
} from '@/data/dto/query.dto';
import type { api_analysis_users } from '@/db/schema';
type ApiAnalysisUsers = typeof api_analysis_users.$inferSelect;

export class GetTotalReqDto {
  @IsString()
  @IsOptional()
  eco_name: EcoNameFilter = ECO_ALL;
}

export class GetRepoInfoDto {
  @IsNumber()
  repo_id: number = 0;
}

export class GetActorsTotalReqDto extends GetTotalReqDto {
  @IsEnum(ActorsScopeType)
  @IsOptional()
  scope: ActorsScopeType = ActorsScopeType.ALL;
}

export class TotalDto {
  total: number = 0;
}

export class ActorCountryStatItemDto {
  country: string = '';
  total: number = 0;
}

export class ActorCountryStatListDto {
  total: number = 0;
  list: ActorCountryStatItemDto[] = [];
}

export class EcoRankDto {
  eco_name: string = '';
  actors_total: number = 0;
  actors_new_total: number = 0;
  actors_core_total: number = 0;
  repos_total: number = 0;
  kind: string = '';
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

export class RepoActiveDevDto {
  list: GithubRepoDto[] = [];
}

export class GithubRepoDto {
  repo_id: number = 0;
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
  @IsString()
  @IsOptional()
  eco_name: EcoNameFilter = ECO_ALL;
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

export class OpenBuildBindReqDto {
  @IsString()
  code: string = '';
}

export class PrivyReqDto {
  @IsString()
  id_token: string = '';
}

export class AuthBindWalletReqDto {
  @IsString()
  address: string;
  @IsString()
  magic: string;
  @IsString()
  signature: string;
}

export class UpdateUserReqDto {
  @IsOptional()
  @IsString()
  user_nick_name?: string;

  @IsOptional()
  @IsString()
  user_avatar?: string;

  @IsOptional()
  @IsString()
  user_bio?: string;

  @IsOptional()
  @IsString()
  user_custom_x?: string;

  @IsOptional()
  @IsArray()
  user_custom_labels?: Array<string>;

  @IsOptional()
  @IsString()
  user_title?: string;

  @IsOptional()
  @IsString()
  invite_code?: string;
}

export class UpdateUserExtraReqDto {
  @IsObject()
  user_extra: Record<string, unknown> = {};
}

export class ReposCustomMarkReqDto {
  @ValidateIf((o: ReposCustomMarkReqDto) => o.eco_name !== ECO_ALL)
  @IsString()
  @IsOptional()
  eco_name: EcoNameFilter = ECO_ALL;
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
  @IsOptional()
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
  @IsEnum(Intent)
  intent: Intent = Intent.Hackathon;
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
  users: GithubUsersDto[] | any[] = [];
  fail: string[] = [];
}

export class GithubUsersDto {
  login: string;
  id: number;
  created_at: string;
  updated_at: string;
}

export class CustomShareReqDto {
  @IsOptional()
  share: boolean = false;
}
