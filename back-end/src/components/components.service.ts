import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ComponentsService {
  private prisma = new PrismaClient();

  async createComponent(name: string, cssContent: string) {
    return this.prisma.component.create({
      data: {
        name,
        cssContent,
      },
    });
  }

  async getAllComponents() {
    return this.prisma.component.findMany();
  }
}