import { IsEnum, IsOptional } from 'class-validator';
import { EcoType } from '@/source/dto/data.dto';

export class GetRepoNumReqDto {
  @IsEnum(EcoType)
  @IsOptional()
  eco_name: EcoType = EcoType.ALL;
}

export class TotalDto {
  total: number = 0;
}
