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
}