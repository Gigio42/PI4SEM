import { Injectable, NestMiddleware, Logger, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AdminMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Check if user is authenticated and has admin role
    if (!req.user) {
      this.logger.warn('Unauthorized access attempt to admin route');
      throw new ForbiddenException('You must be logged in to access this resource');
    }

    // Use optional chaining and fallback values to avoid property errors
    const userRole = (req.user as any)?.role;
    const userEmail = (req.user as any)?.email || 'unknown';

    if (userRole !== 'admin') {
      this.logger.warn(`Access denied for user ${userEmail}: Not an admin`);
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    this.logger.log(`Admin access granted for user ${userEmail}`);
    next();
  }
}
