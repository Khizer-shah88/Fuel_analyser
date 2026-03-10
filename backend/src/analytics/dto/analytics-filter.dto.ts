import { IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';

/**
 * Base filter for analytics endpoints.
 * Allows scoping analytics to a specific station or pump.
 */
export class AnalyticsFilterDto {
  @IsOptional()
  @IsUUID()
  stationId?: string;

  @IsOptional()
  @IsString()
  pumpId?: string;
}





