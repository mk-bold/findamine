import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Request } from 'express';

export interface UserAgentInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: string;
  deviceModel: string;
}

export interface GeoLocationInfo {
  country?: string;
  region?: string;
  city?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private parseUserAgent(userAgent: string): UserAgentInfo {
    // Simple user agent parsing without external dependency
    const ua = userAgent.toLowerCase();
    
    let browser = 'Unknown';
    let browserVersion = 'Unknown';
    let os = 'Unknown';
    let osVersion = 'Unknown';
    let deviceType = 'desktop';
    let deviceModel = 'Unknown';

    // Detect browser
    if (ua.includes('chrome')) {
      browser = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.includes('firefox')) {
      browser = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.includes('safari')) {
      browser = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      if (match) browserVersion = match[1];
    } else if (ua.includes('edge')) {
      browser = 'Edge';
      const match = userAgent.match(/Edge\/(\d+)/);
      if (match) browserVersion = match[1];
    }

    // Detect OS
    if (ua.includes('windows')) {
      os = 'Windows';
      const match = userAgent.match(/Windows NT (\d+\.\d+)/);
      if (match) osVersion = match[1];
    } else if (ua.includes('mac os')) {
      os = 'macOS';
      const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
      if (match) osVersion = match[1].replace('_', '.');
    } else if (ua.includes('linux')) {
      os = 'Linux';
    } else if (ua.includes('android')) {
      os = 'Android';
      const match = userAgent.match(/Android (\d+\.\d+)/);
      if (match) osVersion = match[1];
    } else if (ua.includes('ios')) {
      os = 'iOS';
      const match = userAgent.match(/OS (\d+[._]\d+)/);
      if (match) osVersion = match[1].replace('_', '.');
    }

    // Detect device type
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    }

    return {
      browser,
      browserVersion,
      os,
      osVersion,
      deviceType,
      deviceModel,
    };
  }

  private getIpAddress(req: Request): string | undefined {
    // Check various headers for IP address
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip
    );
  }

  private async getGeoLocation(ipAddress: string): Promise<GeoLocationInfo> {
    try {
      // You can integrate with a service like MaxMind GeoIP2 or IP-API
      // For now, returning empty object
      // const response = await fetch(`http://ip-api.com/json/${ipAddress}`);
      // const data = await response.json();
      // return {
      //   country: data.country,
      //   region: data.regionName,
      //   city: data.city,
      // };
      return {};
    } catch (error) {
      return {};
    }
  }

  async recordLoginAttempt(
    req: Request,
    email: string,
    password: string,
    success: boolean,
    userId?: string,
  ): Promise<void> {
    try {
      const ipAddress = this.getIpAddress(req);
      const userAgent = req.headers['user-agent'];
      const userAgentInfo = userAgent ? this.parseUserAgent(userAgent) : {};
      const geoLocation = ipAddress ? await this.getGeoLocation(ipAddress) : {};

      // Hash the password for storage (never store plain text)
      const hashedPassword = await this.hashPassword(password);

      await this.prisma.loginAttempt.create({
        data: {
          userId,
          email,
          password: hashedPassword,
          success,
          ipAddress,
          userAgent,
          ...userAgentInfo,
          ...geoLocation,
        },
      });
    } catch (error) {
      // Log error but don't fail the login process
      console.error('Failed to record login attempt:', error);
    }
  }

  async recordPageView(
    req: Request,
    pageName: string,
    pageUrl: string,
    pageTitle?: string,
    userId?: string,
    sessionId?: string,
  ): Promise<void> {
    try {
      const ipAddress = this.getIpAddress(req);
      const userAgent = req.headers['user-agent'];
      const userAgentInfo = userAgent ? this.parseUserAgent(userAgent) : {};
      const geoLocation = ipAddress ? await this.getGeoLocation(ipAddress) : {};
      const referrer = req.headers.referer;

      await this.prisma.pageView.create({
        data: {
          userId,
          pageName,
          pageUrl,
          pageTitle,
          referrer,
          ipAddress,
          userAgent,
          ...userAgentInfo,
          ...geoLocation,
          sessionId,
        },
      });
    } catch (error) {
      // Log error but don't fail the page load
      console.error('Failed to record page view:', error);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    // Simple hash for now - in production, use bcrypt or similar
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async getLoginAttempts(
    userId?: string,
    email?: string,
    limit: number = 100,
  ) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (email) where.email = email;

    return this.prisma.loginAttempt.findMany({
      where,
      orderBy: { attemptedAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            gamerTag: true,
          },
        },
      },
    });
  }

  async getPageViews(
    userId?: string,
    pageName?: string,
    limit: number = 100,
  ) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (pageName) where.pageName = pageName;

    return this.prisma.pageView.findMany({
      where,
      orderBy: { viewedAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            gamerTag: true,
          },
        },
      },
    });
  }
}
