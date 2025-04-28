import { Module, MiddlewareConsumer, RequestMethod, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FavoritosModule } from './favoritos/favoritos.module';
import { AuthModule } from './auth/auth.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ComponentsModule } from './components/components.module'; // Added import
import { UsersModule } from './users/users.module'; // Added UsersModule import
import { StatisticsModule } from './statistics/statistics.module'; // Added StatisticsModule import
import { CorsMiddleware } from './middleware/cors.middleware';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';
// Import other modules as needed

@Module({  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    FavoritosModule,
    AuthModule, // This imports JwtModule and JwtAuthGuard
    SubscriptionModule,
    ComponentsModule, // Added ComponentsModule
    UsersModule, // Added UsersModule to enable users endpoints
    StatisticsModule, // Added StatisticsModule
    // Other modules
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
