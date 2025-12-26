import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsageService } from './usage.service';
import { CreateUsageDto } from './dto/create-usage.dto';
import { CreateAutoUsageDto } from './dto/create-auto-usage.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/usage')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsageController {
  constructor(
    private readonly usageService: UsageService,
    private prisma: PrismaService,
  ) {}

  @Post('manual')
  @Roles(UserRole.LANDLORD)
  createManual(@Body() createUsageDto: CreateUsageDto) {
    return this.usageService.createManual(createUsageDto);
  }

  @Post('auto')
  createAuto(@Body() createAutoUsageDto: CreateAutoUsageDto) {
    // This endpoint can be called by IoT devices without auth
    // In production, you should add API key authentication
    return this.usageService.createAuto(
      createAutoUsageDto.roomId,
      createAutoUsageDto.electricity,
      createAutoUsageDto.water,
      createAutoUsageDto.timestamp ? new Date(createAutoUsageDto.timestamp) : undefined,
    );
  }

  @Get()
  @Roles(UserRole.LANDLORD, UserRole.TENANT)
  async findAll(@Query('roomId') roomId?: string, @CurrentUser() user?: any) {
    let roomIdNum = roomId ? Number(roomId) : undefined;
    
    // If tenant, only show usage for rooms they are renting
    if (user?.role === 'TENANT') {
      const tenant = await this.prisma.tenant.findUnique({
        where: { userId: user.id },
        include: {
          contracts: {
            where: { status: 'active' },
            include: { room: true },
          },
        },
      });
      
      if (tenant && tenant.contracts.length > 0) {
        // Get room IDs from active contracts
        const tenantRoomIds = tenant.contracts.map((c) => c.roomId);
        
        // If roomId is specified, verify it belongs to tenant
        if (roomIdNum && !tenantRoomIds.includes(roomIdNum)) {
          return []; // Return empty if room doesn't belong to tenant
        }
        
        // Filter by tenant's rooms
        return this.usageService.findAllByRoomIds(tenantRoomIds);
      } else {
        return []; // No active contracts, return empty
      }
    }
    
    // For landlord, use existing logic
    return this.usageService.findAll(roomIdNum);
  }

  @Get(':id')
  @Roles(UserRole.LANDLORD, UserRole.TENANT)
  findOne(@Param('id') id: string) {
    return this.usageService.findOne(+id);
  }
}


