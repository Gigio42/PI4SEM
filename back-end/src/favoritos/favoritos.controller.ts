import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FavoritosService } from './favoritos.service';

interface CreateFavoritoDto {
  userId: number;
  componentId: number;
}

@Controller('favoritos')
export class FavoritosController {
  private readonly logger = new Logger(FavoritosController.name);

  constructor(private readonly favoritosService: FavoritosService) {}

  @Post()
  @ApiOperation({ summary: 'Adicionar um componente aos favoritos' })
  @ApiResponse({ status: 201, description: 'Favorito adicionado com sucesso' })
  async create(@Body() createFavoritoDto: CreateFavoritoDto) {
    this.logger.log(`Adding favorite: user ${createFavoritoDto.userId}, component ${createFavoritoDto.componentId}`);
    return this.favoritosService.create(createFavoritoDto);
  }
  @Get('check/:componentId/:userId')
  @ApiOperation({ summary: 'Verificar se um componente é favorito de um usuário' })
  @ApiResponse({ status: 200, description: 'Status do favorito' })
  async checkIsFavorite(
    @Param('componentId', ParseIntPipe) componentId: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    this.logger.log(`Checking favorite: user ${userId}, component ${componentId}`);
    try {
      const isFavorite = await this.favoritosService.checkIsFavorite(userId, componentId);
      return { isFavorite };
    } catch (error) {
      this.logger.error(`Error checking favorite: ${error.message}`);
      // Return false instead of throwing an error to avoid breaking the frontend
      return { isFavorite: false };
    }
  }

  @Get('user/:userId/components')
  @ApiOperation({ summary: 'Obter favoritos de um usuário com detalhes dos componentes' })
  @ApiResponse({ status: 200, description: 'Lista de favoritos com componentes' })
  async getUserFavoritesWithComponents(@Param('userId', ParseIntPipe) userId: number) {
    this.logger.log(`Getting favorites with components for user ${userId}`);
    return this.favoritosService.getUserFavoritesWithComponents(userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obter favoritos de um usuário' })
  @ApiResponse({ status: 200, description: 'Lista de favoritos do usuário' })
  async findByUser(@Param('userId', ParseIntPipe) userId: number) {
    this.logger.log(`Getting favorites for user ${userId}`);
    return this.favoritosService.findByUser(userId);
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Obter um favorito pelo ID' })
  @ApiResponse({ status: 200, description: 'Detalhes do favorito' })
  @ApiResponse({ status: 404, description: 'Favorito não encontrado' })
  findOne(@Param('id') id: string) {
    return this.favoritosService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Obter todos os favoritos' })
  @ApiResponse({ status: 200, description: 'Lista de todos os favoritos' })
  findAll() {
    return this.favoritosService.findAll();
  }

  @Delete(':componentId/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um favorito pelo ID do componente e usuário' })
  @ApiResponse({ status: 204, description: 'Favorito removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Favorito não encontrado' })
  async removeByUserAndComponent(
    @Param('componentId', ParseIntPipe) componentId: number,
    @Param('userId', ParseIntPipe) userId: number
  ) {
    this.logger.log(`Removing favorite: user ${userId}, component ${componentId}`);
    return this.favoritosService.removeByUserAndComponent(userId, componentId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um favorito pelo ID' })
  @ApiResponse({ status: 204, description: 'Favorito removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Favorito não encontrado' })
  remove(@Param('id') id: string) {
    return this.favoritosService.remove(id);
  }
}
