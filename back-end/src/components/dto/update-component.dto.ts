import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

/**
 * DTO para atualização de componentes existentes
 */
export class UpdateComponentDto {
  @ApiProperty({
    description: 'Nome do componente CSS',
    example: 'Modern Button',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'O nome do componente deve ser uma string' })
  name?: string;

  @ApiProperty({
    description: 'Conteúdo CSS do componente',
    example: '.btn { background-color: #6366F1; color: white; padding: 10px 16px; border-radius: 6px; }',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'O conteúdo CSS deve ser uma string' })
  cssContent?: string;

  @ApiProperty({
    description: 'Categoria do componente',
    example: 'Buttons',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A categoria deve ser uma string' })
  category?: string;

  @ApiProperty({
    description: 'Cor representativa do componente (código hexadecimal)',
    example: '#6366F1',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A cor deve ser uma string' })
  color?: string;
}
