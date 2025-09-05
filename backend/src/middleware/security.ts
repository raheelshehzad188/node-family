import rateLimit from 'express-rate-limit';
import { Express } from 'express';

export const registerSecurityMiddleware = (app: Express) => {
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
};

