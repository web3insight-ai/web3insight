import { IsObject, IsOptional, IsString } from 'class-validator';

export class DonateCreateDto {
  @IsString()
  repo_full_name: string;
}

export class DonateUpdateDto {
  @IsOptional()
  @IsObject()
  repo_donate_data?: Record<string, any>;
}
