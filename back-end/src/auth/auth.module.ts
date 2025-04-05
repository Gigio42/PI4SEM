import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule.forRoot(), PassportModule],
  controllers: [AuthController],
  providers: [GoogleStrategy, PrismaService],
})
export class AuthModule {}


