import { IsString, IsInt, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTenantDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsInt()
  @Type(() => Number)
  roomId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @Type(() => Number)
  monthlyRent: number;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  deposit?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}


