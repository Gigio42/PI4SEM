import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service'; // Certifique-se de ter um PrismaService configurado

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AppModule {}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService, // Injeta o ConfigService
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('As variáveis de ambiente GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_CALLBACK_URL devem estar definidas.');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any, // O req é necessário quando passReqToCallback é true
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    // Verificar se o usuário já existe no banco de dados
    let user = await this.prisma.user.findUnique({
      where: { googleId: id },
    });

    if (!user) {
      // Criar um novo usuário se ele não existir
      user = await this.prisma.user.create({
        data: {
          googleId: id,
          email: emails[0].value,
          name: name.givenName,
          picture: photos[0].value,
        },
      });
    } else {
      // Atualizar os dados do usuário existente
      user = await this.prisma.user.update({
        where: { googleId: id },
        data: {
          name: name.givenName,
          picture: photos[0].value,
        },
      });
    }    done(null, user);
  }
}