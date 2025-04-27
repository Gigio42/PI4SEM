import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Try to extract the JWT from the cookie first
        (request: Request) => {
          const token = request?.cookies?.auth_token;
          if (!token) {
            return null;
          }
          return token;
        },
        // Then try from the Authorization header as fallback
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'super-secret-dev-key-change-me',
    });
    
    this.logger.log('JWT Strategy initialized');
  }

  async validate(payload: any) {
    try {
      this.logger.debug(`Validating JWT payload for user: ${payload.email}`);
      
      // Basic payload validation
      if (!payload.sub || !payload.email) {
        this.logger.warn('Invalid JWT payload structure');
        return null;
      }
      
      // Check if user exists in the database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      
      if (!user) {
        this.logger.warn(`User with ID ${payload.sub} not found in database`);
        return null;
      }
      
      // Return the user object that will be available in the request
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture
      };
    } catch (error) {
      this.logger.error(`Error validating JWT: ${error.message}`, error.stack);
      return null;
    }
  }
}
