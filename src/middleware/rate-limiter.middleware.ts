import { Injectable, NestMiddleware } from '@nestjs/common';
import rateLimit from 'express-rate-limit';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes window
      max: 100, // Limit each IP to 100 requests per windowMs
      message: {
        statusCode: 429,
        message: 'Too many requests, please try again later.',
      },
      standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      keyGenerator: (req) => {
        // Customize key generator (e.g., by user role, IP, or API key)
        return req.ip; // Default: use IP address
      },
    });

    limiter(req, res, next);
  }
}
