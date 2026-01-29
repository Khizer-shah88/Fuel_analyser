import { Module } from '@nestjs/common';
import { PumpsController } from './pumps.controller';
import { PumpsService } from './pumps.service';
import { PrismaService } from '../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PumpsController],
  providers: [PumpsService, PrismaService],
  exports: [PumpsService],
})
export class PumpsModule {}
