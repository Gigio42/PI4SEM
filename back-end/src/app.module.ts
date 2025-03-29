import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ComponentsModule } from './components/components.module';

@Module({
  imports: [UsersModule, ComponentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
