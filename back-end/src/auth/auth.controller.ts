import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Inicia o fluxo de autenticação com o Google
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // Aqui você pode tratar o usuário autenticado
    // Redireciona para a página home no frontend
    res.redirect('http://localhost:3001/home');
  }

  @Get('/auth/google/redirect')
  @UseGuards(AuthGuard('google'))
  async handleGoogleRedirect(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.redirect('http://localhost:3001/home');
  }

  @Get('session-check')
  async checkSession(@Req() req: Request, @Res() res: Response) {
    console.log('Session check requested. Session data:', req.user ? 'User exists' : 'No user');
    
    // If there's a user in the session
    if (req.user) {
      // Send authenticated response
      return res.status(200).json({
        authenticated: true,
        user: {
          id: req.user['id'],
          email: req.user['email'],
          name: req.user['name'],
          // Don't include sensitive fields
        }
      });
    }

    // No authenticated user found
    return res.status(200).json({
      authenticated: false,
      message: 'No authenticated session found'
    });
  }

  @Get('check-auth')
  async checkAuthentication(@Req() req: Request, @Res() res: Response) {
    console.log('Authentication check requested');
    
    // If there's a user in the request (set by your auth middleware)
    if (req.user) {
      return res.status(200).json({
        authenticated: true,
        user: {
          id: req.user['id'],
          email: req.user['email'],
          name: req.user['name'],
        }
      });
    }
    
    // Check for session cookie or JWT token
    const token = req.cookies?.auth_token || 
                  req.headers?.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        // This is a simplified example - replace with your actual token verification
        // const decoded = verifyToken(token);
        
        return res.status(200).json({
          authenticated: true,
          // user: decoded
          message: 'Token found but verification not implemented in this endpoint'
        });
      } catch (error) {
        console.error('Token verification error:', error);
      }
    }
    
    // No authenticated user found
    return res.status(401).json({
      authenticated: false,
      message: 'No authenticated session found'
    });
  }
}