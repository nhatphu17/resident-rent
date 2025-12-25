import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LandlordsModule } from './landlords/landlords.module';
import { TenantsModule } from './tenants/tenants.module';
import { RoomsModule } from './rooms/rooms.module';
import { ContractsModule } from './contracts/contracts.module';
import { UsageModule } from './usage/usage.module';
import { InvoicesModule } from './invoices/invoices.module';
import { SensorDataModule } from './sensor-data/sensor-data.module';
import { SmsModule } from './sms/sms.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    LandlordsModule,
    TenantsModule,
    RoomsModule,
    ContractsModule,
    UsageModule,
    InvoicesModule,
    SensorDataModule,
    SmsModule,
    PdfModule,
  ],
})
export class AppModule {}

