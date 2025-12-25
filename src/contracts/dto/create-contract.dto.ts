import { IsInt, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractDto {
  @IsInt()
  @Type(() => Number)
  tenantId: number;

  @IsInt()
  @Type(() => Number)
  roomId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @Type(() => Number)
  monthlyRent: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  deposit?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}


