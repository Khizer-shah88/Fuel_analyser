import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  IsDateString,
} from 'class-validator';

export class CreatePumpDataDto {
  @IsString()
  @IsNotEmpty()
  pumpId: string;

  @IsString()
  stationId: string;

  @IsNumber()
  @Min(0)
  liters: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @Min(1)
  nozzle: number;

  @IsString()
  @IsNotEmpty()
  fuelType: string;

  @IsDateString()
  @IsNotEmpty()
  timestamp: string; // ISO 8601 format

  @IsString()
  apiKey: string;
}
