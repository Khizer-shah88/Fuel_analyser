import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  Length,
} from 'class-validator';

export class RegisterPumpDto {
  @IsString()
  @Length(1, 50, { message: 'pumpId must be between 1 and 50 characters' })
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message:
      'pumpId can only contain alphanumeric characters, dashes, and underscores',
  })
  pumpId: string;

  @IsString()
  @IsOptional()
  @Length(1, 100, { message: 'stationId must be between 1 and 100 characters' })
  stationId?: string;
}
