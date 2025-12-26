import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GeocodingModule } from '../geocoding/geocoding.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PrismaModule, GeocodingModule, UploadModule],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}


