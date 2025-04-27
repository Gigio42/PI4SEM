import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  private readonly logger = new Logger(JwtMiddleware.name);

  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Try to extract token from cookies first
    const token = req.cookies?.auth_token;
    
    // If no cookie, try Authorization header
    const authHeader = req.headers.authorization;
    let headerToken: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      headerToken = authHeader.substring(7);
    }
    
    const finalToken = token || headerToken;

    if (finalToken) {
      try {
        // Verify and decode the token
        const decoded = this.jwtService.verify(finalToken);
        
        // Attach user data to request object
        req.user = decoded;
        
        this.logger.debug(`User authenticated: ${decoded.email}`);
      } catch (error) {
        this.logger.debug(`Invalid token: ${error.message}`);
        // We don't throw an error here, just continue without authenticated user
        // This allows public routes to work without authentication
      }
    }

    next();
  }
}
