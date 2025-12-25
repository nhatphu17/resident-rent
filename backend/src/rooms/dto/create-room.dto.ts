import { IsString, IsNumber, IsOptional, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @IsString()
  roomNumber: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  floor?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  area?: number;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  electricPrice?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  waterPrice?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  description?: string;
}


