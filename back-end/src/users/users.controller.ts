import { Body, Controller, Post, Get, Query, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return this.usersService.createUser(email, password);
  }

  @Get('login')
  async loginUser(@Query('email') email: string, @Query('password') password: string) {
    const user = await this.usersService.findUserByEmailAndPassword(email, password);
    if (!user) {
      throw new NotFoundException('Usuário ou senha inválidos');
    }
    return { message: 'Login bem-sucedido' };
  }
}