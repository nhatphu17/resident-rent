import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SensorDataService } from './sensor-data.service';
import { CreateSensorDataDto } from './dto/create-sensor-data.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/sensor-data')
export class SensorDataController {
  constructor(private readonly sensorDataService: SensorDataService) {}

  @Post()
  // No auth required for IoT devices (add API key in production)
  // In production, you should add API key authentication here
  create(@Body() createSensorDataDto: CreateSensorDataDto) {
    return this.sensorDataService.create(createSensorDataDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  findAll(
    @Query('roomId') roomId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.sensorDataService.findAll(
      roomId ? +roomId : undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  findOne(@Param('id') id: string) {
    return this.sensorDataService.findOne(+id);
  }
}

