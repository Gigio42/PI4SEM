import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { CreateFavoritoDto } from './dto/create-favorito.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';

@ApiTags('favoritos')
@Controller('favoritos')
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) {}
  @Post()
  @Public()
  @ApiOperation({ summary: 'Adicionar um componente aos favoritos' })
  @ApiResponse({ status: 201, description: 'O favorito foi adicionado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário ou componente não encontrado' })
  create(@Body() createFavoritoDto: CreateFavoritoDto) {
    return this.favoritosService.create(createFavoritoDto);
  }
  @Get()
  @Public()
  @ApiOperation({ summary: 'Obter todos os favoritos' })
  @ApiResponse({ status: 200, description: 'Lista de todos os favoritos' })
  findAll() {
    return this.favoritosService.findAll();
  }
  @Get('user/:userId')
  @Public()
  @ApiOperation({ summary: 'Obter todos os favoritos de um usuário' })
  @ApiResponse({ status: 200, description: 'Lista de favoritos do usuário' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findByUser(@Param('userId') userId: string) {
    return this.favoritosService.findByUser(+userId);
  }
  @Get('check/:userId/:componentId')
  @Public()
  @ApiOperation({ summary: 'Verificar se um componente é favorito de um usuário' })
  @ApiResponse({ status: 200, description: 'Status do favorito' })
  checkIsFavorite(
    @Param('userId') userId: string,
    @Param('componentId') componentId: string,
  ) {
    return this.favoritosService.checkIsFavorite(+userId, +componentId);
  }
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obter um favorito pelo ID' })
  @ApiResponse({ status: 200, description: 'Detalhes do favorito' })
  @ApiResponse({ status: 404, description: 'Favorito não encontrado' })
  findOne(@Param('id') id: string) {
    return this.favoritosService.findOne(id);
  }  @Delete('user/:userId/component/:componentId')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um favorito pelo ID do usuário e do componente' })
  @ApiResponse({ status: 204, description: 'Favorito removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Favorito não encontrado' })
  removeByUserAndComponent(
    @Param('userId') userId: string,
    @Param('componentId') componentId: string,
  ) {
    return this.favoritosService.removeByUserAndComponent(+userId, +componentId);
  }

  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um favorito pelo ID' })
  @ApiResponse({ status: 204, description: 'Favorito removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Favorito não encontrado' })
  remove(@Param('id') id: string) {
    return this.favoritosService.remove(id);
  }
}
