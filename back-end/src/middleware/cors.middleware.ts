import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorsMiddleware.name);
  
  use(req: Request, res: Response, next: NextFunction) {    // Get the origin from the request
    const origin = req.headers.origin;
    
    // Allow requests from the frontend origins
    const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000', 'http://127.0.0.1:3001', 'http://192.168.0.74:3001'];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // For development, we'll be permissive and allow any origin with credentials
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        this.logger.warn(`Allowing request from non-whitelisted origin: ${origin}`);
      }
    }
    
    // Allow all common methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
    
    // Allow credentials
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Comprehensive list of headers to allow
    res.setHeader('Access-Control-Allow-Headers', 
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, ' +
      'Cache-Control, cache-control, Pragma, pragma, Expires, expires');
    
    // Expose the Set-Cookie header
    res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
    
    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
      this.logger.debug(`Handling OPTIONS preflight request to ${req.url}`);
      return res.status(204).end();
    }
    
    next();
  }
}
