import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSettingDto {
  @ApiProperty({ description: 'Settings section/category' })
  @IsNotEmpty()
  @IsString()
  section: string;

  @ApiProperty({ description: 'Setting key' })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({ description: 'Setting value', type: 'any' })
  @IsNotEmpty()
  value: any; // Alterado de IsString para aceitar qualquer tipo
}
