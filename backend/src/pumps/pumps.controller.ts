import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { PumpsService } from './pumps.service';
import { CreatePumpDataDto } from './dto/create-pump-data.dto';
import { RegisterPumpDto } from './dto/register-pump.dto';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pumps')
export class PumpsController {
  constructor(private readonly pumpsService: PumpsService) {}

  // ESP / IoT endpoint
  @Post('register')
  register(@Body() dto: RegisterPumpDto) {
    return this.pumpsService.registerPump(dto);
  }

  @Post('data')
  @UseGuards(ApiKeyGuard)
  create(@Body() dto: CreatePumpDataDto, @Req() req: any) {
    // Pump and API key already validated by ApiKeyGuard
    // req.pump and req.apiKey are set by the guard
    return this.pumpsService.createPumpData(dto, req.apiKey);
  }

  // Admin dashboard
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
  getPumpData(
    @Param('pumpId') pumpId: string,
    @Query('limit') limit?: string,
  ) {
    return this.pumpsService.getPumpData(
      pumpId,
      limit ? Number(limit) : 100,
    );
  }
}
