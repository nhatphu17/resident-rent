import { IsInt, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUsageDto {
  @IsInt()
  @Type(() => Number)
  roomId: number;

  @IsInt()
  @Type(() => Number)
  month: number; // 1-12

  @IsInt()
  @Type(() => Number)
  year: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  electricStart?: number;

  @IsNumber()
  @Type(() => Number)
  electricEnd: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  waterStart?: number;

  @IsNumber()
  @Type(() => Number)
  waterEnd: number;
}


