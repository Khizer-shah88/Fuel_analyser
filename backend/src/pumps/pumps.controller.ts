import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PumpsService } from './pumps.service';
import { CreatePumpDataDto } from './dto/create-pump-data.dto';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pumps')
export class PumpsController {
  constructor(private readonly pumpsService: PumpsService) {}

  @Post('data')
  @UseGuards(ApiKeyGuard)
  create(@Body() createPumpDataDto: CreatePumpDataDto) {
    return this.pumpsService.createPumpData(createPumpDataDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.pumpsService.getAllPumps();
  }

  @Get(':pumpId')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('pumpId') pumpId: string) {
    return this.pumpsService.getPumpById(pumpId);
  }

  @Get(':pumpId/data')
  @UseGuards(JwtAuthGuard)
  getPumpData(@Param('pumpId') pumpId: string, @Query('limit') limit?: string) {
    return this.pumpsService.getPumpData(pumpId, limit ? parseInt(limit) : 100);
  }
}
