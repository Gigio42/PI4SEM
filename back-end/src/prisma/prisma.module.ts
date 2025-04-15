import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @description Módulo para o serviço do Prisma
 * Este módulo exporta o PrismaService para ser usado em outros módulos
 */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
