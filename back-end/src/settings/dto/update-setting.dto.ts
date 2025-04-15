import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({ description: 'Settings section/category', required: false })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiProperty({ description: 'Setting key', required: false })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiProperty({ description: 'Setting value', required: false })
  @IsOptional()
  @IsString()
  value?: string;
}
