import { IsInt, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceDto {
  @IsInt()
  @Type(() => Number)
  contractId: number;

  @IsInt()
  @Type(() => Number)
  tenantId: number;

  @IsInt()
  @Type(() => Number)
  roomId: number;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  usageId?: number;

  @IsInt()
  @Type(() => Number)
  month: number;

  @IsInt()
  @Type(() => Number)
  year: number;

  @IsNumber()
  @Type(() => Number)
  roomPrice: number;

  @IsNumber()
  @Type(() => Number)
  electricUsage: number;

  @IsNumber()
  @Type(() => Number)
  electricPrice: number;

  @IsNumber()
  @Type(() => Number)
  waterUsage: number;

  @IsNumber()
  @Type(() => Number)
  waterPrice: number;
}


