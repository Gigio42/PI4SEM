import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          console.warn('WARNING: JWT_SECRET not set in environment. Using fallback secret for development only!');
        }
        return {
          secret: secret || 'fallback_dev_secret_do_not_use_in_production',
          signOptions: { 
            expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d'
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    GoogleStrategy, 
    PrismaService, 
    UsersService, 
    JwtStrategy,
    AuthService
  ],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}


