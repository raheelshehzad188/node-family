import { Router } from 'express';
import axios from 'axios';
import { z } from 'zod';
import { requireRole } from './auth';

const glamBaseUrl = process.env.GLAM_API_BASE_URL || 'https://api.glam.ai/api/v1';
const glamApiKey = process.env.GLAM_API_KEY || '';

const tryOnSchema = z.object({
  mask_media_type: z.enum(['overall', 'upper', 'lower']).default('overall'),
  user: z.object({ url: z.string().url() }),
  garment: z.object({ url: z.string().url() }),
  options: z.record(z.string(), z.any()).optional(),
});

export const glamRouter = Router();

glamRouter.post('/tryon', requireRole(['admin', 'subadmin']), async (req, res) => {
  if (!glamApiKey) return res.status(500).json({ error: 'GLAM_API_KEY missing' });
  const parse = tryOnSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid request' });

  try {
    const response = await axios.post(
      `${glamBaseUrl}/tryon`,
      {
        mask_media_type: parse.data.mask_media_type,
        user: parse.data.user,
        garment: parse.data.garment,
        options: parse.data.options,
      },
      {
        headers: {
          'X-API-Key': glamApiKey,
          'Content-Type': 'application/json',
        },
        timeout: 60_000,
      }
    );
    res.json(response.data);
  } catch (err: any) {
    const status = err.response?.status || 500;
    res.status(status).json({ error: 'Glam API error', details: err.response?.data || err.message });
  }
});

glamRouter.post('/beautify', requireRole(['admin', 'subadmin']), async (req, res) => {
  if (!glamApiKey) return res.status(500).json({ error: 'GLAM_API_KEY missing' });
  try {
    const response = await axios.post(`${glamBaseUrl}/beautify`, req.body, {
      headers: { 'X-API-Key': glamApiKey, 'Content-Type': 'application/json' },
      timeout: 60_000,
    });
    res.json(response.data);
  } catch (err: any) {
    const status = err.response?.status || 500;
    res.status(status).json({ error: 'Glam API error', details: err.response?.data || err.message });
  }
});

