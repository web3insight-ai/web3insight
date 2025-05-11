import { IsOptional, IsString } from 'class-validator';

export class GetRepoNumReqDto {
  @IsString()
  @IsOptional()
  eco_name: string = 'ALL';
}

export class TotalDto {
  total: number = 0;
}
