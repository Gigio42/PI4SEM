import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, Min, Max } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  duration?: number; // This will be mapped to durationDays

  @IsArray()
  @IsOptional()
  features?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discount?: number;
}

export class UpdatePlanDto extends CreatePlanDto {
  @IsOptional()
  declare name: string;

  @IsOptional()
  declare description: string;

  @IsOptional()
  declare price: number;
}