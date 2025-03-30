import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmailAndPassword(email: string, password: string) {
    // Busca o usuário no banco de dados
    return this.prisma.user.findFirst({
      where: { email, password },
    });
  }

  async createUser(email: string, password: string) {
    // Insere o usuário no banco de dados
    return this.prisma.user.create({
      data: { email, password },
    });
  }

  async getAllUsers() {
    // Retorna todos os usuários do banco de dados
    return this.prisma.user.findMany();
  }
}