import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para criação de novos componentes
 */
export class CreateComponentDto {
  @ApiProperty({
    description: 'Nome do componente CSS',
    example: 'Modern Button',
  })
  @IsNotEmpty({ message: 'O nome do componente é obrigatório' })
  @IsString({ message: 'O nome do componente deve ser uma string' })
  name: string;

  @ApiProperty({
    description: 'Conteúdo CSS do componente',
    example: '.btn { background-color: #6366F1; color: white; padding: 10px 16px; border-radius: 6px; }',
  })
  @IsNotEmpty({ message: 'O conteúdo CSS é obrigatório' })
  @IsString({ message: 'O conteúdo CSS deve ser uma string' })
  cssContent: string;

  @ApiProperty({
    description: 'Categoria do componente',
    example: 'Buttons',
    required: false,
  })
  @IsString({ message: 'A categoria deve ser uma string' })
  category?: string;

  @ApiProperty({
    description: 'Cor representativa do componente (código hexadecimal)',
    example: '#6366F1',
    required: false,
  })
  @IsString({ message: 'A cor deve ser uma string' })
  color?: string;
}
// Add this line after the CreateComponentDto is defined
export type UpdateComponentDto = Partial<CreateComponentDto>;