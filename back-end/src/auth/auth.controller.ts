import { 
  Controller, 
  Get, 
  Req, 
  Res, 
  UseGuards, 
  InternalServerErrorException, 
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route initiates Google OAuth flow
    // The actual logic is handled by GoogleStrategy
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    return this.authService.handleGoogleLogin(req, res);
  }  @Get('session-check')
  async checkSession(@Req() req: Request, @Res() res: Response) {
    try {
      this.logger.log('Session check requested');
      
      // Check if we have the auth_token cookie
      const token = req.cookies?.auth_token;
      if (!token) {
        this.logger.log('No auth_token cookie found in request');
        return res.status(200).json({
          authenticated: false,
          message: 'No authenticated session found'
        });
      }
      
      // Try to validate the JWT token
      try {
        // Verify and extract user data from token
        const user = await this.authService.validateToken(token);
        
        if (user) {
          this.logger.log(`Session check: User authenticated - ${user.email}`);
          return res.status(200).json({
            authenticated: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              picture: user.picture
            }
          });
        }
      } catch (tokenError) {
        this.logger.error(`Invalid token: ${tokenError.message}`);
      }
      
      return res.status(200).json({
        authenticated: false,
        message: 'No authenticated session found'
      });
    } catch (error) {
      this.logger.error(`Error during session check: ${error.message}`, error.stack);
      return res.status(200).json({
        authenticated: false,
        message: 'Session check failed'
      });
    }
  }
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    // This route is protected by JWT authentication
    // Only authenticated users can access it
    return {
      user: req.user
    };
  }
  
  @Get('protected-session-check')
  @UseGuards(JwtAuthGuard)
  async protectedSessionCheck(@Req() req) {
    this.logger.log('Protected session check requested');
    return {
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        picture: req.user.picture
      }
    };
  }
}