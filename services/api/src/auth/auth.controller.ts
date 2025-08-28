import { Controller, Post, Body, UseGuards, Request, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

export class RegisterDto {
  email!: string;
  password!: string;
  gamerTag?: string;
  firstName!: string;
  lastName!: string;
  dateOfBirth!: string;
  country?: string;
  state?: string;
  agreedToTerms!: boolean;
  agreedToPrivacy!: boolean;
  termsVersion?: string;
  privacyVersion?: string;
}

export class LoginDto {
  email!: string;
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.gamerTag,
      registerDto.firstName,
      registerDto.lastName,
      registerDto.dateOfBirth,
      registerDto.country,
      registerDto.state,
      registerDto.agreedToTerms,
      registerDto.agreedToPrivacy,
      registerDto.termsVersion,
      registerDto.privacyVersion,
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto.email, loginDto.password, req);
    
            // Check if necessary cookies are allowed (from frontend consent)
        const cookieConsent = res.req.headers['x-cookie-consent'] as string;
        let canSetCookies = false; // Default to false for security
        
        console.log('Cookie consent header:', cookieConsent);
        
        if (cookieConsent) {
          try {
            const consent = JSON.parse(cookieConsent);
            console.log('Parsed consent:', consent);
            console.log('Necessary cookies enabled:', consent.preferences?.necessary);
            canSetCookies = consent.preferences?.necessary === true;
            console.log('Can set cookies:', canSetCookies);
          } catch (error) {
            console.warn('Failed to parse cookie consent header:', error);
            canSetCookies = false; // Explicitly set to false on parse error
          }
        } else {
          console.log('No cookie consent header provided - cookies disabled');
        }
        
        // Only set cookie if necessary cookies are allowed
        if (canSetCookies) {
          res.cookie('auth_token', result.access_token, {
            ...result.cookieOptions,
            sameSite: result.cookieOptions.sameSite as 'lax'
          });
          console.log('Authentication cookie set');
        } else {
          console.log('Necessary cookies not allowed - authentication cookie not set');
        }
    
    // Return user data (token is now in cookie if allowed)
    return {
      user: result.user,
      message: 'Login successful',
      cookieSet: canSetCookies,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Post('logout')
  async logout(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    // Clear the auth_token cookie
    res.clearCookie('auth_token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return { message: 'Logged out successfully' };
  }
} 