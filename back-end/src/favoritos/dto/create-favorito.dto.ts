import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoritoDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'ID do componente',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  componentId: number;
}
