import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateFavoritoDto {
  userId: number;
  componentId: number;
}

@Injectable()
export class FavoritosService {
  private readonly logger = new Logger(FavoritosService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Cria um novo favorito
   */
  async create(createFavoritoDto: CreateFavoritoDto) {
    // Verificar se o componente e o usuário existem
    const user = await this.prisma.user.findUnique({
      where: { id: createFavoritoDto.userId }
    });

    if (!user) {
      throw new NotFoundException(`Usuário #${createFavoritoDto.userId} não encontrado`);
    }

    const component = await this.prisma.component.findUnique({
      where: { id: createFavoritoDto.componentId }
    });

    if (!component) {
      throw new NotFoundException(`Componente #${createFavoritoDto.componentId} não encontrado`);
    }

    // Verificar se este favorito já existe
    const existingFavorito = await this.prisma.favorito.findFirst({
      where: {
        userId: createFavoritoDto.userId,
        componentId: createFavoritoDto.componentId
      }
    });

    // Se já existir, retorna o favorito existente
    if (existingFavorito) {
      this.logger.warn(`Favorito já existe: usuário ${createFavoritoDto.userId}, componente ${createFavoritoDto.componentId}`);
      return existingFavorito;
    }

    // Caso contrário, cria um novo favorito
    const favorito = await this.prisma.favorito.create({
      data: createFavoritoDto
    });

    this.logger.log(`Favorito criado: usuário ${createFavoritoDto.userId}, componente ${createFavoritoDto.componentId}`);
    return favorito;
  }

  /**
   * Remove um favorito pelo ID
   */
  async remove(id: string) {
    const favorito = await this.prisma.favorito.findUnique({
      where: { id }
    });

    if (!favorito) {
      throw new NotFoundException(`Favorito #${id} não encontrado`);
    }

    return this.prisma.favorito.delete({
      where: { id }
    });
  }

  /**
   * Remove um favorito pelo ID do usuário e componente
   */
  async removeByUserAndComponent(userId: number, componentId: number) {
    const favorito = await this.prisma.favorito.findFirst({
      where: {
        userId,
        componentId
      }
    });

    if (!favorito) {
      throw new NotFoundException(`Favorito não encontrado para o usuário #${userId} e componente #${componentId}`);
    }

    await this.prisma.favorito.delete({
      where: { id: favorito.id }
    });

    this.logger.log(`Favorito removido: usuário ${userId}, componente ${componentId}`);
    // Retornar uma resposta de sucesso
    return { message: 'Favorito removido com sucesso' };
  }

  /**
   * Busca todos os favoritos
   */
  async findAll() {
    return this.prisma.favorito.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        component: true
      }
    });
  }

  /**
   * Busca favoritos de um usuário específico
   */
  async findByUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException(`Usuário #${userId} não encontrado`);
    }

    return this.prisma.favorito.findMany({
      where: { userId },
      include: {
        component: true
      }
    });
  }
  /**
   * Verifica se um componente é favorito de um usuário
   */
  async checkIsFavorite(userId: number, componentId: number) {
    try {
      this.logger.log(`Iniciando verificação de favorito: usuário ${userId}, componente ${componentId}`);
      
      const favorito = await this.prisma.favorito.findFirst({
        where: {
          userId,
          componentId
        }
      });

      const isFavorite = !!favorito;
      this.logger.log(`Verificação de favorito: usuário ${userId}, componente ${componentId}, resultado: ${isFavorite}`);
      return isFavorite;
    } catch (error) {
      this.logger.error(`Erro ao verificar favorito para usuário ${userId}, componente ${componentId}: ${error.message}`);
      // Return false instead of throwing to avoid breaking the frontend
      return false;
    }
  }

  /**
   * Busca um favorito pelo ID
   */
  async findOne(id: string) {
    const favorito = await this.prisma.favorito.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        component: true
      }
    });

    if (!favorito) {
      throw new NotFoundException(`Favorito #${id} não encontrado`);
    }

    return favorito;
  }

  /**
   * Busca favoritos de um usuário com os componentes incluídos
   */
  async getUserFavoritesWithComponents(userId: number) {
    try {
      const favoritesWithComponents = await this.prisma.favorito.findMany({
        where: {
          userId,
        },
        include: {
          component: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const result = favoritesWithComponents.map(fav => ({
        ...fav.component,
        isFavorited: true,
        favoriteId: fav.id,
        favoritedAt: fav.createdAt,
      }));

      this.logger.log(`Encontrados ${result.length} componentes favoritos para o usuário ${userId}`);
      return result;
    } catch (error) {
      this.logger.error(`Erro ao obter favoritos com componentes: ${error.message}`);
      throw error;
    }
  }
}
