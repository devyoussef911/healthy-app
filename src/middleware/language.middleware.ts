import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { IRequestWithLang } from '../types/request.types'; // Import the custom interface
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  constructor(private readonly i18n: I18nService) {}

  use(req: IRequestWithLang, res: Response, next: NextFunction) {
    const lang = req.params.lang || 'en'; // Default to 'en' if no language is specified
    req.i18nLang = lang; // Attach the language to the request object
    next();
  }
}
