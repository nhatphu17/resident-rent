import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateTenantDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  address?: string;
}


