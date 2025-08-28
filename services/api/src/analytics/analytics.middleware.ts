import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class AnalyticsMiddleware implements NestMiddleware {
  constructor(private analyticsService: AnalyticsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Track page views for all requests
    this.trackPageView(req, res);
    next();
  }

  private async trackPageView(req: Request, res: Response) {
    try {
      // Only track GET requests (page views)
      if (req.method !== 'GET') {
        return;
      }

      // Extract user ID from JWT token if available
      let userId: string | undefined;
      try {
        const token = req.cookies?.auth_token || 
                     req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
          // Decode JWT to get user ID (without verification for analytics)
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          userId = payload.sub;
        }
      } catch (error) {
        // Token parsing failed, continue without user ID
      }

      // Generate session ID if not exists
      let sessionId = req.cookies?.session_id;
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        res.cookie('session_id', sessionId, { 
          httpOnly: true, 
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
      }

      // Extract page information
      const pageName = req.route?.path || req.path;
      const pageUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      const pageTitle = req.headers['x-page-title'] as string;

      // Record page view asynchronously (don't block the request)
      this.analyticsService.recordPageView(
        req,
        pageName,
        pageUrl,
        pageTitle,
        userId,
        sessionId
      ).catch(error => {
        console.error('Failed to record page view:', error);
      });
    } catch (error) {
      // Don't let analytics errors affect the main request
      console.error('Analytics middleware error:', error);
    }
  }
}
