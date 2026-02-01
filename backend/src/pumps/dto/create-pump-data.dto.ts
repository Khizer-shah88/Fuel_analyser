import {
  IsString,
  IsNotEmpty,
  Min,
  IsDateString,
  IsOptional,
  IsEnum,
  Max,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
}

export class CreatePumpDataDto {
  @IsString()
  @IsNotEmpty({ message: 'pumpId is required' })
  pumpId: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'liters must be a number' })
  @Min(0, { message: 'liters must be non-negative' })
  @Max(10000, { message: 'liters cannot exceed 10000' })
  liters: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'amount must be a number' })
  @Min(0, { message: 'amount must be non-negative' })
  @Max(1000000, { message: 'amount cannot exceed 1000000' })
  amount: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'nozzle must be a number' })
  @Min(1, { message: 'nozzle number must be at least 1' })
  @Max(10, { message: 'nozzle number cannot exceed 10' })
  nozzle: number;

  @IsEnum(FuelType, { message: 'fuelType must be either PETROL or DIESEL' })
  fuelType: FuelType;

  @IsDateString({}, { message: 'timestamp must be a valid ISO 8601 date string' })
  @IsNotEmpty({ message: 'timestamp is required' })
  timestamp: string;

  @IsString()
  @IsOptional()
  stationId?: string;
}
