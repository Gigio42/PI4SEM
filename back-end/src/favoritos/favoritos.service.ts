import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: number; componentId: number }) {
    // Verificar se já existe um favorito para este usuário e componente
    const existingFavorite = await this.prisma.favorito.findFirst({
      where: {
        userId: data.userId,
        componentId: data.componentId,
      },
    });

    if (existingFavorite) {
      return existingFavorite; // Se já existe, retorna o existente
    }

    return this.prisma.favorito.create({ data });
  }

  async findAll() {
    return this.prisma.favorito.findMany({
      include: {
        component: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const favorito = await this.prisma.favorito.findUnique({ 
      where: { id },
      include: {
        component: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
          },
        },
      },
    });

    if (!favorito) {
      throw new NotFoundException(`Favorito com ID ${id} não encontrado`);
    }

    return favorito;
  }

  async findByUser(userId: number) {
    return this.prisma.favorito.findMany({
      where: { userId },
      include: {
        component: true,
      },
    });
  }

  async checkFavorite(userId: number, componentId: number) {
    const favorito = await this.prisma.favorito.findFirst({
      where: {
        userId,
        componentId,
      },
    });

    return { isFavorite: !!favorito, favorito };
  }

  async update(id: string, data: { userId?: number; componentId?: number }) {
    const favorito = await this.prisma.favorito.findUnique({ where: { id } });
    if (!favorito) {
      throw new NotFoundException(`Favorito com ID ${id} não encontrado`);
    }
    
    return this.prisma.favorito.update({ where: { id }, data });
  }

  async remove(id: string) {
    const favorito = await this.prisma.favorito.findUnique({ where: { id } });
    if (!favorito) {
      throw new NotFoundException(`Favorito com ID ${id} não encontrado`);
    }

    return this.prisma.favorito.delete({ where: { id } });
  }

  async removeByUserAndComponent(userId: number, componentId: number) {
    const favorito = await this.prisma.favorito.findFirst({
      where: {
        userId,
        componentId,
      },
    });

    if (!favorito) {
      throw new NotFoundException(`Favorito não encontrado para este usuário e componente`);
    }

    return this.prisma.favorito.delete({ where: { id: favorito.id } });
  }
}