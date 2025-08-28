import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AnalyticsService } from '../analytics/analytics.service';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  access_token: string;
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax';
    maxAge: number;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private analyticsService: AnalyticsService,
  ) {}

  async register(
    email: string, 
    password: string, 
    gamerTag?: string, 
    firstName?: string, 
    lastName?: string
  ) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if gamerTag is already taken
    if (gamerTag) {
      const existingGamerTag = await this.prisma.user.findUnique({
        where: { gamerTag },
      });

      if (existingGamerTag) {
        throw new ConflictException('Gamer tag is already taken');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with all the new fields
    const user = await this.prisma.user.create({
      data: {
        email,
        gamerTag,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'PLAYER', // Default role
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(
    email: string, 
    password: string, 
    req?: Request
  ): Promise<LoginResponse> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    let isPasswordValid = false;
    let loginSuccess = false;

    try {
      if (user && (user as any).isActive) {
        // Verify password
        isPasswordValid = await bcrypt.compare(password, (user as any).password);
        if (isPasswordValid) {
          loginSuccess = true;
        }
      }
    } catch (error) {
      console.error('Password verification error:', error);
    }

    // Record login attempt with analytics
    if (req) {
      await this.analyticsService.recordLoginAttempt(
        req,
        email,
        password,
        loginSuccess,
        loginSuccess ? user?.id : undefined
      );
    }

    if (!loginSuccess || !user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: (user as any).role,
    };

    const token = this.jwtService.sign(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user as any;

    // Cookie options for secure authentication
    const cookieOptions = {
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax' as 'lax', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    };

    return {
      user: userWithoutPassword,
      access_token: token,
      cookieOptions,
    };
  }

  async validateUser(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user && user.isActive) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }
} 