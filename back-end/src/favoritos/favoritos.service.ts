import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoritoDto } from './dto/create-favorito.dto';

@Injectable()
export class FavoritosService {
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
      return existingFavorito;
    }

    // Caso contrário, cria um novo favorito
    return this.prisma.favorito.create({
      data: createFavoritoDto
    });
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
    const favorito = await this.prisma.favorito.findFirst({
      where: {
        userId,
        componentId
      }
    });

    return {
      isFavorite: !!favorito,
      favorito
    };
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

    return this.prisma.favorito.delete({
      where: { id: favorito.id }
    });
  }
}
