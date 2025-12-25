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
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @Roles(UserRole.LANDLORD)
  async create(
    @Body() createContractDto: CreateContractDto,
    @CurrentUser() user: any,
  ) {
    const landlord = await this.prisma.landlord.findUnique({
      where: { userId: user.id },
    });
    return this.contractsService.create(landlord.id, createContractDto);
  }

  @Get()
  @Roles(UserRole.LANDLORD, UserRole.TENANT)
  async findAll(@CurrentUser() user: any) {
    let landlordId: number | undefined;
    let tenantId: number | undefined;

    if (user.role === 'LANDLORD') {
      const landlord = await this.prisma.landlord.findUnique({
        where: { userId: user.id },
      });
      landlordId = landlord?.id;
    } else if (user.role === 'TENANT') {
      const tenant = await this.prisma.tenant.findUnique({
        where: { userId: user.id },
      });
      tenantId = tenant?.id;
    }

    return this.contractsService.findAll(landlordId, tenantId);
  }

  @Get(':id')
  @Roles(UserRole.LANDLORD, UserRole.TENANT)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    let landlordId: number | undefined;
    let tenantId: number | undefined;

    if (user.role === 'LANDLORD') {
      const landlord = await this.prisma.landlord.findUnique({
        where: { userId: user.id },
      });
      landlordId = landlord?.id;
    } else if (user.role === 'TENANT') {
      const tenant = await this.prisma.tenant.findUnique({
        where: { userId: user.id },
      });
      tenantId = tenant?.id;
    }

    return this.contractsService.findOne(+id, landlordId, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.LANDLORD)
  async update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
    @CurrentUser() user: any,
  ) {
    const landlord = await this.prisma.landlord.findUnique({
      where: { userId: user.id },
    });
    return this.contractsService.update(+id, landlord.id, updateContractDto);
  }

  @Delete(':id')
  @Roles(UserRole.LANDLORD)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const landlord = await this.prisma.landlord.findUnique({
      where: { userId: user.id },
    });
    return this.contractsService.remove(+id, landlord.id);
  }
}


