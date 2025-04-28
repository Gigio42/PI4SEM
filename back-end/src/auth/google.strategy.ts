import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    const callbackURL = configService.get('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/redirect';
    
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID') || 'dummy-client-id',
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET') || 'dummy-client-secret',
      callbackURL: callbackURL,
      scope: ['email', 'profile'],
    });
    
    this.logger.log(`Google Auth initialized with callback: ${callbackURL}`);
    
    // Log dummy info in development
    if (process.env.NODE_ENV !== 'production') {
      if (!configService.get('GOOGLE_CLIENT_ID')) {
        this.logger.warn('GOOGLE_CLIENT_ID not set, using dummy value for development');
      }
      if (!configService.get('GOOGLE_CLIENT_SECRET')) {
        this.logger.warn('GOOGLE_CLIENT_SECRET not set, using dummy value for development');
      }
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      this.logger.log(`Google auth validation for: ${profile.emails[0].value}`);
      
      const userData = {
        email: profile.emails[0].value,
        name: profile.displayName,
        googleId: profile.id,
        picture: profile.photos[0]?.value,
      };
      
      // Check if user exists in database
      let user = await this.prisma.user.findUnique({
        where: { email: userData.email },
      });
      
      if (user) {
        this.logger.log(`User found, updating Google info: ${userData.email}`);
        
        // Update the user with latest Google data if needed
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: userData.googleId,
            name: user.name || userData.name,
            picture: userData.picture,
          },
        });
      } else {
        this.logger.log(`Creating new user from Google: ${userData.email}`);
        
        // Create a new user
        user = await this.prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            googleId: userData.googleId,
            picture: userData.picture,
            role: 'user',
          },
        });
      }
      
      done(null, user);
    } catch (error) {
      this.logger.error(`Google validation error: ${error.message}`, error.stack);
      done(error, false);
    }
  }
}
