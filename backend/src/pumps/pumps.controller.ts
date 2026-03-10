import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
  Logger,
} from '@nestjs/common';
import { PumpsService } from './pumps.service';
import { CreatePumpDataDto } from './dto/create-pump-data.dto';
import { RegisterPumpDto } from './dto/register-pump.dto';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pumps')
export class PumpsController {
  private readonly logger = new Logger(PumpsController.name);

  constructor(private readonly pumpsService: PumpsService) {}

  // ESP / IoT endpoint - REGISTRATION (NO AUTH NEEDED - pump doesn't have API key yet!)
  @Post('register')
  async register(@Body() dto: RegisterPumpDto) {
    this.logger.log(`📝 Pump registration request: ${dto.pumpId}`);
    try {
      const result = await this.pumpsService.registerPump(dto);
      this.logger.log(`✅ Pump registered successfully: ${dto.pumpId}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Pump registration failed for ${dto.pumpId}:`, error.message);
      throw error;
    }
  }

  // ESP / IoT endpoint - DATA SUBMISSION (REQUIRES API KEY)
  @Post('data')
  @UseGuards(ApiKeyGuard)
  async create(@Body() dto: CreatePumpDataDto, @Req() req: any) {
    // Pump and API key already validated by ApiKeyGuard
    // req.pump and req.apiKey are set by the guard
    this.logger.log(`📥 Received pump data from ${dto.pumpId}`);
    this.logger.debug(`Data: ${JSON.stringify(dto)}`);
    
    try {
      const result = await this.pumpsService.createPumpData(dto, req.apiKey);
      this.logger.log(`✅ Successfully saved transaction for ${dto.pumpId}: ${dto.liters}L, Rs${dto.amount}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to save transaction for ${dto.pumpId}:`, error.message);
      this.logger.error(`Error details:`, error.stack);
      throw error;
    }
  }

  // Admin dashboard - GET ALL PUMPS (REQUIRES JWT)
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.pumpsService.getAllPumps();
  }

  // Admin dashboard - GET SINGLE PUMP (REQUIRES JWT)
  @Get(':pumpId')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('pumpId') pumpId: string) {
    return this.pumpsService.getPumpById(pumpId);
  }

  // Admin dashboard - GET PUMP DATA (REQUIRES JWT)
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