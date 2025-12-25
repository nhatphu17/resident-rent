import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Roles(UserRole.LANDLORD)
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @Roles(UserRole.LANDLORD)
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get('me')
  @Roles(UserRole.TENANT)
  findMe(@Param('userId') userId: number) {
    // This will be handled by getting user from token
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.LANDLORD, UserRole.TENANT)
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.LANDLORD, UserRole.TENANT)
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(+id, updateTenantDto);
  }

  @Delete(':id')
  @Roles(UserRole.LANDLORD)
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(+id);
  }
}


