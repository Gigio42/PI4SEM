import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Extract from cookie
          const token = request?.cookies?.auth_token;
          if (token) {
            console.log('JWT token found in cookies');
            return token;
          }
          
          // Fallback to auth header
          const authHeader = request.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            console.log('JWT token found in Authorization header');
            return authHeader.substring(7);
          }
          
          console.log('No JWT token found in request');
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'supersecretkey',
    });
  }

  async validate(payload: any) {
    try {
      // Validate that user still exists in database
      const user = await this.usersService.findUserById(payload.sub);
      
      // Return user data to be added to request object
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
