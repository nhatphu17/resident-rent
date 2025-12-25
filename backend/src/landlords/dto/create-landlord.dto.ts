import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateLandlordDto {
  @IsInt()
  userId: number;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  address?: string;
}


