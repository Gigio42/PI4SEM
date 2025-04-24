import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: number; componentId: number }) {
    return this.prisma.favorito.create({ data });
  }

  async findAll() {
    return this.prisma.favorito.findMany();
  }

  async findOne(id: string) {
    return this.prisma.favorito.findUnique({ where: { id } });
  }

  async update(id: string, data: { userId?: number; componentId?: number }) {
    return this.prisma.favorito.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.favorito.delete({ where: { id } });
  }
}