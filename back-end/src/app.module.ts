import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ComponentsModule } from './components/components.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SettingsModule } from './settings/settings.module';
import { FavoritosModule } from './favoritos/favoritos.module';

@Module({  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna o ConfigModule acessível globalmente
      envFilePath: '.env', // Especifica o caminho do arquivo .env
    }),
    PrismaModule,
    UsersModule,
    ComponentsModule,
    AuthModule,
    SubscriptionModule,
    SettingsModule,
    FavoritosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
