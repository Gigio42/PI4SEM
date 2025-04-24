import { Body, Controller, Get, Post, Put, Delete, Param, BadRequestException, UsePipes, ValidationPipe, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ComponentsService } from './components.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';

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
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Componente criado com sucesso' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos fornecidos' })
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createComponent(@Body() createComponentDto: CreateComponentDto) {
    return this.componentsService.createComponent(
      createComponentDto.name,
      createComponentDto.cssContent,
      createComponentDto.category,
      createComponentDto.color,
      createComponentDto.htmlContent
    );
  }

  @ApiOperation({ summary: 'Retorna um componente especifico, definido pelo ID da rota'})
  @ApiParam({
   name: 'id',
   description: 'ID do componente',
   type: 'string'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Componente encontrado' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Componente não encontrado' })
  @Get(':id')
  async getComponentById(@Param('id') id: string){
    return this.componentsService.getComponentById(id);
  }

  @ApiOperation({ summary: 'Retorna todos os componentes'})
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de componentes retornada com sucesso' })
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
  @ApiResponse({ status: HttpStatus.OK, description: 'Componente excluído com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Componente não encontrado' })
  @Delete(':id')
  async deleteComponent(@Param('id') id: string ){
    return this.componentsService.deleteComponent(id);
  }

  @ApiOperation({ summary: 'Atualiza um componente específico, definido pelo ID da rota' })
  @ApiParam({
    name: 'id',
    description: 'ID do componente',
    type: 'string'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Componente atualizado com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Componente não encontrado' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos fornecidos' })
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateComponent(
    @Param('id') id: string,
    @Body() updateComponentDto: UpdateComponentDto
  ) {
    return this.componentsService.updateComponent(id, updateComponentDto);
  }
}