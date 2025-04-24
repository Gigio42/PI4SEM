import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsArray, IsOptional, Min, IsPositive } from 'class-validator';

export class CreatePlanDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsPositive()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  duration: number; // Duração em dias

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}
