import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';

/**
 * @Author: Dev-Ricas
 * @Date: 29/04/2025
 * @Description: Controlador responsável por gerenciar as requisições HTTP relacionadas aos favoritos do usuário.
 * Este controlador expõe endpoints para criar, buscar, listar e excluir os favoritos.
 * 
 * Rotas disponíveis:
 * - POST /components: Adiciona um componente aos favoritos.
 * - GET /components/:id: Retorna um favorito especifico.
 * - GET /components: Retorna todos os favoritos.
 * - DELETE /components/:id: Remove um favorito pelo ID.
 */
@Controller('favoritos')
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) {}

  @Post()
  async create(@Body() data: { userId: string; componentId: string }) {
    return this.favoritosService.create(data);
  }

  @Get()
  async findAll() {
    return this.favoritosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.favoritosService.findOne(id);
  }

  /*@Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: { userId?: string; componentId?: string },
  ) {
    return this.favoritosService.update(id, data);
  }*/

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.favoritosService.remove(id);
  }
}