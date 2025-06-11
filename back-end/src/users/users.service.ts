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

  // Get user statistics for admin dashboard
  async getUserStats() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get total users count
    const totalUsers = await this.prisma.user.count();
    
    // Get admin users count
    const admins = await this.prisma.user.count({
      where: {
        role: 'admin'
      }
    });
    
    // Get active users (users who have logged in at least once)
    const activeUsers = await this.prisma.user.count({
      where: {
        lastLogin: {
          not: null
        }
      }
    });
    
    // Get new users registered this month
    const newUsersThisMonth = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    });
    
    return {
      totalUsers,
      activeUsers,
      admins,
      newUsersThisMonth
    };
  }

  async getAllUsers() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          picture: true,
          googleId: true,
          createdAt: true,
          lastLogin: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Transform the data to match frontend expectations
      return users.map(user => ({
        id: user.id.toString(),
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: user.role as 'user' | 'admin',
        status: 'active', // You might want to add a status field to your schema
        signupDate: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString(),
        picture: user.picture,
        initials: this.generateInitials(user.name || user.email.split('@')[0])
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async updateUserRole(id: number, role: 'user' | 'admin') {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          picture: true,
          createdAt: true,
          lastLogin: true,
        }
      });

      return {
        id: updatedUser.id.toString(),
        name: updatedUser.name || updatedUser.email.split('@')[0],
        email: updatedUser.email,
        role: updatedUser.role as 'user' | 'admin',
        status: 'active',
        signupDate: updatedUser.createdAt.toISOString(),
        lastLogin: updatedUser.lastLogin?.toISOString(),
        initials: this.generateInitials(updatedUser.name || updatedUser.email.split('@')[0])
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
      }
      throw error;
    }
  }

  async updateUserStatus(id: number, status: 'active' | 'inactive') {
    try {
      // Since we don't have a status field in the schema yet, we'll simulate this
      // You might want to add a status field to your User model in Prisma
      const user = await this.findUserById(id);
      
      // For now, we'll just return the user data with the requested status
      // In a real implementation, you'd update the status field in the database
      return {
        id: user.id.toString(),
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: user.role as 'user' | 'admin',
        status: status,
        signupDate: user.createdAt?.toISOString() || new Date().toISOString(),
        lastLogin: user.lastLogin?.toISOString(),
        initials: this.generateInitials(user.name || user.email.split('@')[0])
      };
    } catch (error) {
      throw error;
    }
  }

  private generateInitials(name: string): string {
    if (!name) return '??';
    
    const nameParts = name.split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return '?';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }
}