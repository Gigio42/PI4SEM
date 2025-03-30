import { Module } from '@nestjs/common';
import { ComponentsController } from './components.controller';
import { ComponentsService } from './components.service';

/**
 * @Author: Luanplays11
 * @Date: 29/03/2025
 * @Description: Módulo responsável pela gestão de componentes
 * Este módulo agrupa o controlador e o serviço relacionados
 * á manipulação de compones CSS
 */
@Module({
  controllers: [ComponentsController],
  providers: [ComponentsService],
})
export class ComponentsModule {}