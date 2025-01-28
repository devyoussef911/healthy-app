import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const user =
      req['user'] && req['user']['id']
        ? `User ID: ${req['user']['id']}`
        : 'Unauthenticated';

    res.on('finish', () => {
      const statusCode = res.statusCode;
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - ${user} - IP: ${ip}`,
      );
    });

    next();
  }
}
