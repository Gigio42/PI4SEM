import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';

/**
 * @Author: Dev-Ricas
 * @Date: 29/04/2025
 * @Description: Controlador responsável por gerenciar as requisições HTTP relacionadas aos favoritos do usuário.
 * Este controlador expõe endpoints para criar, buscar, listar e excluir os favoritos.
 * 
 * Rotas disponíveis:
 * - POST /favoritos: Adiciona um componente aos favoritos.
 * - GET /favoritos/:id: Retorna um favorito especifico.
 * - GET /favoritos: Retorna todos os favoritos.
 * - GET /favoritos/user/:userId: Retorna todos os favoritos de um usuário.
 * - GET /favoritos/check/:userId/:componentId: Verifica se um componente é favorito do usuário.
 * - DELETE /favoritos/:id: Remove um favorito pelo ID.
 * - DELETE /favoritos/user/:userId/component/:componentId: Remove um favorito pelo userId e componentId.
 */
@Controller('favoritos')
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) {}

  @Post()
  async create(@Body() data: { userId: string; componentId: string }) {
    return this.favoritosService.create({
      userId: Number(data.userId),
      componentId: Number(data.componentId),
    });
  }

  @Get()
  async findAll() {
    return this.favoritosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.favoritosService.findOne(id);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.favoritosService.findByUser(Number(userId));
  }

  @Get('check/:userId/:componentId')
  async checkFavorite(
    @Param('userId') userId: string,
    @Param('componentId') componentId: string,
  ) {
    return this.favoritosService.checkFavorite(
      Number(userId),
      Number(componentId)
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: { userId?: string; componentId?: string },
  ) {
    return this.favoritosService.update(id, {
      userId: data.userId ? Number(data.userId) : undefined,
      componentId: data.componentId ? Number(data.componentId) : undefined,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.favoritosService.remove(id);
  }

  @Delete('user/:userId/component/:componentId')
  async removeByUserAndComponent(
    @Param('userId') userId: string,
    @Param('componentId') componentId: string,
  ) {
    return this.favoritosService.removeByUserAndComponent(
      Number(userId),
      Number(componentId)
    );
  }
}