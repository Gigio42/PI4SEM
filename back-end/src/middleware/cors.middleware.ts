import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorsMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Allow requests from the frontend origin
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    
    // Allow all common methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
    
    // Allow credentials
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Allow all headers by default for preflight requests
    if (req.headers['access-control-request-headers']) {
      res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    } else {
      // Fallback to a comprehensive list of common headers
      res.setHeader('Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, ' +
        'Cache-Control, cache-control, Pragma, pragma, Expires, expires');
    }
    
    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
      this.logger.debug(`Handling OPTIONS preflight request to ${req.url}`);
      return res.status(204).end();
    }
    
    next();
  }
}
