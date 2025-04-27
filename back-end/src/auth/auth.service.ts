import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly frontendUrl: string;
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Get frontend URL from env or use default
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    this.logger.log(`Frontend URL configured as: ${this.frontendUrl}`);
  }  async handleGoogleLogin(req, res) {
    try {
      // Ensure we have user data from the Google strategy
      if (!req.user) {
        this.logger.error('Google authentication failed: No user data received');
        return res.redirect(`${this.frontendUrl}/login?error=auth_failed`);
      }

      const user = req.user;
      this.logger.log(`Google user authenticated: ${user.email}`);

      // Create JWT payload
      const payload = { 
        sub: user.id, 
        email: user.email,
        name: user.name || user.email.split('@')[0],
        role: user.role || 'user',
        picture: user.picture
      };
      
      // Generate JWT token
      const token = this.jwtService.sign(payload);
      this.logger.log('JWT token generated successfully');
        // Set JWT as a cookie with proper settings for cross-domain
      const secure = this.configService.get('NODE_ENV') === 'production';
      const cookieDomain = this.configService.get('COOKIE_DOMAIN') || undefined;
        // Define cookie options
      const cookieOptions = {
        httpOnly: true,
        secure: secure,
        sameSite: secure ? 'none' : 'lax', // Use 'none' for cross-domain in production with HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
        domain: cookieDomain, // Only set if configured
      };
      
      // Log the token for debugging
      this.logger.log(`Setting auth_token cookie (partial token: ${token.substring(0, 15)}...)`);
      res.cookie('auth_token', token, cookieOptions);
      this.logger.log('Auth cookie set successfully');

      // Add a public cookie with minimal user info that JavaScript can read
      // This helps the frontend identify the user immediately after redirect
      const userInfo = {
        id: user.id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: user.role || 'user',
        picture: user.picture
      };
      
      res.cookie('user_info', JSON.stringify(userInfo), {
        ...cookieOptions,
        httpOnly: false, // Accessible to JavaScript
      });
      this.logger.log('User info cookie set for frontend access');

      // Build the redirect URL with timestamp to avoid caching
      const timestamp = Date.now();
      const redirectUrl = `${this.frontendUrl}/home?auth=google&t=${timestamp}`;
      
      this.logger.log(`Redirecting authenticated user to: ${redirectUrl}`);
      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(`Error handling Google login: ${error.message}`, error.stack);
      return res.redirect(`${this.frontendUrl}/login?error=server_error`);
    }
  }

  async validateToken(token: string) {
    try {
      this.logger.log('Validating JWT token');
      const payload = this.jwtService.verify(token);
      
      if (!payload || !payload.sub || !payload.email) {
        this.logger.warn('Invalid token payload');
        return null;
      }
      
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role || 'user',
        picture: payload.picture
      };
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      return null;
    }
  }
}
