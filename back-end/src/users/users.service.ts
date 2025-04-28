import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto'; // Use crypto instead of bcrypt temporarily

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          password,
          name: email.split('@')[0], // Default name from email
          role: 'user', // Default role
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          // Remove createdAt if it's not in your Prisma schema
          // If you need createdAt, make sure it's defined in your schema
        },
      });
      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Este email já está em uso.');
      }
      throw error;
    }
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    return user;
  }

  // This method will be deprecated in favor of more secure methods
  async findUserByEmailAndPassword(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user) return null;

    // Use the crypto-based password comparison instead of bcrypt
    const hashedInput = createHash('sha256').update(password).digest('hex');
    const isPasswordValid = hashedInput === user.password;
    if (!isPasswordValid) return null;

    return user;
  }
  // Method to update Google user information after authentication
  async updateGoogleUser(
    googleId: string, 
    email: string, 
    firstName: string, 
    picture: string, 
    lastName?: string, 
    displayName?: string
  ) {
    let user = await this.prisma.user.findUnique({
      where: { googleId },
    });

    // Use displayName for the name if provided, otherwise use firstName
    const name = displayName || firstName;

    if (!user) {
      // Look up by email as fallback
      user = await this.findUserByEmail(email);
      if (user) {
        // Update existing user with Google ID
        return this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            name: name || user.name,
            picture: picture || user.picture,
          },
        });
      }

      // Create new user
      return this.prisma.user.create({
        data: {
          googleId,
          email,
          name,
          picture,
          role: 'user',
        },
      });
    }

    // Update existing Google user
    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        picture,
        email, // Update email in case it changed
      },
    });
  }
}