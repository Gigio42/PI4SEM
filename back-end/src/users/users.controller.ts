import { Body, Controller, Post, Get, Param, NotFoundException, BadRequestException, Res, UseGuards, Request, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
import { createHash } from 'crypto'; // Node.js built-in module  // This import will work after installing the packages
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Public } from '../auth/public.decorator';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  // Temporary password hash function until bcrypt is installed
  private async hashPassword(password: string): Promise<string> {
    // Simple SHA-256 hash (NOTE: This is not as secure as bcrypt for production)
    return createHash('sha256').update(password).digest('hex');
  }

  private async comparePasswords(plain: string, hashed: string): Promise<boolean> {
    const hashedPlain = await this.hashPassword(plain);
    return hashedPlain === hashed;
  }
  @Post()
  @Public()
  async createUser(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    // Validate the data
    if (!email || !password) {
      throw new BadRequestException('Email e senha são obrigatórios.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Formato de email inválido.');
    }

    // Validate email length
    if (email.length > 255) {
      throw new BadRequestException('O email é muito longo.');
    }

    // Validate password length
    if (password.length < 6 || password.length > 128) {
      throw new BadRequestException('A senha deve ter entre 6 e 128 caracteres.');
    }

    // Check if user already exists
    const existingUser = await this.usersService.findUserByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Este email já está em uso.');
    }

    // Hash the password before storing
    const hashedPassword = await this.hashPassword(password);

    // Create the user with hashed password
    return this.usersService.createUser(email, hashedPassword);
  }

  @Get('stats')
  async getUserStats() {
    try {
      const stats = await this.usersService.getUserStats();
      return stats;
    } catch (error) {
      this.logger.error(`Error fetching user stats: ${error.message}`, error.stack);
      throw error;
    }
  }
  @Post('login')
  @Public()
  async loginUser(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) response: Response) {
    try {
      const { email, password } = body;
      
      this.logger.log(`Login attempt for user: ${email}`);

      // Find user by email
      const user = await this.usersService.findUserByEmail(email);
      if (!user) {
        this.logger.warn(`Login failed: User with email ${email} not found`);
        throw new UnauthorizedException('Usuário ou senha inválidos');
      }

      // Verify password using temporary function instead of bcrypt
      if (user.password) {
        const isPasswordValid = await this.comparePasswords(password, user.password);
        if (!isPasswordValid) {
          this.logger.warn(`Login failed: Invalid password for user ${email}`);
          throw new UnauthorizedException('Usuário ou senha inválidos');
        }
      } else {
        // User has no password (Google user), can't login with form
        this.logger.warn(`Login failed: User ${email} has no password (Google account)`);
        throw new UnauthorizedException('Esta conta foi criada com Google. Por favor, faça login com Google.');
      }

      // Generate JWT token
      const payload = { 
        sub: user.id, 
        email: user.email,
        name: user.name || email.split('@')[0],
        role: user.role || 'user'
      };
      
      const token = this.jwtService.sign(payload);
      
      // Set session cookie
      const secure = this.configService.get('NODE_ENV') === 'production';
      response.cookie('auth_token', token, {
        httpOnly: true,
        secure: secure,
        sameSite: secure ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      this.logger.log(`User ${email} logged in successfully`);
      
      // Return user data (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      return {
        message: 'Login bem-sucedido',
        user: userWithoutPassword
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      throw error;
    }  }
  @Post('logout')
  @Public()  async logout(@Res({ passthrough: true }) response: Response) {
    // Clear both auth_token and user_info cookies
    const secure = this.configService.get('NODE_ENV') === 'production';
    
    response.clearCookie('auth_token', {
      httpOnly: true,
      secure: secure,
      sameSite: secure ? 'none' : 'lax',
      path: '/'
    });
    
    response.clearCookie('user_info', {
      httpOnly: false,
      secure: secure,
      sameSite: secure ? 'none' : 'lax',
      path: '/'
    });
    
    this.logger.log('User logged out successfully, all cookies cleared');
    return { message: 'Logout bem-sucedido' };
  }
}