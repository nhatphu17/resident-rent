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
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private prisma: PrismaService,
  ) {}

  @Post()
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


