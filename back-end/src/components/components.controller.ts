import { Body, Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { ComponentsService } from './components.service';

/**
 * @Author: Dev-Ricas & Luanplays11
 * @Date: 29/03/2025
 * @Description: Controlador responsável por gerenciar as requisições HTTP relacionadas aos componentes CSS.
 * Este controlador expõe endpoints para criar, buscar, listar e excluir componentes no sistema.
 * 
 * Rotas disponíveis:
 * - POST /components: Cria um novo componente.
 * - GET /components/:id: Retorna um componente específico.
 * - GET /components: Retorna todos os componentes.
 * - DELETE /components/:id: Exclui um componente pelo ID.
 */
@ApiTags('Components')
@Controller('components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @ApiOperation({ summary: 'Cria um novo componente'})
  @ApiBody({
    description: 'Objeto contendo nome do componente e o código CSS',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        cssContent: { type: 'string'}
      }
    }
  })
  @Post()
  async createComponent(@Body() body: { name: string; cssContent: string }) {
    const { name, cssContent } = body;
    return this.componentsService.createComponent(name, cssContent);
  }

  @ApiOperation({ summary: 'Retorna um componente especifico, definido pelo ID da rota'})
  @ApiParam({
   name: 'id',
   description: 'ID do componente',
   type: 'string'
  })
  @Get(':id')
  async getComponentById(@Param('id') id: string){
    return this.componentsService.getComponentById(id);
  }

  @ApiOperation({ summary: 'Retorna todos os componentes'})
  @Get()
  async getAllComponents() {
    return this.componentsService.getAllComponents();
  }

  @ApiOperation({ summary: 'Deleta um componente especifico, definido pelo ID da rota' })
  @ApiParam({
    name: 'id',
    description: 'ID do component',
    type: 'string'
  })
  @Delete(':id')
  async deleteComponent(@Param('id') id: string ){
    return this.componentsService.deleteComponent(id);
  }
}