import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AdminMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      this.logger.warn('Admin access denied - No user found');
      throw new UnauthorizedException('Authentication required');
    }

    const userRole = req.user['role'];
    const isAdmin = userRole === 'admin';

    this.logger.log(`Admin check - User: ${req.user['email']}, Role: ${userRole}, Is Admin: ${isAdmin}`);

    if (!isAdmin) {
      this.logger.warn(`Admin access denied - User role ${userRole} is not admin`);
      throw new UnauthorizedException('Admin access required');
    }

    // User is admin, proceed to the next middleware/route handler
    next();
  }
}
