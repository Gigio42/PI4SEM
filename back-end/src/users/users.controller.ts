import { Body, Controller, Post, Get, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    // Valida os dados
    if (!email || !password) {
      throw new BadRequestException('Email e senha são obrigatórios.');
    }

    // Valida o formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Formato de email inválido.');
    }

    // Valida o tamanho do email
    if (email.length > 255) {
      throw new BadRequestException('O email é muito longo.');
    }

    // Valida o tamanho da senha
    if (password.length < 6 || password.length > 128) {
      throw new BadRequestException('A senha deve ter entre 6 e 128 caracteres.');
    }

    return this.usersService.createUser(email, password);
  }

  @Get('login')
  async loginUser(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    const user = await this.usersService.findUserByEmailAndPassword(email, password);
    if (!user) {
      throw new NotFoundException('Usuário ou senha inválidos');
    }
    return { message: 'Login bem-sucedido' };
  }
}