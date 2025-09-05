import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

import { createLogger } from './utils/logger';
import { registerSecurityMiddleware } from './middleware/security';
import { authRouter } from './routes/auth';
import { glamRouter } from './routes/glam';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const logger = createLogger();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan('combined'));
registerSecurityMiddleware(app);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/glam', glamRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

