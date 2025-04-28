import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Logger } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    
    // Check if token exists in cookies
    const token = request.cookies?.auth_token;
    
    // Or in authorization header
    if (!token) {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const bearerToken = authHeader.substring(7);
        
        try {
          const payload = this.jwtService.verify(bearerToken);
          request.user = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            role: payload.role || 'user',
            picture: payload.picture
          };
          return true;
        } catch (error) {
          this.logger.error(`Bearer token validation failed: ${error.message}`);
          throw new UnauthorizedException('Invalid token');
        }
      }
      
      throw new UnauthorizedException('No token provided');
    }
    
    try {
      const payload = this.jwtService.verify(token);
      request.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role || 'user',
        picture: payload.picture
      };
      return true;
    } catch (error) {
      this.logger.error(`Cookie token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
