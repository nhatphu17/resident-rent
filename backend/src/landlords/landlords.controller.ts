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
import { LandlordsService } from './landlords.service';
import { CreateLandlordDto } from './dto/create-landlord.dto';
import { UpdateLandlordDto } from './dto/update-landlord.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/landlords')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LandlordsController {
  constructor(private readonly landlordsService: LandlordsService) {}

  @Post()
  @Roles(UserRole.LANDLORD)
  create(@Body() createLandlordDto: CreateLandlordDto) {
    return this.landlordsService.create(createLandlordDto);
  }

  @Get()
  @Roles(UserRole.LANDLORD)
  findAll() {
    return this.landlordsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.LANDLORD)
  findOne(@Param('id') id: string) {
    return this.landlordsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.LANDLORD)
  update(@Param('id') id: string, @Body() updateLandlordDto: UpdateLandlordDto) {
    return this.landlordsService.update(+id, updateLandlordDto);
  }

  @Delete(':id')
  @Roles(UserRole.LANDLORD)
  remove(@Param('id') id: string) {
    return this.landlordsService.remove(+id);
  }
}


