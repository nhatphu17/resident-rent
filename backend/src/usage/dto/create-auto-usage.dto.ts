import { IsInt, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAutoUsageDto {
  @IsInt()
  @Type(() => Number)
  roomId: number;

  @IsNumber()
  @Type(() => Number)
  electricity: number;

  @IsNumber()
  @Type(() => Number)
  water: number;

  @IsDateString()
  @IsOptional()
  timestamp?: string;
}


