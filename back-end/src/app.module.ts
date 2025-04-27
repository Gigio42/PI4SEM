import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { CorsMiddleware } from './middleware/cors.middleware';
import { ComponentsModule } from './components/components.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { AppService } from './app.service';
import { ChromeDevToolsController } from './chrome-devtools/chrome-devtools.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ComponentsModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    SubscriptionModule,
  ],
  controllers: [
    ChromeDevToolsController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply CORS middleware to all routes
    consumer
      .apply(CorsMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
