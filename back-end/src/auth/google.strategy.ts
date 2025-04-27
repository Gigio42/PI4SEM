import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing Google OAuth configuration. GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL are required.');
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
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, name, emails, photos } = profile;

      if (!emails || emails.length === 0) {
        this.logger.error('Google profile missing email');
        return done(new Error('Google authentication failed: No email provided'), false);
      }

      const email = emails[0].value;
      const firstName = name?.givenName || email.split('@')[0];
      const lastName = name?.familyName || '';
      const displayName = name?.displayName || `${firstName} ${lastName}`.trim() || email.split('@')[0];
      const picture = photos?.[0]?.value || null;

      this.logger.log(`Google authentication for: ${email} (${displayName})`);

      // Update or create user in our database
      const user = await this.usersService.updateGoogleUser(
        id,
        email,
        firstName,
        picture,
        lastName,
        displayName
      );

      // Ensure picture is included in the returned user object
      if (picture && !user.picture) {
        user.picture = picture;
      }

      // Return user data that will be available in the request object
      return done(null, user);
    } catch (error) {
      this.logger.error(`Google strategy error: ${error.message}`, error.stack);
      return done(error, false);
    }
  }
}