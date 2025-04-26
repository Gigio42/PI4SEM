import { Controller, Get, Req, Res, UseGuards, InternalServerErrorException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Inicia o fluxo de autenticação com o Google
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    try {
      // Processa o usuário autenticado
      const user = req.user;
      this.logger.log(`User authenticated: ${user?.email || 'unknown'}`);
      
      // Redireciona para a página home no frontend com token na query (opcionalmente)
      res.redirect('http://localhost:3001/home');
    } catch (error) {
      this.logger.error(`Error during Google redirect: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Authentication process failed');
    }
  }

  // Remover este endpoint duplicado ou fazer merge com o anterior
  // O caminho '/auth/google/redirect' está errado, já que o controlador já tem prefix 'auth'
  // @Get('/auth/google/redirect')
  // @UseGuards(AuthGuard('google'))
  // async handleGoogleRedirect(@Req() req: Request, @Res() res: Response) {
  //   if (!req.user) {
  //     return res.status(401).json({ message: 'Unauthorized' });
  //   }
  //   res.redirect('http://localhost:3001/home');
  // }

  @Get('session-check')
  async checkSession(@Req() req: Request, @Res() res: Response) {
    try {
      this.logger.log('Session check requested');
      
      // If there's a user in the session
      if (req.user) {
        // Extract exact role value directly from the user object
        const role = req.user['role'] || 'user';
        
        this.logger.log(`User authenticated with role: ${role}`);
        
        // Send authenticated response with exact role value
        return res.status(200).json({
          authenticated: true,
          user: {
            id: req.user['id'],
            email: req.user['email'],
            name: req.user['name'],
            role: role, // Send the exact role string
          }
        });
      }

      // No authenticated user found
      return res.status(200).json({
        authenticated: false,
        message: 'No authenticated session found'
      });
    } catch (error) {
      this.logger.error(`Error during session check: ${error.message}`, error.stack);
      return res.status(500).json({
        authenticated: false,
        message: 'Internal server error during authentication check'
      });
    }
  }

  @Get('check-auth')
  async checkAuthentication(@Req() req: Request, @Res() res: Response) {
    try {
      this.logger.log('Authentication check requested');
      
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
          this.logger.error(`Token verification error: ${error.message}`, error.stack);
          return res.status(401).json({
            authenticated: false,
            message: 'Invalid authentication token'
          });
        }
      }
      
      // No authenticated user found
      return res.status(401).json({
        authenticated: false,
        message: 'No authenticated session found'
      });
    } catch (error) {
      this.logger.error(`Error during auth check: ${error.message}`, error.stack);
      return res.status(500).json({
        authenticated: false,
        message: 'Internal server error during authentication check'
      });
    }
  }
}