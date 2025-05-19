import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorsMiddleware.name);
    use(req: Request, res: Response, next: NextFunction) {    
    // Get the origin from the request
    const origin = req.headers.origin;
    const path = req.url || req.path || '<no path>';
    
    // Log the request origin and path for debugging
    this.logger.log(`${req.method} request from origin: ${origin || '<no origin>'} to ${path}`);
      // Allow requests from the frontend origins
    const allowedOrigins = [
      'http://localhost:3001', 
      'http://localhost:3000', 
      'http://127.0.0.1:3001', 
      'http://192.168.0.74:3001',
      process.env.FRONTEND_URL
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
      this.logger.debug(`Origin ${origin} is whitelisted`);
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (origin) {
      // For development, we'll log the non-whitelisted origin but still allow it
      this.logger.warn(`Allowing request from non-whitelisted origin: ${origin}`);
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      this.logger.debug('No origin specified in request');
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
