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
