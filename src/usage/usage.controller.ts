import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsageService } from './usage.service';
import { CreateUsageDto } from './dto/create-usage.dto';
import { CreateAutoUsageDto } from './dto/create-auto-usage.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/usage')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

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
  findAll(@Param('roomId') roomId?: number) {
    return this.usageService.findAll(roomId);
  }

  @Get(':id')
  @Roles(UserRole.LANDLORD, UserRole.TENANT)
  findOne(@Param('id') id: string) {
    return this.usageService.findOne(+id);
  }
}


