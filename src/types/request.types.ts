// src/types/request.types.ts
import { Request } from 'express';

export interface IRequestWithLang extends Request {
  i18nLang: string; // Add the i18nLang property
}
