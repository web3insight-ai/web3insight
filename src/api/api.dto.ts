import { IsEnum, IsOptional } from 'class-validator';
import { EcoType, EcoTypeValue } from '@/source/dto/data.dto';

export class GetRepoNumReqDto {
  @IsEnum(EcoType)
  @IsOptional()
  eco_name: EcoTypeValue = EcoType.ALL;
}

export class TotalDto {
  total: number = 0;
}
