import { Body, Controller, Get, Post, Put, Delete, Param, BadRequestException, UsePipes, ValidationPipe, HttpStatus, Logger, HttpException, Req, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ComponentsService } from './components.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

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
  private readonly logger = new Logger(ComponentsController.name);
  
  constructor(private readonly componentsService: ComponentsService) {}  @ApiOperation({ summary: 'Cria um novo componente'})
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Componente criado com sucesso' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos fornecidos' })
  @Public()
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createComponent(@Body() createComponentDto: CreateComponentDto, @Req() request: Request) {
    const userId = request.user ? (request.user as any).id : undefined; // Obtém o ID do usuário da requisição
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
  @Public()
  @Get(':id')
  async getComponentById(@Param('id') id: string, @Req() request: Request){
    // Extraindo o ID do usuário do token se existir
    const userId = request.user ? (request.user as any).id : undefined;
    return this.componentsService.getComponentById(id, userId);
  }  @ApiOperation({ summary: 'Retorna todos os componentes'})
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de componentes retornada com sucesso' })  
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Erro ao buscar componentes' })
  @Public()
  @Get()
  async getAllComponents(@Req() request: Request, @Query('userId') queryUserId: string) {
    try {
      this.logger.log('GET request received for /components');
      
      // Obtém userId do token ou da query string
      let userId: number | undefined;
      
      // Verificar primeiro se veio o userId na query
      if (queryUserId) {
        userId = parseInt(queryUserId, 10);
        this.logger.log(`Using userId ${userId} from query parameter`);
      } else {
        // Se não veio na query, tenta extrair do token
        userId = request.user ? (request.user as any).id : undefined;
        if (userId) {
          this.logger.log(`Using userId ${userId} from authentication token`);
        }
      }
      
      // Registrar explicitamente se está autenticado ou não
      if (userId) {
        this.logger.log(`Authenticated request for components from user ${userId}`);
      } else {
        this.logger.log('Unauthenticated request for components');
      }
      
      const result = await this.componentsService.getAllComponents(userId);
      // Contabilizar quantos componentes requerem assinatura (valor explícito true)
      const subscriptionRequiredCount = result.filter(c => c['requiresSubscription'] === true).length;
      this.logger.log(`Returning ${result.length} components, subscription required for ${subscriptionRequiredCount}`);
      // Return just the array directly, not wrapped in an object
      return result;
    } catch (error) {
      this.logger.error(`Error in GET /components: ${error.message}`);
      // Return a properly formatted error in JSON format that won't break the client
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Failed to fetch components',
        message: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }@ApiOperation({ summary: 'Deleta um componente especifico, definido pelo ID da rota' })
  @ApiParam({
    name: 'id',
    description: 'ID do component',
    type: 'string'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Componente excluído com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Componente não encontrado' })
  @Public()
  @Delete(':id')
  async deleteComponent(@Param('id') id: string ){
    return this.componentsService.deleteComponent(id);
  }  @ApiOperation({ summary: 'Atualiza um componente específico, definido pelo ID da rota' })
  @ApiParam({
    name: 'id',
    description: 'ID do componente',
    type: 'string'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Componente atualizado com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Componente não encontrado' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos fornecidos' })
  @Public()
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateComponent(
    @Param('id') id: string,
    @Body() updateComponentDto: UpdateComponentDto,
    @Req() request: Request
  ) {
    const userId = request.user ? (request.user as any).id : undefined; // Obtém o ID do usuário da requisição
    return this.componentsService.updateComponent(id, updateComponentDto);
  }
}