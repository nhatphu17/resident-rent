import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private prisma: PrismaService,
  ) {}

  @Get('public')
  async findAvailableRooms(
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('maxDistance') maxDistance?: string,
  ) {
    const userLat = latitude ? parseFloat(latitude) : undefined;
    const userLng = longitude ? parseFloat(longitude) : undefined;
    const maxDist = maxDistance ? parseFloat(maxDistance) : undefined;

    return this.roomsService.findAvailableRooms(userLat, userLng, maxDist);
  }

  @Get('public/:id')
  async findOnePublic(@Param('id') id: string) {
    return this.roomsService.findOnePublic(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  async create(
    @Body() createRoomDto: CreateRoomDto,
    @CurrentUser() user: any,
  ) {
    const landlord = await this.prisma.landlord.findUnique({
      where: { userId: user.id },
    });
    return this.roomsService.create(landlord.id, createRoomDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD, UserRole.TENANT)
  async findAll(@CurrentUser() user: any) {
    let landlordId: number | undefined;
    if (user.role === 'LANDLORD') {
      const landlord = await this.prisma.landlord.findUnique({
        where: { userId: user.id },
      });
      landlordId = landlord?.id;
    }
    return this.roomsService.findAll(landlordId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD, UserRole.TENANT)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    let landlordId: number | undefined;
    if (user.role === 'LANDLORD') {
      const landlord = await this.prisma.landlord.findUnique({
        where: { userId: user.id },
      });
      landlordId = landlord?.id;
    }
    return this.roomsService.findOne(+id, landlordId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @CurrentUser() user: any,
  ) {
    const landlord = await this.prisma.landlord.findUnique({
      where: { userId: user.id },
    });
    return this.roomsService.update(+id, landlord.id, updateRoomDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const landlord = await this.prisma.landlord.findUnique({
      where: { userId: user.id },
    });
    return this.roomsService.remove(+id, landlord.id);
  }
}


