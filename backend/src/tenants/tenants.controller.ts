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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @Roles(UserRole.LANDLORD)
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @CurrentUser() user: any,
  ) {
    // Get landlord ID to track who created this tenant
    const landlord = await this.prisma.landlord.findUnique({
      where: { userId: user.id },
    });

    if (!landlord) {
      throw new Error('Landlord not found');
    }

    return this.tenantsService.create(createTenantDto, landlord.id);
  }

  @Get()
  @Roles(UserRole.LANDLORD)
  async findAll(@CurrentUser() user: any) {
    // Get landlord ID
    const landlord = await this.prisma.landlord.findUnique({
      where: { userId: user.id },
    });

    if (!landlord) {
      return [];
    }

    // Only return tenants that have contracts with this landlord's rooms
    return this.tenantsService.findAllByLandlord(landlord.id);
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
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @CurrentUser() user: any,
  ) {
    // If landlord, verify tenant belongs to them
    if (user.role === 'LANDLORD') {
      const landlord = await this.prisma.landlord.findUnique({
        where: { userId: user.id },
      });

      if (landlord) {
        const contracts = await this.prisma.contract.findFirst({
          where: {
            tenantId: +id,
            landlordId: landlord.id,
          },
        });

        if (!contracts) {
          throw new Error('Tenant does not belong to this landlord');
        }
      }
    }

    return this.tenantsService.update(+id, updateTenantDto);
  }

  @Delete(':id')
  @Roles(UserRole.LANDLORD)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const landlord = await this.prisma.landlord.findUnique({
      where: { userId: user.id },
    });

    if (!landlord) {
      throw new Error('Landlord not found');
    }

    return this.tenantsService.remove(+id, landlord.id);
  }
}


