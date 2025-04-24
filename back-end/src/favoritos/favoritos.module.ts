import { Module } from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { FavoritosController } from './favoritos.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FavoritosController],
  providers: [FavoritosService, PrismaService],
})
export class FavoritosModule {}